<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repositories\MemoCairRepo;
use App\Repositories\MakRepo;
use App\Repositories\PengaturanRepo;
use App\Models\MemoCairModel;
use App\Models\SpjModel;
use App\Models\TorModel;
use App\Models\KelompokBelanjaModel;
use App\Services\WablasService;

class MemoCairController extends Controller
{

        public function add(Request $request)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (Gate::denies('memo_cair_pic_ajukan', $login_data) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        // PIC KEGIATAN TOR VALIDATION
        $tor_id = $req['tor_id'] ?? null;
        $tor = null;
        if ($tor_id) {
            $tor = TorModel::with("kegiatan_detail")->find($tor_id);
        }
        
        if (!$tor && !empty($req['kegiatan_detail_id'])) {
            $tor = TorModel::with("kegiatan_detail")->where('kegiatan_detail_id', $req['kegiatan_detail_id'])->first();
            if ($tor) {
                $tor_id = $tor->id;
            }
        }

        if (isset($tor)) {
            // Check TOR status
            if ($tor['status_ajuan'] != "wakil_dekan_applied" && !$login_data->checkIsAdmin()) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Status TOR belum disetujui Wakil Dekan. Silakan tunggu persetujuan TOR terlebih dahulu."
                ], 400);
            }

            if (!$login_data->checkIsAdmin() && in_array("specific_pic", $login_data['permissions'] ?? []) && ($tor['kegiatan_detail']['pic_kegiatan'] ?? 0) != $login_data['id']) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Anda bukan PIC untuk kegiatan ini."
                ], 400);
            }
        } else {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Data TOR untuk kegiatan ini belum ditemukan. Pastikan data TOR sudah dibuat dan disetujui."
            ], 400);
        }

        // MEMO CAIR PENDING CHECK
        $memo_cair_pending = MemoCairModel::where("tor_id", $tor_id)->where("status_ajuan", "sent")->first();
        if (isset($memo_cair_pending)) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Masih ada pengajuan memo cair sebelumnya yang berstatus 'Menunggu Validasi Keuangan'. Harap tunggu validasi keuangan selesai."
            ], 400);
        }

        // SANITIZE & FILTER ACTIVE RAB ITEMS
        $raw_rab = $req['rab'] ?? [];
        $active_rab = [];
        $total_input_bruto = 0;
        $total_input_pajak = 0;
        $total_input_plus_pajak = 0;

        foreach ($raw_rab as $idx => $item) {
            $freq = (float) ($item['frekuensi'] ?? 0);
            $vol = (float) ($item['volume'] ?? 0);
            $harga = (float) ($item['harga_satuan'] ?? 0);
            $pajak = (float) ($item['pajak'] ?? 0);

            if ($freq > 0 && $vol > 0 && $harga > 0) {
                $subtotal = $freq * $vol * $harga;
                $nom_pajak = ($pajak / 100) * $subtotal;
                $total_input_bruto += $subtotal;
                $total_input_pajak += $nom_pajak;
                $total_input_plus_pajak += ($subtotal + $nom_pajak);

                $kelompok_id = $item['kelompok_belanja_id'] ?? null;
                if (!$kelompok_id) {
                    $defaultKelompok = KelompokBelanjaModel::first();
                    $kelompok_id = $defaultKelompok ? $defaultKelompok->id : 1;
                }

                $active_rab[] = [
                    'kelompok_belanja_id'   => (string) $kelompok_id,
                    'nama_kelompok_belanja' => $item['nama_kelompok_belanja'] ?? 'Belanja Bahan/Operasional',
                    'kode_item'             => $item['kode_item'] ?? ('ITEM-' . ($idx + 1) . '-' . time()),
                    'keterangan'            => $item['keterangan'] ?? 'Item Belanja',
                    'frekuensi'             => $freq,
                    'volume'                => $vol,
                    'satuan'                => $item['satuan'] ?? 'Paket',
                    'harga_satuan'          => $harga,
                    'pajak'                 => $pajak
                ];
            }
        }

        // VALIDATION MEMO CAIR 0
        if ($total_input_plus_pajak <= 0 || count($active_rab) === 0) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Nominal ajuan tidak boleh Rp 0. Masukkan minimal 1 item belanja yang ingin dicairkan."
            ], 400);
        }

        // VALIDASI SISA PAGU: TOTAL ANGGARAN = (VOLUME X FREKUENSI X HARGA SATUAN) + PAJAK
        $total_pagu_tor = 0;
        if (!empty($tor['kegiatan_detail']['biaya'])) {
            $total_pagu_tor = (float) $tor['kegiatan_detail']['biaya'];
        }
        if ($total_pagu_tor <= 0 && !empty($tor['rab'])) {
            $tor_rab_list = is_string($tor['rab']) ? json_decode($tor['rab'], true) : $tor['rab'];
            foreach ($tor_rab_list ?? [] as $r) {
                $freq = (float) ($r['frekuensi'] ?? 0);
                $vol = (float) ($r['volume'] ?? 0);
                $harga = (float) ($r['harga_satuan'] ?? 0);
                $pjk = (float) ($r['pajak'] ?? 0);
                $sub = $freq * $vol * $harga;
                $nom = ($pjk / 100) * $sub;
                $total_pagu_tor += ($sub + $nom);
            }
        }

        $approved_memo_cairs = MemoCairModel::where("tor_id", $tor_id)
            ->whereIn("status_ajuan", ["keuangan_applied", "terbayar"])
            ->get();
        $total_memo_cair_used = 0;
        foreach ($approved_memo_cairs as $mc) {
            if (!empty($mc->rab)) {
                $mc_rab_list = is_string($mc->rab) ? json_decode($mc->rab, true) : $mc->rab;
                foreach ($mc_rab_list ?? [] as $mcr) {
                    $f = (float) ($mcr['frekuensi'] ?? 0);
                    $v = (float) ($mcr['volume'] ?? 0);
                    $h = (float) ($mcr['harga_satuan'] ?? 0);
                    $p = (float) ($mcr['pajak'] ?? 0);
                    $s = $f * $v * $h;
                    $np = ($p / 100) * $s;
                    $total_memo_cair_used += ($s + $np);
                }
            } else {
                $total_memo_cair_used += (float) ($mc->total_rab ?? 0);
            }
        }

        $sisa_pagu_available = max(0, $total_pagu_tor - $total_memo_cair_used);

        // Toleransi selisih pembulatan 1000 rupiah
        if ($total_input_plus_pajak > ($sisa_pagu_available + 1000)) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Pengajuan Ditolak: Total usulan yang diajukan (+pajak) (Rp " . number_format($total_input_plus_pajak, 0, ',', '.') . ") melebihi sisa pagu anggaran TOR yang tersedia (Rp " . number_format($sisa_pagu_available, 0, ',', '.') . ")."
            ], 400);
        }

        // SUCCESS INSERT
        $memo_cair_id="";
        $tipe_pencairan = ($req['tipe_pencairan'] ?? '') === 'pk' ? 'pk' : 'normal';
        $count_existing = MemoCairModel::where('tor_id', $tor_id)->count();
        $termin_ke = $count_existing + 1;

        DB::transaction(function() use ($tor_id, $active_rab, $total_input_plus_pajak, $tipe_pencairan, $termin_ke, &$memo_cair_id) {
            $data_update = [
                'tor_id'            => $tor_id,
                'status_ajuan'      => "sent",
                'status_spj'        => "closed",
                'tipe_pencairan'    => $tipe_pencairan,
                'termin_ke'         => $termin_ke,
                'status_pembayaran_pk' => ($tipe_pencairan === 'pk') ? 'menunggu_validasi' : null,
                'catatan_keuangan'  => "",
                'catatan_keuangan_spj' => "",
                'rab'               => $active_rab,
                'total_rab'         => $total_input_plus_pajak
            ];

            $memo_cair=MemoCairModel::create($data_update);
            $memo_cair_id=$memo_cair->id;
        });
        
        //jobs
        $wablas = new WablasService();
        $result = $wablas->send_submit_memo_cair($request, $memo_cair_id);

        return response()->json([
            'status' => "ok",
            'message' => "Pengajuan memo cair berhasil dikirim."
        ]);
    }

    public function validasi_keuangan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('memo_cair_keuangan_validasi', $login_data) && Gate::denies('spj_keuangan_validasi', $login_data) && !in_array($login_data->role, ['verifikator_spj', 'bendahara', 'superadmin'])) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=MemoCairModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["sent", "keuangan_applied"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Status memo cair ini tidak dapat diubah lagi."
            ], 400);
        }


        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:keuangan_applied,keuangan_rejected,terbayar",
            'catatan_keuangan'  =>"nullable",
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //VALIDATION APPLIED 2
        $data_rab_spj = null;
        $kelompok_belanja = null;

        if($req['status_ajuan'] == "keuangan_applied"){
            $kelompok_belanja = KelompokBelanjaModel::get()->keyBy('id');
            $validKelompokIds = $kelompok_belanja->pluck('id')->toArray();

            $data_rab_spj = collect($id_data['rab'])
                ->groupBy('kelompok_belanja_id')
                ->map(function($items, $key) use ($kelompok_belanja) {
                    $kelompokData = $kelompok_belanja->get($key);
                    
                    // Parse lampiran
                    $lampiran = $kelompokData->lampiran ?? null;
                    if (is_string($lampiran)) {
                        $lampiran = json_decode($lampiran, true);
                    }

                    $new_lampiran=[];
                    if (is_array($lampiran)) {
                        foreach ($lampiran as $lamp) {
                            $new_lampiran[] = array_merge($lamp, [
                                'file'  =>""
                            ]);
                        }
                    }
                    
                    return [
                        'kelompok_belanja_id' => $key,
                        'kelompok_belanja_nama' => $kelompokData->nama ?? null,
                        'kelompok_belanja_kode' => $kelompokData->kode ?? null,
                        'kwitansi_tipe'         =>$kelompokData->kwitansi_tipe ?? null,
                        'kwitansi_pajak'        =>$kelompokData->kwitansi_pajak ?? null,
                        'lampiran' => $new_lampiran,
                        'items' => $items->map(function($item) {
                            return $item;
                        })->toArray()
                    ];
                })
                ->values()
                ->toArray();

            // Validasi kelompok_belanja_id
            $invalidGroups = collect($data_rab_spj)
                ->filter(function($group) use ($validKelompokIds) {
                    return !in_array($group['kelompok_belanja_id'], $validKelompokIds);
                })
                ->pluck('kelompok_belanja_id')
                ->toArray();

            if (!empty($invalidGroups)) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Data Kelompok Belanja telah dihapus, hubungi administrator."
                ], 400);
            }
        }


        //SUCCESS
        DB::transaction(function()use($req, $id, $data_rab_spj, $kelompok_belanja, $id_data){
            $data_update=[];
            $pengaturan=PengaturanRepo::gets();
            $tor=TorModel::with("kegiatan_detail")->find($id_data['tor_id']);
            
            if(isset($req['status_ajuan'])){
                $data_update['status_ajuan']=$req['status_ajuan'];
                if($req['status_ajuan']=="keuangan_applied"){
                    $data_update['status_spj']="draft";

                    //generate spj
                    foreach($data_rab_spj as $spj){
                        $jumlah_uang=0;
                        foreach($spj['items'] as $list){
                            $jumlah_uang+=(($list['harga_satuan']*$list['volume']*$list['frekuensi']) + ($list['pajak']/100*($list['harga_satuan']*$list['volume']*$list['frekuensi'])));
                        }
                        
                        $bendahara_id = (isset($pengaturan['bendahara']) && is_numeric($pengaturan['bendahara']) && \App\Models\User::where('id', $pengaturan['bendahara'])->exists()) ? (int)$pengaturan['bendahara'] : null;
                        $pic_id = (isset($tor['kegiatan_detail']['pic_kegiatan']) && \App\Models\User::where('id', $tor['kegiatan_detail']['pic_kegiatan'])->exists()) ? (int)$tor['kegiatan_detail']['pic_kegiatan'] : null;

                        SpjModel::create([
                            'memo_cair_id'          =>$id,
                            'kelompok_belanja_id'   =>$spj['kelompok_belanja_id'],
                            'no_kwitansi'           =>"",
                            'sudah_diterima_dari'   =>"",
                            'jumlah_uang'           =>$jumlah_uang,
                            'untuk_pembayaran'      =>"",
                            'penerima_id'           =>null,
                            'bendahara_id'          =>$bendahara_id,
                            'pic_id'                =>$pic_id,
                            'kuasa_pengguna_anggaran_id'=>null,
                            'rab'                   =>$spj['items'],
                            'lampiran'              =>$spj['lampiran'],
                            'file_spj'              =>"",
                            'data'                  =>$spj['kwitansi_tipe']=="transport"?['penerima'=>[]]:(object)[]
                        ]);
                    }
                }
            }
            if(isset($req['catatan_keuangan'])){
                $data_update['catatan_keuangan']=$req['catatan_keuangan'];
            }
            if(isset($req['bukti_bayar'])){
                $data_update['bukti_bayar']=$req['bukti_bayar'];
            }
            if(isset($req['catatan_pembayaran'])){
                $data_update['catatan_pembayaran']=$req['catatan_pembayaran'];
            }
            if(($req['status_ajuan'] ?? '') === 'terbayar'){
                $data_update['tgl_bayar']=now();
                if (($id_data['tipe_pencairan'] ?? '') === 'pk') {
                    $data_update['status_pembayaran_pk'] = 'cair';
                    $data_update['tgl_cair_pk'] = now();
                    $data_update['status_spj'] = 'draft'; // Form upload SPJ PK aktif bagi PIC
                }
            }

            MemoCairModel::find($id)->update($data_update);
        });
        
        //jobs
        $wablas = new WablasService();
        if($req['status_ajuan']=="keuangan_applied"){
            $result = $wablas->send_approve_memo_cair_keuangan($request, $id);
        }
        elseif($req['status_ajuan']=="keuangan_rejected"){
            $result = $wablas->send_reject_memo_cair_keuangan($request, $id);
        }

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function ajukan_spj(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('spj_pic_ajukan', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=MemoCairModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //PIC KEGIATAN TOR VALIDATION
        $tor_id=$id_data['tor_id'];
        $tor=TorModel::with("kegiatan_detail")->find($tor_id);
        if(isset($tor)){
            if($tor['status_ajuan']!="wakil_dekan_applied"){
                return response()->json([
                    'error' =>"VALIDATION_ERROR",
                    'data'  =>"Bad request."
                ], 400);
            }

            if(in_array("specific_pic", $login_data['permissions']) && $tor['kegiatan_detail']['pic_kegiatan']!=$login_data['id'])
            {
                return response()->json([
                    'error' =>"VALIDATION_ERROR",
                    'data'  =>"Bad request."
                ], 400);
            }
        }

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["keuangan_applied"]) || in_array($id_data['status_spj'], ["sent", "keuangan_applied"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Pengajuan SPJ sudah diajukan atau sudah disetujui."
            ], 400);
        }

        //VALIDATION FILE SPJ
        $spj=SpjModel::where("memo_cair_id", $id)->get();

        $found=true;
        foreach($spj as $val){
            if(empty($val['file_spj'])){
                $found=false;
                break;
            }
        }
        if(!$found){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Mohon unggah berkas Dokumen SPJ Utama (.pdf) terlebih dahulu sebelum mengajukan ke Keuangan."
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            $data_update=['status_spj'=>"sent", 'catatan_keuangan_spj'=>""];

            MemoCairModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_keuangan_spj(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('spj_keuangan_validasi', $login_data) && !in_array($login_data->role, ['koordinator', 'verifikator_spj', 'keuangan', 'bendahara', 'superadmin', 'admin']) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=MemoCairModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["keuangan_applied"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION FILE SPJ
        $spj=SpjModel::where("memo_cair_id", $id)->get();

        $found=true;
        foreach($spj as $val){
            if($val['file_spj']==""){
                $found=false;
                break;
            }
        }
        if(!$found){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"File SPJ Belum diupload."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'status_spj'      =>"required|in:keuangan_applied,keuangan_revisi",
            'catatan_keuangan_spj'  =>"present"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            $data_update=[];
            
            $data_update['catatan_keuangan_spj']=$req['catatan_keuangan_spj'];
            $data_update['status_spj']=$req['status_spj'];

            MemoCairModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function delete(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'superadmin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=MemoCairModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            MemoCairModel::find($id)->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION ID
        $id_data=MemoCairModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        $data=MemoCairRepo::get($id);

        return response()->json([
            'data'      =>$data
        ]);
    }

    public function gets(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1",
            'q'             =>"nullable",
            'tor_id'        =>"nullable",
            'status_ajuan'  =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=MemoCairRepo::gets($req, $login_data);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }
}
