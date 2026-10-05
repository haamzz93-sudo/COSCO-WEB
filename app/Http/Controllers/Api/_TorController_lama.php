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
use App\Repositories\PengaturanRepo;
use App\Repositories\MakRepo;

class TorController extends Controller
{

    // public function add(Request $request)
    // {
    //     $login_data=$request->user();
    //     $req=$request->all();

    //     //ROLE AUTHENTICATION
    //     if(!in_array($login_data['role'], ['admin'])){
    //         return response('Not Allowed.', 403);
    //     }

    //     //VALIDATION
    //     $validation=Validator::make($req, [
    //         'kegiatan_detail_id'=>"required|exists:App\Models\KegiatanDetailModel,id",
    //         'program_studi_id'  =>"required|exists:App\Models\ProgramStudiModel,id",
    //         'tahun'             =>"required|integer",
    //         'iku_id'            =>"required|exists:App\Models\IkuModel,id",
    //         'ik_id'             =>"required|exists:App\Models\IkModel,id",
    //         'p_id'              =>"required|exists:App\Models\PModel,id",
    //         'judul_kegiatan'    =>"required"
    //     ]);
    //     if($validation->fails()){
    //         return response()->json([
    //             'error' =>"VALIDATION_ERROR",
    //             'data'  =>$validation->errors()->first()
    //         ], 400);
    //     }

    //     //SUCCESS
    //     DB::transaction(function()use($req){
    //         TorModel::create([
    //             'kegiatan_detail_id'=>$req['kegiatan_detail_id'],
    //             'program_studi_id'  =>$req['program_studi_id'],
    //             'tahun'             =>$req['tahun'],
    //             'iku_id'            =>$req['iku_id'],
    //             'ik_id'             =>$req['ik_id'],
    //             'p_id'              =>$req['p_id'],
    //             'judul_kegiatan'    =>$req['judul_kegiatan'],
    //             'latar_belakang'    =>"",
    //             'rasionalisasi'     =>"",
    //             'tujuan'            =>"",
    //             'mekanisme_dan_rancangan'   =>[],
    //             'jadwal_pelaksanaan'=>[
    //                 'tahun' =>"",
    //                 'data'  =>[]
    //             ],
    //             'iku_detail'        =>[
    //                 'realisasi'=>[
    //                     'tahun' =>$req['tahun']-1,
    //                     'nilai' =>""
    //                 ],
    //                 'target'   =>[
    //                     'tahun' =>$req['tahun'],
    //                     'nilai' =>""
    //                 ]              
    //             ],
    //             'ik_detail'         =>[
    //                 'realisasi'=>[
    //                     'tahun' =>$req['tahun']-1,
    //                     'nilai' =>""
    //                 ],
    //                 'target'   =>[
    //                     'tahun' =>$req['tahun'],
    //                     'nilai' =>""
    //                 ]              
    //             ],
    //             'keberlanjutan'     =>"",
    //             'penanggung_jawab'  =>[],
    //             'status_ajuan'      =>"draft",
    //             'catatan_koordinator'=>"",
    //             'catatan_wakil_dekan'=>""
    //         ]);
    //     });

    //     return response()->json([
    //         'status'=>"ok"
    //     ]);
    // }

