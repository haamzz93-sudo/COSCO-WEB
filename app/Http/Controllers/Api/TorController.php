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
use App\Repositories\TorRepo;
use App\Models\TorModel;
use App\Models\KelompokBelanjaModel;
use App\Repositories\PengaturanRepo;
use App\Repositories\MakRepo;
use App\Repositories\KelompokBelanjaRepo;
use App\Services\WablasService;

class TorController extends Controller
{

     public function add(Request $request)
     {
         $login_data=$request->user();
         $req=$request->all();

         //ROLE AUTHENTICATION
         if(!in_array($login_data['role'], ['admin'])){
             return response('Not Allowed.', 403);
         }

         //VALIDATION
         $validation=Validator::make($req, [
             'kegiatan_detail_id'=>"required|exists:App\Models\KegiatanDetailModel,id",
             'program_studi_id'  =>"required|exists:App\Models\ProgramStudiModel,id",
             'tahun'             =>"required|integer",
             'iku_id'            =>"required|exists:App\Models\IkuModel,id",
             'ik_id'             =>"required|exists:App\Models\IkModel,id",
             'p_id'              =>"required|exists:App\Models\PModel,id",
             'judul_kegiatan'    =>"required"
         ]);
         if($validation->fails()){
             return response()->json([
                 'error' =>"VALIDATION_ERROR",
                 'data'  =>$validation->errors()->first()
             ], 400);
         }

         //SUCCESS
         DB::transaction(function()use($req){
             TorModel::create([
                 'kegiatan_detail_id'=>$req['kegiatan_detail_id'],
                 'program_studi_id'  =>$req['program_studi_id'],
                 'tahun'             =>$req['tahun'],
                 'iku_id'            =>$req['iku_id'],
                 'ik_id'             =>$req['ik_id'],
                 'p_id'              =>$req['p_id'],
                 'judul_kegiatan'    =>$req['judul_kegiatan'],
                 'latar_belakang'    =>"",
                 'rasionalisasi'     =>"",
                 'tujuan'            =>"",
                 'mekanisme_dan_rancangan'   =>[],
                 'jadwal_pelaksanaan'=>[
                     'tahun' =>"",
                     'data'  =>[]
                 ],
                 'iku_detail'        =>[
                     'realisasi'=>[
                         'tahun' =>$req['tahun']-1,
                         'nilai' =>""
                     ],
                     'target'   =>[
                         'tahun' =>$req['tahun'],
                         'nilai' =>""
                     ]              
                 ],
                 'ik_detail'         =>[
                     'realisasi'=>[
                         'tahun' =>$req['tahun']-1,
                         'nilai' =>""
                     ],
                     'target'   =>[
                         'tahun' =>$req['tahun'],
                         'nilai' =>""
                     ]              
                 ],
                 'keberlanjutan'     =>"",
                 'penanggung_jawab'  =>[],
                 'status_ajuan'      =>"draft",
                 'catatan_koordinator'=>"",
                 'catatan_wakil_dekan'=>""
             ]);
         });

         return response()->json([
             'status'=>"ok"
         ]);
     }

