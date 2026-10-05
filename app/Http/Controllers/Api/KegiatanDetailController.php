<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repositories\KegiatanDetailRepo;
use App\Models\KegiatanDetailModel;
use App\Models\TorModel;
use App\Services\WablasService;

class KegiatanDetailController extends Controller
{
    
    //add
    public function add(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('kegiatan_detail_add', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'kegiatan_id'   =>"required|exists:App\Models\KegiatanModel,id",
            'nama_kegiatan_detail'  =>"required",
            'kategori_kegiatan'     =>"nullable|in:kegiatan,inventaris,bhp,transportasi",
            'biaya'     =>"required|numeric|regex:/^\d+(\.\d{1,2})?$/"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            $kegiatan_detail=KegiatanDetailModel::create([
                'kegiatan_id'   =>$req['kegiatan_id'],
                'nama_kegiatan_detail'  =>$req['nama_kegiatan_detail'],
                'kategori_kegiatan'     =>$req['kategori_kegiatan'] ?? 'kegiatan',
                'biaya'     =>$req['biaya']
            ]);
            
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    //edit
    public function update(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('kegiatan_detail_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=KegiatanDetailModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'nama_kegiatan_detail'  =>"required",
            'kategori_kegiatan'     =>"nullable|in:kegiatan,inventaris,bhp,transportasi",
            'biaya'     =>"required|numeric"
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
                'nama_kegiatan_detail'  =>$req['nama_kegiatan_detail'],
                'biaya'     =>$req['biaya']
            ];

            if(isset($req['kategori_kegiatan'])){
                $data_update['kategori_kegiatan'] = $req['kategori_kegiatan'];
            }

            KegiatanDetailModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function update_pic_kegiatan(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('kegiatan_detail_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=KegiatanDetailModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'pic_kegiatan'  =>"required|exists:App\Models\User,id"
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
                'pic_kegiatan'  =>$req['pic_kegiatan']
            ];

            KegiatanDetailModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function add_tor(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        $isSuperAdmin = $login_data->checkIsAdmin() || $login_data->role === 'admin' || $login_data->role === 'superadmin';
        $isPIC = $login_data->role === 'pic_kegiatan' || $login_data->hasPermission('specific_is_user_pic') || $login_data->hasPermission('specific_pic') || $login_data->hasPermission('tor_pic_update') || $login_data->hasPermission('kegiatan_detail_update') || $login_data->hasPermission('kegiatan_detail_add');

        if(!$isSuperAdmin && !$isPIC && Gate::denies('kegiatan_detail_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=KegiatanDetailModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        $isHps = in_array(strtolower($id_data['kategori_kegiatan'] ?? ''), ['bhp', 'inventaris']);

        //VALIDATION
        $validation=Validator::make($req, [
            'pic_kegiatan'      =>"required|exists:App\Models\User,id",
            'program_studi_id'  =>"required|exists:App\Models\ProgramStudiModel,id",
            'iku_id'            =>$isHps ? "nullable" : "required|exists:App\Models\IkuModel,id",
            'ik_id'             =>$isHps ? "nullable" : "required|exists:App\Models\IkModel,id",
            'p_id'              =>$isHps ? "nullable" : "required|exists:App\Models\PModel,id"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $tor_id="";
        DB::transaction(function()use($req, $id, $isHps, &$tor_id){
            $data_update=[
                'pic_kegiatan'  =>$req['pic_kegiatan']
            ];

            KegiatanDetailModel::find($id)->update($data_update);

            $kegiatan=KegiatanDetailModel::with("kegiatan")->find($id);
            $req['tahun']=$kegiatan['kegiatan']['tahun'];

            $defaultIku = \App\Models\IkuModel::first()->id ?? 1;
            $defaultIk = \App\Models\IkModel::first()->id ?? 1;
            $defaultP = \App\Models\PModel::first()->id ?? 1;

            $tor=TorModel::create([
                'kegiatan_detail_id'=>$id,
                'program_studi_id'  =>$req['program_studi_id'],
                'iku_id'            =>!empty($req['iku_id']) ? $req['iku_id'] : $defaultIku,
                'ik_id'             =>!empty($req['ik_id']) ? $req['ik_id'] : $defaultIk,
                'p_id'              =>!empty($req['p_id']) ? $req['p_id'] : $defaultP,
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
                'catatan_wakil_dekan'=>"",
                'catatan_keuangan'  =>"",
                'rab'               =>[],
                'total_rab'         =>0
            ]);
            
            $tor_id=$tor->id;
        });
        
        //jobs
        $wablas = new WablasService();
        $result = $wablas->send_assign_pic($request, $tor_id);

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function edit_tor(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        $isSuperAdmin = $login_data->checkIsAdmin() || $login_data->role === 'admin' || $login_data->role === 'superadmin';
        $isPIC = $login_data->role === 'pic_kegiatan' || $login_data->hasPermission('specific_is_user_pic') || $login_data->hasPermission('specific_pic') || $login_data->hasPermission('tor_pic_update') || $login_data->hasPermission('kegiatan_detail_update') || $login_data->hasPermission('kegiatan_detail_add');

        if(!$isSuperAdmin && !$isPIC && Gate::denies('kegiatan_detail_update', $login_data)) {
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

        $kegiatanDetail = KegiatanDetailModel::find($id_data->kegiatan_detail_id ?? 0);
        $isHps = $kegiatanDetail && in_array(strtolower($kegiatanDetail->kategori_kegiatan ?? ''), ['bhp', 'inventaris']);

        //VALIDATION
        $validation=Validator::make($req, [
            'program_studi_id'  =>"required|exists:App\Models\ProgramStudiModel,id",
            'iku_id'            =>$isHps ? "nullable" : "required|exists:App\Models\IkuModel,id",
            'ik_id'             =>$isHps ? "nullable" : "required|exists:App\Models\IkModel,id",
            'p_id'              =>$isHps ? "nullable" : "required|exists:App\Models\PModel,id"
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
                'program_studi_id'  =>$req['program_studi_id'],
            ];
            if (!empty($req['iku_id'])) $data_update['iku_id'] = $req['iku_id'];
            if (!empty($req['ik_id'])) $data_update['ik_id'] = $req['ik_id'];
            if (!empty($req['p_id'])) $data_update['p_id'] = $req['p_id'];
            TorModel::find($id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    //delete
    public function delete(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('kegiatan_detail_delete', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=KegiatanDetailModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS (CASCADE CLEANUP SAFE)
        DB::transaction(function() use ($req, $id) {
            try {
                if (class_exists(\App\Models\PerjalananDinasModel::class)) {
                    \App\Models\PerjalananDinasModel::where('kegiatan_detail_id', $id)->delete();
                }
            } catch (\Throwable $e) {}

            try {
                if (class_exists(\App\Models\TorModel::class)) {
                    $torIds = \App\Models\TorModel::where('kegiatan_detail_id', $id)->pluck('id')->toArray();
                    if (!empty($torIds) && class_exists(\App\Models\MemoCairModel::class)) {
                        \App\Models\MemoCairModel::whereIn('tor_id', $torIds)->delete();
                    }
                    \App\Models\TorModel::where('kegiatan_detail_id', $id)->delete();
                }
            } catch (\Throwable $e) {}

            try {
                $target = KegiatanDetailModel::find($id);
                if ($target) {
                    $target->delete();
                }
            } catch (\Throwable $e) {}
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request, $id)
    {
        try {
            if ($id === "null" || $id === "undefined" || empty($id)) {
                return response()->json([
                    'data' => null
                ]);
            }

            //VALIDATION ID
            $id_data = KegiatanDetailModel::find($id);
            if (!isset($id_data)) {
                $tor = \App\Models\TorModel::find($id);
                if ($tor && $tor->kegiatan_detail_id) {
                    $id = $tor->kegiatan_detail_id;
                    $id_data = KegiatanDetailModel::find($id);
                }
            }

            if (!isset($id_data)) {
                return response()->json([
                    'data' => null
                ]);
            }

            //SUCCESS
            $data = KegiatanDetailRepo::get($id);

            return response()->json([
                'data' => $data
            ]);
        } catch (\Throwable $e) {
            \Log::error('KegiatanDetailController get error: ' . $e->getMessage());
            return response()->json([
                'data' => null
            ], 200);
        }
    }

    public function gets(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1",
            'q'             =>"nullable",
            'kegiatan_id'   =>"nullable",
            "pic_kegiatan"  =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=KegiatanDetailRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }
}