    public function update(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('specific_is_user_pic', $login_data)) {
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

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["draft", "koordinator_revisi", "keuangan_revisi", "wakil_dekan_revisi"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        // draft,sent,koordinator_applied,koordinator_revisi,wakil_dekan_applied,wakil_dekan_revisi
        $validation=Validator::make($req, [
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
            'rab'               =>'nullable|array',
            'rab.*.kode_item'   =>'required|string|distinct',
            'rab.*.nama_item'   =>'required|string',
            'rab.*.keterangan'  =>'present|string|nullable',
            'rab.*.volume'      =>'required|integer|min:1',
            'rab.*.satuan'      =>'required|string',
            'rab.*.harga_satuan'=>'required|numeric|regex:/^\d+(\.\d{1,2})?$/'
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
                $data_update['jadwal_pelaksanaan']=$req['jadwal_pelaksanaan'];
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

                $total_rab=0;
                foreach($req['rab'] as $item){
                    $total_rab+=$item['volume']*$item['harga_satuan'];
                }

                $data_update['total_rab']=$total_rab;
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
        if(Gate::denies('specific_is_user_pic', $login_data)) {
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

        // //VALIDATION RAB HARGA SATUAN
        // $mak=collect(MakRepo::gets([])['data']);
        // $rab=$id_data['rab'];
        // $bound=false;
        // foreach($rab as $list){
        //     $item=$mak->firstWhere("kode_mak", $list['kode_item']);
        //     $harga_satuan_max=$item?$item['max_biaya']:0;

        //     if($list['harga_satuan']>$harga_satuan_max){
        //         $bound=true;
        //         break;
        //     }
        // }
        // if($bound){
        //     return response()->json([
        //         'error' =>"VALIDATION_ERROR",
        //         'data'  =>"Bad request."
        //     ], 400);
        // }

        //VALIDATION FIELD
        $data=$id_data;
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
        
        // 3. Validasi rab (array > 1)
        if (!isset($data['rab']) || !is_array($data['rab'])) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Rab harus berupa array'
            ], 400);
        }
        
        if (count($data['rab']) < 1) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Rab harus memiliki minimal 1 item'
            ], 400);
        }
        
        // 4. Validasi jadwal_pelaksanaan
        if (!isset($data['jadwal_pelaksanaan']) || !is_array($data['jadwal_pelaksanaan'])) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Jadwal Pelaksanaan harus berupa object'
            ], 400);
        }
        
        // 4a. Validasi jadwal_pelaksanaan.tahun
        if (!isset($data['jadwal_pelaksanaan']['tahun']) || $data['jadwal_pelaksanaan']['tahun'] === "") {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Tahun pada Jadwal Pelaksanaan wajib diisi (tidak boleh kosong)'
            ], 400);
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

        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:sent"
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

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_koordinator(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'koordinator'])){
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

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["sent"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
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

            TorModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_keuangan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'keuangan'])){
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

        //VALIDATION APPLIED
        if(!in_array($id_data['status_ajuan'], ["koordinator_applied"])){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'status_ajuan'      =>"nullable|in:keuangan_applied,keuangan_revisi",
            'catatan_keuangan'  =>"nullable",
            'wakil_dekan_id'    =>[
                "nullable",
                Rule::exists("App\Models\User", "id")->where(function($q){
                    $q->where("role", "wakil_dekan");
                })
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

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function validasi_wakil_dekan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'wakil_dekan'])){
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

        //VALIDATION WAKIL DEKAN
        if($id_data['wakil_dekan_id']!=$login_data['id'] && $login_data['role']=="wakil_dekan"){
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

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function request_gemini_tor(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'pic_kegiatan'])){
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
        $tor_data=TorModel::with("iku", "ik", "p", "kegiatan_detail", "kegiatan_detail.kegiatan")->find($id);
        $api_key=env('GEMINI_API_KEY');
        $url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=".$api_key;

        $pengaturan=PengaturanRepo::gets();

        $shortcode=[
            ['{p}', $tor_data['p']['deskripsi_p']],
            ['{ik}', $tor_data['ik']['deskripsi_ik']],
            ['{iku}', $tor_data['iku']['deskripsi_iku']],
            ['{kegiatan}', $tor_data['kegiatan_detail']['kegiatan']['nama_kegiatan']],
            ['{detail_kegiatan}', $tor_data['kegiatan_detail']['nama_kegiatan_detail']],
            ['{biaya}', $tor_data['kegiatan_detail']['biaya']]
        ];
        
        $text=$pengaturan['prompt_tor'];
        foreach ($shortcode as $item) {
            if (count($item) >= 2) {
                $key = $item[0];      // Shortcode seperti {p}, {ik}, dll
                $value = $item[1];    // Nilai pengganti
                
                // Ganti semua kemunculan shortcode dengan nilainya
                $text = str_replace($key, $value, $text);
            }
        }

        $text=$text.". ".$pengaturan['return_prompt_tor'];


        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text'  =>$text
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json'
            ]
        ];

        try {
            // 3. Lakukan HTTP POST Request menggunakan HTTP Client Laravel
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post($url, $payload);

            // 4. Pastikan request sukses
            if ($response->successful()) {
                
                // Ambil text mentah dari response Gemini
                $rawText = $response->json('candidates.0.content.parts.0.text');

                // 5. Parsing text JSON tersebut ke dalam variabel array PHP
                $dataJson = json_decode($rawText, true);

                // 6. Return variabel atau kirim ke view
                return response()->json([
                    'status' => 'ok',
                    'data' => $dataJson
                ]);

            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mengambil data dari Gemini',
                    'details' => $response->json()
                ], 400);
            }

        } 
        catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function request_gemini_rab(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'pic_kegiatan'])){
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
        $tor_data=TorModel::with("iku", "ik", "p", "kegiatan_detail", "kegiatan_detail.kegiatan")->find($id);
        $api_key=env('GEMINI_API_KEY');
        $url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=".$api_key;

        $pengaturan=PengaturanRepo::gets();

        $shortcode=[
            ['{p}', $tor_data['p']['deskripsi_p']],
            ['{ik}', $tor_data['ik']['deskripsi_ik']],
            ['{iku}', $tor_data['iku']['deskripsi_iku']],
            ['{kegiatan}', $tor_data['kegiatan_detail']['kegiatan']['nama_kegiatan']],
            ['{detail_kegiatan}', $tor_data['kegiatan_detail']['nama_kegiatan_detail']],
            ['{biaya}', $tor_data['kegiatan_detail']['biaya']]
        ];
        
        $text=$pengaturan['prompt_rab'];
        foreach ($shortcode as $item) {
            if (count($item) >= 2) {
                $key = $item[0];      // Shortcode seperti {p}, {ik}, dll
                $value = $item[1];    // Nilai pengganti
                
                // Ganti semua kemunculan shortcode dengan nilainya
                $text = str_replace($key, $value, $text);
            }
        }

        $text=$text.". ".$pengaturan['return_prompt_rab'];

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text'  =>$text
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json'
            ]
        ];

        // return response()->json(['data'=>$payload]);

        try {
            // 3. Lakukan HTTP POST Request menggunakan HTTP Client Laravel
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post($url, $payload);

            // 4. Pastikan request sukses
            if ($response->successful()) {
                
                // Ambil text mentah dari response Gemini
                $rawText = $response->json('candidates.0.content.parts.0.text');

                // 5. Parsing text JSON tersebut ke dalam variabel array PHP
                $dataJson = json_decode($rawText, true);

                // 6. Return variabel atau kirim ke view
                return response()->json([
                    'status' => 'ok',
                    'data' => $dataJson
                ]);

            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mengambil data dari Gemini',
                    'details' => $response->json()
                ], 400);
            }

        } 
        catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
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

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION ID
        $id_data=TorModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        $data=TorRepo::get($id);

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