    public function update(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('tor_pic_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=TorModel::find($id);
        if(!isset($id_data)){
            $id_data=TorModel::where('kegiatan_detail_id', $id)->first();
        }
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Data TOR tidak ditemukan."
            ], 400);
        }
        $id = $id_data->id;

        //PIC KEGIATAN TOR VALIDATION
        $tor_id=$id;
        $tor=TorModel::with("kegiatan_detail")->find($tor_id);
        $isAdmin = $login_data->checkIsAdmin() || ($login_data->role === 'admin') || ($login_data->role === 'superadmin');
        if(isset($tor)){
            if(!$isAdmin && in_array("specific_pic", $login_data['permissions']) && $tor['kegiatan_detail']['pic_kegiatan'] != $login_data['id'])
            {
                return response()->json([
                    'error' =>"VALIDATION_ERROR",
                    'data'  =>"Hanya PIC kegiatan ini yang dapat mengubah dokumen TOR."
                ], 400);
            }
        }

        //VALIDATION APPLIED (Admins can always update)
        if(!$isAdmin && !in_array($id_data['status_ajuan'], ["draft", "koordinator_revisi", "keuangan_revisi", "wakil_dekan_revisi", "koordinator_rejected", "keuangan_rejected", "wakil_dekan_rejected"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Dokumen sedang dalam tahap verifikasi/persetujuan."
            ], 400);
        }

        //VALIDATION
        // draft,sent,koordinator_applied,koordinator_revisi,wakil_dekan_applied,wakil_dekan_revisi
        $rules = [
            'program_studi_id'  =>"nullable|exists:App\Models\ProgramStudiModel,id",
            'tahun'             =>"nullable|integer",
            'iku_id'            =>"nullable|exists:App\Models\IkuModel,id",
            'ik_id'             =>"nullable|exists:App\Models\IkModel,id",
            'p_id'              =>"nullable|exists:App\Models\PModel,id",
            'judul_kegiatan'    =>"nullable",
            'latar_belakang'    =>"nullable",
            'rasionalisasi'     =>"nullable",
            'tujuan'            =>"nullable",
            'mekanisme_dan_rancangan'   =>"nullable",
            'jadwal_pelaksanaan'=>"nullable",
            'iku_detail'        =>"nullable",
            'ik_detail'         =>"nullable",
            'keberlanjutan'     =>"nullable",
            'penanggung_jawab'  =>"nullable",
            'rab'               =>'nullable|array'
        ];

        $kategori_kegiatan = $tor['kegiatan_detail']['kategori_kegiatan'] ?? 'kegiatan';

        if (isset($req['rab']) && is_array($req['rab']) && count($req['rab']) > 0 && !in_array($kategori_kegiatan, ['bhp', 'inventaris'])) {
            // SINKRONISASI OTOMATIS: Jika ada master kelompok belanja, sinkronkan pajak dengan master terbaru
            foreach ($req['rab'] as $idx => $item) {
                if (!empty($item['kelompok_belanja_id'])) {
                    $kb = KelompokBelanjaModel::find($item['kelompok_belanja_id']);
                    if ($kb && isset($kb->kwitansi_pajak)) {
                        $req['rab'][$idx]['pajak'] = (float)$kb->kwitansi_pajak;
                    }
                }
            }

            $rules['rab.*.kelompok_belanja_id'] = "required|exists:App\Models\KelompokBelanjaModel,id";
            $rules['rab.*.nama_kelompok_belanja'] = "required|string";
            $rules['rab.*.kode_item'] = 'required|string|distinct';
            $rules['rab.*.keterangan'] = 'required|string';
            $rules['rab.*.frekuensi'] = 'required|numeric|min:1';
            $rules['rab.*.volume'] = 'required|numeric|min:1';
            $rules['rab.*.satuan'] = 'required|string';
            $rules['rab.*.harga_satuan'] = 'required|numeric|min:0';
            $rules['rab.*.pajak'] = 'required|numeric|min:0';
        }

        $validation=Validator::make($req, $rules, [
            'rab.*.kelompok_belanja_id.required' => 'Jenis belanja wajib dipilih pada setiap baris item.',
            'rab.*.kelompok_belanja_id.exists'   => 'Jenis belanja yang dipilih tidak valid di master data.',
            'rab.*.keterangan.required'          => 'Keterangan rincian belanja wajib diisi.',
            'rab.*.volume.required'              => 'Volume item belanja wajib diisi minimal 1.',
            'rab.*.frekuensi.required'           => 'Frekuensi item belanja wajib diisi minimal 1.',
            'rab.*.harga_satuan.required'        => 'Harga satuan item belanja wajib diisi.',
            'rab.*.harga_satuan.min'             => 'Harga satuan tidak boleh bernilai negatif.',
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //VALIDATION RAB BIAYA
        $total_rab = $id_data['total_rab'] ?? 0;
        if(isset($req['rab'])){
            $total_rab=0;
            if (in_array($kategori_kegiatan, ['bhp', 'inventaris'])) {
                foreach($req['rab'] as $item){
                    $tot = isset($item['total']) ? floatval($item['total']) : (floatval($item['jumlah'] ?? 0) * floatval($item['harga_pajak'] ?? 0));
                    $total_rab += $tot;
                }
            } else {
                foreach($req['rab'] as $item){
                    $vol = floatval($item['volume'] ?? 0);
                    $hrg = floatval($item['harga_satuan'] ?? 0);
                    $frq = floatval($item['frekuensi'] ?? 0);
                    $pjk = floatval($item['pajak'] ?? 0);
                    $sub = $vol * $hrg * $frq;
                    $total_rab += ($sub + ($pjk / 100 * $sub));
                }
            }

            if($tor['kegiatan_detail']['biaya']<$total_rab){
                return response()->json([
                    'error' =>"VALIDATION_ERROR",
                    'data'  =>"Total anggaran (" . number_format($total_rab, 0, ',', '.') . ") tidak boleh melebihi plafon pagu biaya (" . number_format($tor['kegiatan_detail']['biaya'], 0, ',', '.') . ")."
                ], 400);
            }
        }

        //SUCCESS
        DB::transaction(function()use($req, $id, $total_rab){
            $data_update=[];
            if(isset($req['program_studi_id'])){
                $data_update['program_studi_id']=$req['program_studi_id'];
            }
            if(isset($req['tahun'])){
                $data_update['tahun']=$req['tahun'];
            }
            if(isset($req['iku_id'])){
                $data_update['iku_id']=$req['iku_id'];
            }
            if(isset($req['ik_id'])){
                $data_update['ik_id']=$req['ik_id'];
            }
            if(isset($req['p_id'])){
                $data_update['p_id']=$req['p_id'];
            }
            if(isset($req['judul_kegiatan'])){
                $data_update['judul_kegiatan']=$req['judul_kegiatan'];
            }
            if(isset($req['latar_belakang'])){
                $data_update['latar_belakang']=$req['latar_belakang'];
            }
            if(isset($req['rasionalisasi'])){
                $data_update['rasionalisasi']=$req['rasionalisasi'];
            }
            if(isset($req['tujuan'])){
                $data_update['tujuan']=$req['tujuan'];
            }
            if(isset($req['mekanisme_dan_rancangan'])){
                $data_update['mekanisme_dan_rancangan']=$req['mekanisme_dan_rancangan'];
            }
            if(isset($req['jadwal_pelaksanaan'])){
                $jp_up = $req['jadwal_pelaksanaan'];
            if (is_array($jp_up) && (!isset($jp_up['tahun']) || $jp_up['tahun'] === "")) {
                $jp_up['tahun'] = (string)($req['tahun'] ?? $id_data->tahun ?? $tor['kegiatan_detail']['tahun'] ?? date('Y'));
            }
            $data_update['jadwal_pelaksanaan']=$jp_up;
            }
            if(isset($req['iku_detail'])){
                $data_update['iku_detail']=$req['iku_detail'];
            }
            if(isset($req['ik_detail'])){
                $data_update['ik_detail']=$req['ik_detail'];
            }
            if(isset($req['keberlanjutan'])){
                $data_update['keberlanjutan']=$req['keberlanjutan'];
            }
            if(isset($req['penanggung_jawab'])){
                $data_update['penanggung_jawab']=$req['penanggung_jawab'];
            }
            if(isset($req['rab'])){
                $data_update['rab']=$req['rab'];
                $data_update['total_rab']=$total_rab;

                // SINKRONISASI OTOMATIS: Jika ada rujukan kegiatan_detail_id, otomatis update pagu biaya
                if ($total_rab > 0 && !empty($id_data->kegiatan_detail_id)) {
                    \Illuminate\Support\Facades\DB::table('kegiatan_details')
                        ->where('id', $id_data->kegiatan_detail_id)
                        ->update(['biaya' => $total_rab]);
                }
            }

            TorModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }
    
    public function ajukan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('tor_pic_ajukan', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=TorModel::with("kegiatan_detail")->find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //PIC KEGIATAN TOR VALIDATION
        $tor_id=$id;
        $tor=TorModel::with("kegiatan_detail")->find($tor_id);
        if(isset($tor)){
            $isAdmin = $login_data->checkIsAdmin() || ($login_data->role === 'admin') || ($login_data->role === 'superadmin');
            if(!$isAdmin && in_array("specific_pic", $login_data['permissions']) && $tor['kegiatan_detail']['pic_kegiatan'] != $login_data['id'])
            {
                return response()->json([
                    'error' =>"VALIDATION_ERROR",
                    'data'  =>"Hanya PIC kegiatan ini yang dapat mengubah dokumen TOR."
                ], 400);
            }
        }

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["draft", "koordinator_revisi", "wakil_dekan_revisi", "keuangan_revisi"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION RAB 0
        if($id_data['total_rab']<=0){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION RAB > BIAYA
        if($id_data['total_rab']>$id_data['kegiatan_detail']['biaya']){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION FIELD
        $data=$id_data;
        $kategori_kegiatan = strtolower($id_data['kegiatan_detail']['kategori_kegiatan'] ?? 'kegiatan');
        $is_hps = in_array($kategori_kegiatan, ['bhp', 'inventaris']);

        // 3. Validasi rab (array > 1) - WAJIB UNTUK SEMUA (KEGIATAN & HPS)
        if (!isset($data['rab']) || !is_array($data['rab'])) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Rab harus berupa array'
            ], 400);
        }
        
        if (count($data['rab']) < 1) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Daftar item usulan RAB / HPS harus memiliki minimal 1 item'
            ], 400);
        }

        // VALIDASI KHUSUS TOR KEGIATAN REGULAR (HPS BHP & INVENTARIS TIDAK MEMERLUKAN KAK/LATAR BELAKANG)
        if (!$is_hps) {
            // 1. Validasi string required
            $stringFields = [
                'latar_belakang' => 'Latar Belakang',
                'rasionalisasi' => 'Rasionalisasi',
                'tujuan' => 'Tujuan',
                'keberlanjutan' => 'Keberlanjutan'
            ];
            
            foreach ($stringFields as $field => $label) {
                if (!isset($data[$field]) || $data[$field] === "") {
                    return response()->json([
                        'error' => 'VALIDATION_ERROR',
                        'data' => $label . " wajib diisi (tidak boleh kosong)"
                    ], 400);
                }
            }
            
            // 2. Validasi mekanisme_dan_rancangan (array > 1)
            if (!isset($data['mekanisme_dan_rancangan']) || !is_array($data['mekanisme_dan_rancangan'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Mekanisme Dan Rancangan harus berupa array'
                ], 400);
            }
            
            if (count($data['mekanisme_dan_rancangan']) < 1) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Mekanisme Dan Rancangan harus memiliki minimal 1 item'
                ], 400);
            }
            
            // 4. Validasi jadwal_pelaksanaan
            if (!isset($data['jadwal_pelaksanaan']) || !is_array($data['jadwal_pelaksanaan'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Jadwal Pelaksanaan harus berupa object'
                ], 400);
            }
            
            // 4a. Auto-Fallback & Validasi jadwal_pelaksanaan.tahun
            if (!isset($data['jadwal_pelaksanaan']['tahun']) || $data['jadwal_pelaksanaan']['tahun'] === "") {
                $fallback_tahun = (string)($id_data->tahun ?? $id_data->kegiatan_detail->tahun ?? date('Y'));
                if (!empty($fallback_tahun)) {
                    $jp = $data['jadwal_pelaksanaan'];
                    $jp['tahun'] = $fallback_tahun;
                    $id_data->jadwal_pelaksanaan = $jp;
                    $id_data->save();
                    $data['jadwal_pelaksanaan'] = $jp;
                } else {
                    return response()->json([
                        'error' => 'VALIDATION_ERROR',
                        'data' => 'Tahun pada Jadwal Pelaksanaan wajib diisi (tidak boleh kosong)'
                    ], 400);
                }
            }
            
            // 4b. Validasi jadwal_pelaksanaan.data
            if (!isset($data['jadwal_pelaksanaan']['data']) || !is_array($data['jadwal_pelaksanaan']['data'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Data pada Jadwal Pelaksanaan harus berupa array'
                ], 400);
            }
            
            if (count($data['jadwal_pelaksanaan']['data']) < 1) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Data pada Jadwal Pelaksanaan harus memiliki minimal 1 item'
                ], 400);
            }
            
            // 5. Validasi khusus: mekanisme_dan_rancangan = jadwal_pelaksanaan
            $mekanismeCount = count($data['mekanisme_dan_rancangan']);
            $jadwalCount = count($data['jadwal_pelaksanaan']['data']);
            
            if ($mekanismeCount !== $jadwalCount) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => "Jumlah item Mekanisme Dan Rancangan ({$mekanismeCount}) harus sama dengan jumlah item Data pada Jadwal Pelaksanaan ({$jadwalCount})"
                ], 400);
            }
            
            // 6. Validasi iku_detail
            if (!isset($data['iku_detail']) || !is_array($data['iku_detail'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Iku Detail harus berupa object'
                ], 400);
            }
            
            // 6a. Validasi iku_detail.realisasi
            if (!isset($data['iku_detail']['realisasi']) || !is_array($data['iku_detail']['realisasi'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Realisasi pada Iku Detail harus berupa object'
                ], 400);
            }
            
            if (!isset($data['iku_detail']['realisasi']['tahun']) || $data['iku_detail']['realisasi']['tahun'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Tahun Realisasi pada Iku Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            if (!isset($data['iku_detail']['realisasi']['nilai']) || $data['iku_detail']['realisasi']['nilai'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Nilai Realisasi pada Iku Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            // 6b. Validasi iku_detail.target
            if (!isset($data['iku_detail']['target']) || !is_array($data['iku_detail']['target'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Target pada Iku Detail harus berupa object'
                ], 400);
            }
            
            if (!isset($data['iku_detail']['target']['tahun']) || $data['iku_detail']['target']['tahun'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Tahun Target pada Iku Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            if (!isset($data['iku_detail']['target']['nilai']) || $data['iku_detail']['target']['nilai'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Nilai Target pada Iku Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            // 7. Validasi ik_detail (sama seperti iku_detail)
            if (!isset($data['ik_detail']) || !is_array($data['ik_detail'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Ik Detail harus berupa object'
                ], 400);
            }
            
            // 7a. Validasi ik_detail.realisasi
            if (!isset($data['ik_detail']['realisasi']) || !is_array($data['ik_detail']['realisasi'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Realisasi pada Ik Detail harus berupa object'
                ], 400);
            }
            
            if (!isset($data['ik_detail']['realisasi']['tahun']) || $data['ik_detail']['realisasi']['tahun'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Tahun Realisasi pada Ik Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            if (!isset($data['ik_detail']['realisasi']['nilai']) || $data['ik_detail']['realisasi']['nilai'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Nilai Realisasi pada Ik Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            // 7b. Validasi ik_detail.target
            if (!isset($data['ik_detail']['target']) || !is_array($data['ik_detail']['target'])) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Target pada Ik Detail harus berupa object'
                ], 400);
            }
            
            if (!isset($data['ik_detail']['target']['tahun']) || $data['ik_detail']['target']['tahun'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Tahun Target pada Ik Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
            
            if (!isset($data['ik_detail']['target']['nilai']) || $data['ik_detail']['target']['nilai'] === "") {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'data' => 'Nilai Target pada Ik Detail wajib diisi (tidak boleh kosong)'
                ], 400);
            }
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:sent,koordinator_applied,keuangan_applied"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            $data_update=[
                'catatan_koordinator'=>"",
                'catatan_wakil_dekan'=>"",
                'catatan_keuangan'  =>"",
                'wakil_dekan_id'    =>null
            ];
            
            if(isset($req['status_ajuan'])){
                $data_update['status_ajuan']=$req['status_ajuan'];
            }

            TorModel::find($id)->update($data_update);
        });
        
        //jobs
        $wablas = new WablasService();
        $result = $wablas->send_submit_tor_to_koordinator($request, $tor_id);

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_koordinator(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('tor_koordinator_validasi', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=TorModel::find($id);
        if(!isset($id_data)){
            $id_data=TorModel::where('kegiatan_detail_id', $id)->first();
        }
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Data TOR tidak ditemukan."
            ], 400);
        }
        $id = $id_data->id;

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["sent"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Status TOR saat ini bukan 'sent' (menunggu validasi koordinator)."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:koordinator_applied,koordinator_revisi",
            'catatan_koordinator'=>"nullable"
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
            
            if(isset($req['status_ajuan'])){
                $data_update['status_ajuan']=$req['status_ajuan'];
            }
            if(isset($req['catatan_koordinator'])){
                $data_update['catatan_koordinator']=$req['catatan_koordinator'];
            }
            if(isset($req['wakil_dekan_id'])){
                $data_update['wakil_dekan_id']=$req['wakil_dekan_id'];
            }

            TorModel::find($id)->update($data_update);
        });
        
        //jobs
        $wablas = new WablasService();
        if($req['status_ajuan']=="koordinator_applied"){
            // Langsung ajukan ke Wakil Dekan (melewati Sub Kor) dan notifikasi ke PIC
            $result = $wablas->send_submit_tor_to_wd($request, $id);
            $result = $wablas->send_approve_tor_koordinator($request, $id);
        }
        else{
            $result = $wablas->send_revisi_tor_koordinator($request, $id);
        }

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_keuangan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('tor_keuangan_validasi', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=TorModel::find($id);
        if(!isset($id_data)){
            $id_data=TorModel::where('kegiatan_detail_id', $id)->first();
        }
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Data TOR tidak ditemukan."
            ], 400);
        }
        $id = $id_data->id;

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["koordinator_applied"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Status TOR saat ini bukan 'koordinator_applied' (menunggu verifikasi keuangan)."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:keuangan_applied,keuangan_revisi",
            'catatan_keuangan'  =>"nullable",
            'wakil_dekan_id'    =>[
                "nullable",
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::with('data_role')->find($value);
                    
                    if (!$user) {
                        $fail('User tidak ditemukan.');
                        return;
                    }

                    if($user->role!="admin"){
                        $permissions = $user->data_role->permissions ?? [];
                        
                        if (!in_array('specific_is_user_wakil_dekan', $permissions)) {
                            $fail('User harus memiliki permission "Wakil Dekan".');
                        }
                    }
                }
            ]
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
            
            if(isset($req['status_ajuan'])){
                $data_update['status_ajuan']=$req['status_ajuan'];
            }
            if(isset($req['catatan_keuangan'])){
                $data_update['catatan_keuangan']=$req['catatan_keuangan'];
            }
            if(isset($req['wakil_dekan_id'])){
                $data_update['wakil_dekan_id']=$req['wakil_dekan_id'];
            }

            TorModel::find($id)->update($data_update);
        });
        
        //jobs
        $wablas = new WablasService();
        if($req['status_ajuan']=="keuangan_applied"){
            $result = $wablas->send_submit_tor_to_wd($request, $id);
            $result = $wablas->send_approve_tor_keuangan($request, $id);
        }
        else{
            $result = $wablas->send_revisi_tor_keuangan($request, $id);
        }

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_wakil_dekan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('tor_wakil_dekan_validasi', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=TorModel::find($id);
        if(!isset($id_data)){
            $id_data=TorModel::where('kegiatan_detail_id', $id)->first();
        }
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Data TOR tidak ditemukan."
            ], 400);
        }
        $id = $id_data->id;

        //VALIDATION WAKIL DEKAN
        $isAdmin = $login_data->checkIsAdmin() || ($login_data->role === 'admin') || ($login_data->role === 'superadmin');
        if(!$isAdmin && isset($id_data['wakil_dekan_id']) && $id_data['wakil_dekan_id']!=$login_data['id'] && in_array("specific_wakil_dekan", $login_data['permissions'])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["koordinator_applied", "keuangan_applied", "pp_applied"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Status TOR saat ini belum disetujui Koordinator (menunggu validasi Koordinator)."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:wakil_dekan_applied,wakil_dekan_revisi",
            'catatan_wakil_dekan'=>"nullable"
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
            
            if(isset($req['status_ajuan'])){
                $data_update['status_ajuan']=$req['status_ajuan'];
            }
            if(isset($req['catatan_wakil_dekan'])){
                $data_update['catatan_wakil_dekan']=$req['catatan_wakil_dekan'];
            }

            TorModel::find($id)->update($data_update);
        });
        
        //jobs
        $wablas = new WablasService();
        if($req['status_ajuan']=="wakil_dekan_applied"){
            $result = $wablas->send_approve_tor_wd($request, $id);
        }
        else{
            $result = $wablas->send_revisi_tor_wd($request, $id);
        }

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_pp(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (!$login_data->checkIsAdmin() && Gate::denies('tor_pp_validasi', $login_data)) {
            return response('Not Allowed.', 403);
        }

        // VALIDATION ID
        $id_data = TorModel::with('kegiatan_detail')->find($id);
        if (!isset($id_data)) {
            $id_data = TorModel::with('kegiatan_detail')->where('kegiatan_detail_id', $id)->first();
        }
        if (!isset($id_data)) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Data TOR tidak ditemukan."
            ], 400);
        }
        $id = $id_data->id;

        // VALIDATION STATUS
        if (!in_array($id_data['status_ajuan'], ["koordinator_applied"])) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Status usulan saat ini bukan 'koordinator_applied' (menunggu telaah Pejabat Pengadaan)."
            ], 400);
        }

        $validation = Validator::make($req, [
            'status_ajuan' => "required|in:pp_applied,pp_revisi",
            'catatan_pp'   => "nullable"
        ]);
        if ($validation->fails()) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => $validation->errors()->first()
            ], 400);
        }

        DB::transaction(function() use ($req, $id) {
            $data_update = [
                'status_ajuan' => $req['status_ajuan']
            ];
            if (isset($req['catatan_pp'])) {
                $data_update['catatan_pp'] = $req['catatan_pp'];
            }
            TorModel::find($id)->update($data_update);
        });

        return response()->json([
            'status' => "ok",
            'message' => "Validasi HPS oleh Pejabat Pengadaan berhasil diproses."
        ]);
    }

    public function proses_pengadaan(Request $request, $id)
    {
        $login_data = $request->user();

        if (!$login_data->checkIsAdmin() && Gate::denies('pengadaan_pp_execute', $login_data) && Gate::denies('tor_pp_validasi', $login_data)) {
            return response('Not Allowed.', 403);
        }

        $id_data = TorModel::find($id);
        if (!$id_data) {
            $id_data = TorModel::where('kegiatan_detail_id', $id)->first();
        }
        if (!$id_data) {
            return response()->json(['error' => "NOT_FOUND"], 404);
        }

        $id_data->update([
            'status_pengadaan' => 'proses_pengadaan'
        ]);

        return response()->json([
            'status' => "ok",
            'message' => "Status pengadaan diperbarui: Proses pemesanan rekanan sedang berjalan."
        ]);
    }

    public function upload_dokumen_pengadaan(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        if (!$login_data->checkIsAdmin() && Gate::denies('pengadaan_pp_upload', $login_data) && Gate::denies('tor_pp_validasi', $login_data)) {
            return response('Not Allowed.', 403);
        }

        $id_data = TorModel::find($id);
        if (!$id_data) {
            $id_data = TorModel::where('kegiatan_detail_id', $id)->first();
        }
        if (!$id_data) {
            return response()->json(['error' => "NOT_FOUND"], 404);
        }

        $filePath = null;
        if ($request->hasFile('file_dokumen_pengadaan')) {
            $file = $request->file('file_dokumen_pengadaan');
            $fileName = 'bast_pengadaan_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $destPath = public_path('uploads/pengadaan');
            if (!file_exists($destPath)) {
                @mkdir($destPath, 0777, true);
            }
            $file->move($destPath, $fileName);
            $filePath = '/uploads/pengadaan/' . $fileName;
        } elseif (!empty($req['file_dokumen_pengadaan'])) {
            $filePath = $req['file_dokumen_pengadaan'];
        }

        $data_update = [
            'status_pengadaan' => 'selesai'
        ];
        if ($filePath) {
            $data_update['file_dokumen_pengadaan'] = $filePath;
        }

        $id_data->update($data_update);

        return response()->json([
            'status' => "ok",
            'message' => "Dokumen BAST pengadaan berhasil diunggah. Pengadaan tuntas 100%."
        ]);
    }

    //revisi
    public function request_gemini_tor(Request $request, $id)
    {
        $login_data = $request->user();

        // VALIDATION ID
        $tor_data = TorModel::with("iku", "ik", "p", "kegiatan_detail", "kegiatan_detail.kegiatan")->find($id);
        if (!$tor_data) {
            $tor_data = TorModel::with("iku", "ik", "p", "kegiatan_detail", "kegiatan_detail.kegiatan")->where("kegiatan_detail_id", $id)->first();
        }
        if (!$tor_data) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Data TOR tidak ditemukan."
            ], 400);
        }

        $pengaturan = PengaturanRepo::gets();
        $api_key = !empty($pengaturan['gemini_api_key']) 
            ? trim($pengaturan['gemini_api_key']) 
            : (!empty($pengaturan['GEMINI_API_KEY']) 
                ? trim($pengaturan['GEMINI_API_KEY']) 
                : env('GEMINI_API_KEY', ''));
        $kelompok_belanja = KelompokBelanjaRepo::gets([])['data'] ?? [];

        $nama_kegiatan = $tor_data['kegiatan_detail']['kegiatan']['nama_kegiatan'] ?? ($tor_data['judul_kegiatan'] ?? 'Kegiatan');
        $detail_kegiatan = $tor_data['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor_data['judul_kegiatan'] ?? 'Sub Kegiatan');
        $biaya = $tor_data['kegiatan_detail']['biaya'] ?? 10000000;
        $biaya_formatted = number_format((float)$biaya, 0, ',', '.');
        $iku_text = $tor_data['iku']['deskripsi_iku'] ?? ($tor_data['iku']['kode_iku'] ?? 'Meningkatkan Kualitas Mutu Akademik dan Institusi');
        $ik_text = $tor_data['ik']['deskripsi_ik'] ?? ($tor_data['ik']['kode_ik'] ?? 'Pencapaian Target Indikator Kegiatan');
        $p_text = $tor_data['p']['deskripsi_p'] ?? 'Program Kerja Unggulan UNS Kampus Madiun';

        $shortcode = [
            ['{p}', $p_text],
            ['{ik}', $ik_text],
            ['{iku}', $iku_text],
            ['{kegiatan}', $nama_kegiatan],
            ['{detail_kegiatan}', $detail_kegiatan],
            ['{biaya}', (string)$biaya],
            ['{kelompok_belanja}', json_encode($kelompok_belanja)]
        ];

        $template_prompt = !empty($pengaturan['prompt_tor']) 
            ? $pengaturan['prompt_tor'] 
            : "saya sebagai pic kegiatan di universitas sebelas maret kampus madiun sedang membuat ajuan tor rab kegiatan tolong buatkan yang bagus akademis berdasarkan data yang valid dan layak untuk masing-masing. untuk 'latar belakang buatkan maksimal 500 kata dengan struktur 3 paragraf, paragraf 1 introduction, paragraf 2 masalah, paragraf 3 solusi. ' 'latar belakang', 'rasionalisasi', 'tujuan', 'keberlanjutan', dan 'mekanisme dan rancangan' dari data indikator kinerja utama(iku) '{iku}', indikator kinerja kegiatan(ik) '{ik}', program(p) '{p}', kegiatan '{kegiatan}', detail kegiatan '{detail_kegiatan}', dengan biaya '{biaya}'";
        
        $return_prompt = !empty($pengaturan['return_prompt_tor']) 
            ? $pengaturan['return_prompt_tor'] 
            : "Kembalikan dalam format JSON murni dengan type textarea dengan properti 'latar_belakang', 'rasionalisasi', 'tujuan', 'keberlanjutan', khusus untuk mekanisme dan rancangan kembalikan dengan properti 'mekanisme_dan_rancangan' dengan value array 1 dimensi.";

        foreach ($shortcode as $item) {
            $template_prompt = str_replace($item[0], $item[1], $template_prompt);
            $return_prompt = str_replace($item[0], $item[1], $return_prompt);
        }

        $prompt_final = trim($template_prompt . "\n\n" . $return_prompt);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt_final]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.7
            ]
        ];

        // Dynamic contextual fallback for any offline case
        $fallback_data = [
            'latar_belakang' => "Universitas Sebelas Maret (UNS) Kampus Madiun senantiasa berkomitmen memperkuat tata kelola akademik dan peningkatan kualitas tridharma perguruan tinggi. Pelaksanaan program '{$p_text}' menjadi landasan strategis guna mendukung pencapaian indikator kinerja utama (IKU) '{$iku_text}' secara berkelanjutan.\n\nDalam dinamika perkuliahan dan pengembangan kelembagaan, tantangan utama yang dihadapi adalah optimalisasi pelaksanaan '{$detail_kegiatan}' pada lingkup '{$nama_kegiatan}'. Diperlukan akselerasi program yang terukur dan didukung pendanaan yang memadai agar sasaran mutu dapat terwujud.\n\nSebagai langkah strategis, penyelenggaraan '{$detail_kegiatan}' dialokasikan dengan anggaran sebesar Rp {$biaya_formatted} sebagai solusi nyata guna memenuhi indikator kinerja kegiatan (IK) '{$ik_text}' secara akuntabel dan berorientasi hasil.",
            'rasionalisasi' => "Penyelenggaraan kegiatan '{$detail_kegiatan}' dalam kerangka '{$nama_kegiatan}' memiliki urgensi yang sangat strategis. Pertama, kegiatan ini secara langsung merealisasikan program '{$p_text}' dan berkontribusi nyata terhadap pemenuhan indikator '{$ik_text}'. Kedua, alokasi anggaran sebesar Rp {$biaya_formatted} dimanfaatkan secara efisien dan tepat sasaran untuk mendukung luaran yang terstandarisasi. Ketiga, kegiatan ini meningkatkan reputasi UNS Kampus Madiun dalam mencapai target '{$iku_text}'.",
            'tujuan' => "1. Terlaksananya kegiatan '{$detail_kegiatan}' dengan standar mutu terbaik.\n2. Mendukung percepatan pencapaian target program '{$p_text}'.\n3. Memenuhi indikator kinerja kegiatan '{$ik_text}' secara terukur.\n4. Berkontribusi positif terhadap capaian IKU '{$iku_text}'.\n5. Mengoptimalkan pemanfaatan alokasi dana sebesar Rp {$biaya_formatted} secara akuntabel dan transparan.",
            'keberlanjutan' => "1. Integrasi Hasil: Luaran dari '{$detail_kegiatan}' akan diintegrasikan ke dalam sistem dokumentasi dan portofolio resmi universitas.\n2. Monitoring Berkala: Pelaksanaan evaluasi berkala terhadap ketercapaian target '{$ik_text}'.\n3. Penguatan Budaya Mutu: Menjadikan program ini sebagai standar pelaksanaan kegiatan berkala di tahun anggaran berikutnya.\n4. Kemitraan Strategis: Memperluas kerja sama dengan stakeholder pendukung program.\n5. Tindak Lanjut Akademik: Memanfaatkan data kegiatan untuk perencanaan strategis '{$p_text}'.",
            'mekanisme_dan_rancangan' => [
                "1. Tahap Perencanaan: Penyusunan KAK, pembentukan tim kerja, dan finalisasi administrasi anggaran '{$detail_kegiatan}'.",
                "2. Tahap Koordinasi: Rapat koordinasi teknis pelaksanaan program '{$nama_kegiatan}' bersama stakeholder terkait.",
                "3. Tahap Persiapan Teknis: Penyiapan sarana, prasarana, materi, dan instrumen kegiatan.",
                "4. Tahap Pelaksanaan Inti: Eksekusi pelaksanaan '{$detail_kegiatan}' sesuai jadwal yang ditetapkan.",
                "5. Tahap Evaluasi: Pengukuran ketercapaian target '{$ik_text}' dan evaluasi hasil kegiatan.",
                "6. Tahap Diseminasi: Publikasi laporan dan luaran kegiatan pada portal resmi UNS Kampus Madiun.",
                "7. Tahap Pelaporan (SPJ): Penyusunan LPJ akademik dan SPJ keuangan secara akuntabel."
            ]
        ];

        if (!empty($api_key)) {
            $models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
            foreach ($models as $model) {
                try {
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $api_key;
                    $response = \Illuminate\Support\Facades\Http::withHeaders(['Content-Type' => 'application/json'])->timeout(60)->post($url, $payload);
                    if ($response->successful()) {
                        $rawText = $response->json('candidates.0.content.parts.0.text');
                        $rawText = preg_replace('/^```json\s*|\s*```$/m', '', trim($rawText));
                        $dataJson = json_decode($rawText, true);
                        if (!empty($dataJson) && is_array($dataJson)) {
                            return response()->json(['status' => 'ok', 'data' => $dataJson]);
                        }
                    }
                } catch (\Throwable $e) {
                    // try next model
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'data' => $fallback_data
        ]);
    }

    public function request_gemini_rab(Request $request, $id)
    {
        $login_data = $request->user();

        // VALIDATION ID
        $tor_data = TorModel::with("iku", "ik", "p", "kegiatan_detail", "kegiatan_detail.kegiatan")->find($id);
        if (!$tor_data) {
            $tor_data = TorModel::with("iku", "ik", "p", "kegiatan_detail", "kegiatan_detail.kegiatan")->where("kegiatan_detail_id", $id)->first();
        }
        if (!$tor_data) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => "Data TOR tidak ditemukan."
            ], 400);
        }

        $pengaturan = PengaturanRepo::gets();
        $api_key = !empty($pengaturan['gemini_api_key']) 
            ? trim($pengaturan['gemini_api_key']) 
            : (!empty($pengaturan['GEMINI_API_KEY']) 
                ? trim($pengaturan['GEMINI_API_KEY']) 
                : env('GEMINI_API_KEY', ''));
        $kelompok_belanja = KelompokBelanjaRepo::gets([])['data'] ?? [];

        $nama_kegiatan = $tor_data['kegiatan_detail']['kegiatan']['nama_kegiatan'] ?? 'Kegiatan';
        $detail_kegiatan = $tor_data['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Detail Kegiatan';
        $biaya = $tor_data['kegiatan_detail']['biaya'] ?? 10000000;

        $kategori_kegiatan = $tor_data['kegiatan_detail']['kategori_kegiatan'] ?? 'kegiatan';
        $is_hps = in_array($kategori_kegiatan, ['bhp', 'inventaris']);

        if ($is_hps) {
            $is_inventaris = $kategori_kegiatan === 'inventaris';
            $target_pagu = (float)$biaya > 0 ? (float)$biaya : 5000000;

            $shortcode_hps = [
                ['{p}', $tor_data['p']['deskripsi_p'] ?? ''],
                ['{ik}', $tor_data['ik']['deskripsi_ik'] ?? ''],
                ['{iku}', $tor_data['iku']['deskripsi_iku'] ?? ''],
                ['{kegiatan}', $nama_kegiatan],
                ['{detail_kegiatan}', $detail_kegiatan],
                ['{biaya}', (string)$target_pagu],
                ['{kelompok_belanja}', json_encode($kelompok_belanja)]
            ];

            if ($is_inventaris) {
                $custom_prompt = !empty($pengaturan['prompt_hps_inventaris']) 
                    ? $pengaturan['prompt_hps_inventaris'] 
                    : "Sebagai PIC Perencanaan Pengadaan di Universitas Sebelas Maret (UNS) Kampus Madiun, susunlah daftar usulan Harga Perkiraan Sendiri (HPS) untuk pengadaan INVENTARIS & ASET LABORATORIUM pada kegiatan '{kegiatan}' - '{detail_kegiatan}' dengan total pagu biaya maksimal Rp {biaya}.

Ketentuan Khusus Referensi Harga E-Katalog LKPP / INAPROC:
1. Sumber referensi harga (sumber_ref_1 dan sumber_ref_2) WAJIB merujuk pada E-Katalog Nasional (https://katalog.inaproc.id/ atau https://e-katalog.lkpp.go.id/). DILARANG menggunakan marketplace komersil seperti Shopee, Tokopedia, Bukalapak, atau lainnya.
2. Cari produk penyedia resmi yang paling sesuai dan pas dengan kata kunci nama barang serta spesifikasi teknis laboratorium yang dibutuhkan.
3. harga_1 dan harga_2 adalah estimasi harga produk pembanding dari E-Katalog sebelum PPN (harga wajar katalog).
4. harga_rata2 dihitung dari (harga_1 + harga_2) / 2.
5. harga_pajak dihitung dari harga_rata2 * 1.20 (markup PPN 20% sesuai format standar UNS).
6. Total seluruh barang (subtotal = jumlah * harga_pajak) TIDAK BOLEH MELEBIHI pagu anggaran Rp {biaya}.";
                
                $custom_return = !empty($pengaturan['return_prompt_hps_inventaris'])
                    ? $pengaturan['return_prompt_hps_inventaris']
                    : "Kembalikan format JSON murni dengan key 'rab' yang berisi array objek dengan kolom: nama_barang, spesifikasi, jumlah, satuan, harga_1, harga_2, sumber_ref_1, sumber_ref_2, waktu, peruntukan, keterangan_tkdn. Pastikan sumber_ref_1 dan sumber_ref_2 menggunakan URL pencarian aktif dengan format 'https://katalog.inaproc.id/search?q=[nama_barang]'. DILARANG membuat URL produk dummy yang menyebabkan error 404! Total seluruh barang setelah ditambah pajak 20% TIDAK BOLEH melebihi Rp {biaya}.";
            } else {
                $custom_prompt = !empty($pengaturan['prompt_hps_bhp']) 
                    ? $pengaturan['prompt_hps_bhp'] 
                    : "Sebagai PIC Perencanaan Pengadaan di Universitas Sebelas Maret (UNS) Kampus Madiun, susunlah daftar usulan Harga Perkiraan Sendiri (HPS) untuk pengadaan BARANG HABIS PAKAI (BHP) PRAKTIKUM pada kegiatan '{kegiatan}' - '{detail_kegiatan}' dengan total pagu biaya maksimal Rp {biaya}.

Ketentuan Khusus Referensi Harga E-Katalog LKPP / INAPROC:
1. Sumber referensi harga (sumber_ref_1 dan sumber_ref_2) WAJIB merujuk pada E-Katalog Nasional (https://katalog.inaproc.id/ atau https://e-katalog.lkpp.go.id/). DILARANG menggunakan marketplace komersil seperti Shopee, Tokopedia, Bukalapak, atau lainnya.
2. Cari produk penyedia resmi yang paling sesuai dan pas dengan kata kunci nama barang serta spesifikasi teknis praktikum yang dibutuhkan.
3. harga_1 dan harga_2 adalah estimasi harga produk pembanding dari E-Katalog sebelum PPN (harga wajar katalog).
4. harga_rata2 dihitung dari (harga_1 + harga_2) / 2.
5. harga_pajak dihitung dari harga_rata2 * 1.20 (markup PPN 20% sesuai format standar UNS).
6. Total seluruh barang (subtotal = jumlah * harga_pajak) TIDAK BOLEH MELEBIHI pagu anggaran Rp {biaya}.";
                
                $custom_return = !empty($pengaturan['return_prompt_hps_bhp'])
                    ? $pengaturan['return_prompt_hps_bhp']
                    : "Kembalikan format JSON murni dengan key 'rab' yang berisi array objek dengan kolom: nama_barang, spesifikasi, jumlah, satuan, harga_1, harga_2, sumber_ref_1, sumber_ref_2, waktu, peruntukan, keterangan_tkdn. Pastikan sumber_ref_1 dan sumber_ref_2 menggunakan URL pencarian aktif dengan format 'https://katalog.inaproc.id/search?q=[nama_barang]'. DILARANG membuat URL produk dummy yang menyebabkan error 404! Total seluruh barang setelah ditambah pajak 20% TIDAK BOLEH melebihi Rp {biaya}.";
            }

            foreach ($shortcode_hps as $item) {
                $custom_prompt = str_replace($item[0], $item[1], $custom_prompt);
                $custom_return = str_replace($item[0], $item[1], $custom_return);
            }

            $prompt_hps = trim($custom_prompt . "\n\n" . $custom_return);

            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt_hps]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.7
                ]
            ];

            // HPS Fallback
            $unit_h1 = (int)round(($target_pagu * 0.70 / 1.20) / 10000) * 10000;
            $unit_h2 = (int)round($unit_h1 * 1.05);
            $rata = ($unit_h1 + $unit_h2) / 2;
            $pajak20 = round($rata * 1.20);
            
            $item1_name = $is_inventaris ? "Perangkat {$detail_kegiatan} Standar Laboratorium" : "Paket Bahan Habis Pakai {$detail_kegiatan}";
            $item1_spec = $is_inventaris ? "Spesifikasi Standard Industri, Garansi Resmi 1 Tahun, Sertifikasi TKDN" : "Material Praktikum Berkualitas, Kemasan Pabrikasi, Siap Pakai";

            $fallback_hps = [
                'rab' => [
                    [
                        'id' => (string)\Illuminate\Support\Str::uuid(),
                        'nama_barang' => $item1_name,
                        'spesifikasi' => $item1_spec,
                        'jumlah' => 1,
                        'satuan' => $is_inventaris ? "Unit" : "Paket",
                        'harga_1' => $unit_h1,
                        'harga_2' => $unit_h2,
                        'harga_rata2' => $rata,
                        'harga_pajak' => $pajak20,
                        'total' => $pajak20,
                        'sumber_ref_1' => "https://katalog.inaproc.id/search?q=" . urlencode($item1_name),
                        'sumber_ref_2' => "https://katalog.inaproc.id/search?q=" . urlencode($detail_kegiatan),
                        'waktu' => "TW 1",
                        'peruntukan' => $is_inventaris ? "Alat Laboratorium" : "BHP Praktikum",
                        'keterangan_tkdn' => "PDN (Produk Dalam Negeri)"
                    ]
                ]
            ];

            if (!empty($api_key)) {
                $models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
                foreach ($models as $model) {
                    try {
                        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $api_key;
                        $response = \Illuminate\Support\Facades\Http::withHeaders(['Content-Type' => 'application/json'])->timeout(60)->post($url, $payload);
                        if ($response->successful()) {
                            $rawText = $response->json('candidates.0.content.parts.0.text');
                            $rawText = preg_replace('/^```json\s*|\s*```$/m', '', trim($rawText));
                            $dataJson = json_decode($rawText, true);
                            if (!empty($dataJson) && is_array($dataJson) && isset($dataJson['rab'])) {
                                return response()->json(['status' => 'ok', 'data' => $dataJson]);
                            }
                        }
                    } catch (\Throwable $e) {
                        // try next model
                    }
                }
            }

            return response()->json([
                'status' => 'ok',
                'data' => $fallback_hps
            ]);
        }

        // REGULAR KEGIATAN RAB
        $shortcode = [
            ['{p}', $tor_data['p']['deskripsi_p'] ?? ''],
            ['{ik}', $tor_data['ik']['deskripsi_ik'] ?? ''],
            ['{iku}', $tor_data['iku']['deskripsi_iku'] ?? ''],
            ['{kegiatan}', $nama_kegiatan],
            ['{detail_kegiatan}', $detail_kegiatan],
            ['{biaya}', (string)$biaya],
            ['{kelompok_belanja}', json_encode($kelompok_belanja)]
        ];

        $template_prompt = !empty($pengaturan['prompt_rab']) ? $pengaturan['prompt_rab'] : "Buatkan susunan Rincian Anggaran Biaya (RAB) realistis dan sesuai standar untuk '{kegiatan}' - '{detail_kegiatan}' dengan total pagu maksimal Rp {biaya}. Daftar kelompok belanja: {kelompok_belanja}.";
        $return_prompt = !empty($pengaturan['return_prompt_rab']) ? $pengaturan['return_prompt_rab'] : "Kembalikan field 'rab' (array 1 dimensi dengan kolom: kelompok_belanja_id, nama_kelompok_belanja, kode_item, keterangan, frekuensi, volume, satuan, harga_satuan, pajak). Total seluruh item tidak boleh melebihi Rp {biaya}.";
        
        foreach ($shortcode as $item) {
            $template_prompt = str_replace($item[0], $item[1], $template_prompt);
            $return_prompt = str_replace($item[0], $item[1], $return_prompt);
        }

        $prompt_final = trim($template_prompt . "\n\n" . $return_prompt);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt_final]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.7
            ]
        ];

        $kb_hono = null;
        $kb_barang = null;
        foreach ($kelompok_belanja as $kb) {
            if (!$kb_hono && (stripos($kb['nama_kelompok_belanja'], 'Honorarium') !== false || stripos($kb['nama_kelompok_belanja'], 'Registrasi') !== false)) {
                $kb_hono = $kb;
            }
            if (!$kb_barang && stripos($kb['nama_kelompok_belanja'], 'Barang') !== false) {
                $kb_barang = $kb;
            }
        }
        $target_pagu = (float)$biaya;
        if ($target_pagu <= 0) $target_pagu = 5000000;

        $pajak_hono = (float)($kb_hono['kwitansi_pajak'] ?? 5);
        $pajak_barang = (float)($kb_barang['kwitansi_pajak'] ?? 10);

        // Calculate proportional units fitting exactly within target_pagu
        $hono_unit = min(1500000, max(500000, round(($target_pagu * 0.45 / max(1, 1 + $pajak_hono/100)) / 2 / 50000) * 50000));
        $modul_vol = max(10, min(50, (int)round(($target_pagu * 0.15 / max(1, 1 + $pajak_barang/100)) / 15000)));
        
        $hono_real = 2 * 1 * $hono_unit * (1 + $pajak_hono/100);
        $modul_real = 1 * $modul_vol * 15000 * (1 + $pajak_barang/100);
        $sisa_pagu = max(0, $target_pagu - $hono_real - $modul_real);
        $konsumsi_vol = max(5, (int)floor(($sisa_pagu / max(1, 1 + $pajak_barang/100)) / 35000));

        $fallback_rab = [
            'rab' => [
                [
                    'kelompok_belanja_id' => (string)($kb_hono['id'] ?? 1),
                    'nama_kelompok_belanja' => $kb_hono['nama_kelompok_belanja'] ?? 'Honorarium Narasumber',
                    'kode_item' => (string)\Illuminate\Support\Str::uuid(),
                    'keterangan' => "Honorarium Narasumber / Pemateri {$detail_kegiatan}",
                    'frekuensi' => 2,
                    'volume' => 1,
                    'satuan' => "orang/hari",
                    'harga_satuan' => (int)$hono_unit,
                    'pajak' => $pajak_hono
                ],
                [
                    'kelompok_belanja_id' => (string)($kb_barang['id'] ?? 2),
                    'nama_kelompok_belanja' => $kb_barang['nama_kelompok_belanja'] ?? 'Belanja Bahan & Modul',
                    'kode_item' => (string)\Illuminate\Support\Str::uuid(),
                    'keterangan' => "Penggandaan Modul & Perlengkapan {$detail_kegiatan}",
                    'frekuensi' => 1,
                    'volume' => $modul_vol,
                    'satuan' => "set",
                    'harga_satuan' => 15000,
                    'pajak' => $pajak_barang
                ],
                [
                    'kelompok_belanja_id' => (string)($kb_barang['id'] ?? 2),
                    'nama_kelompok_belanja' => $kb_barang['nama_kelompok_belanja'] ?? 'Belanja Konsumsi',
                    'kode_item' => (string)\Illuminate\Support\Str::uuid(),
                    'keterangan' => "Konsumsi Pelaksanaan {$detail_kegiatan}",
                    'frekuensi' => 1,
                    'volume' => $konsumsi_vol,
                    'satuan' => "pax",
                    'harga_satuan' => 35000,
                    'pajak' => $pajak_barang
                ]
            ]
        ];

        if (!empty($api_key)) {
            $models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
            foreach ($models as $model) {
                try {
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $api_key;
                    $response = \Illuminate\Support\Facades\Http::withHeaders(['Content-Type' => 'application/json'])->timeout(60)->post($url, $payload);
                    if ($response->successful()) {
                        $rawText = $response->json('candidates.0.content.parts.0.text');
                        $rawText = preg_replace('/^```json\s*|\s*```$/m', '', trim($rawText));
                        $dataJson = json_decode($rawText, true);
                        if (!empty($dataJson) && is_array($dataJson) && isset($dataJson['rab'])) {
                            return response()->json(['status' => 'ok', 'data' => $dataJson]);
                        }
                    }
                } catch (\Throwable $e) {
                    // try next model
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'data' => $fallback_rab
        ]);
    }

    public function delete(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=TorModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            TorModel::find($id)->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        if ($id === "null" || $id === "undefined" || empty($id)) {
            return response()->json([
                'data' => null
            ]);
        }

        try {
            //VALIDATION ID (Support tor.id or kegiatan_detail_id)
            $id_data = TorModel::find($id);
            if (!$id_data) {
                $id_data = TorModel::where('kegiatan_detail_id', $id)->first();
            }
            if (!$id_data) {
                $kd = \App\Models\KegiatanDetailModel::with('kegiatan')->find($id);
                if ($kd) {
                    $prodi = \App\Models\ProgramStudiModel::first();
                    $iku = \App\Models\IkuModel::first();
                    $ik = \App\Models\IkModel::first();
                    $p = \App\Models\PModel::first();
                    $tahun = $kd->kegiatan->tahun ?? date('Y');

                    $id_data = TorModel::create([
                        'kegiatan_detail_id' => $kd->id,
                        'program_studi_id'   => $prodi->id ?? 1,
                        'iku_id'             => $iku->id ?? 1,
                        'ik_id'              => $ik->id ?? 1,
                        'p_id'               => $p->id ?? 1,
                        'latar_belakang'     => '',
                        'rasionalisasi'      => '',
                        'tujuan'             => '',
                        'mekanisme_dan_rancangan' => [],
                        'jadwal_pelaksanaan' => ['tahun' => (string)$tahun, 'data' => []],
                        'iku_detail'         => ['realisasi' => ['tahun' => (string)($tahun - 1), 'nilai' => ''], 'target' => ['tahun' => (string)$tahun, 'nilai' => '']],
                        'ik_detail'          => ['realisasi' => ['tahun' => (string)($tahun - 1), 'nilai' => ''], 'target' => ['tahun' => (string)$tahun, 'nilai' => '']],
                        'keberlanjutan'      => '',
                        'penanggung_jawab'   => [],
                        'status_ajuan'       => 'draft',
                        'catatan_koordinator'=> '',
                        'catatan_wakil_dekan'=> '',
                        'catatan_keuangan'   => '',
                        'rab'                => [],
                        'total_rab'          => 0
                    ]);
                }
            }

            if (!$id_data) {
                return response()->json([
                    'data' => null
                ]);
            }

            //SUCCESS
            $data = TorRepo::get($id_data->id);

            return response()->json([
                'data' => $data
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("TorController@get exception on id {$id}: " . $e->getMessage());
            return response()->json([
                'data' => [
                    'id' => is_numeric($id) ? intval($id) : null,
                    'status_ajuan' => 'draft',
                    'rab' => [],
                    'total_rab' => 0
                ]
            ]);
        }
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
            // 'tahun'         =>"nullable",
            // 'program_studi_id'  =>"nullable",
            'status_ajuan'  =>"nullable",
            'wakil_dekan_id'=>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=TorRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }
}
