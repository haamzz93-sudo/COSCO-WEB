<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repositories\KelompokBelanjaRepo;
use App\Models\KelompokBelanjaModel;

class KelompokBelanjaController extends Controller
{

    public function add(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('kelompok_belanja_add', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'mak_id'   =>"required|exists:App\Models\MakModel,id",
            'nama_kelompok_belanja' =>"required",
            'lampiran' => 'required|array',
            'lampiran.*.kode_lampiran' => 'required|string|max:255|distinct|lowercase',
            'lampiran.*.nama_lampiran' => 'required|string|max:255',
            'lampiran.*.tipe' => 'required|in:required,optional',
            'kwitansi_pajak' => 'required|numeric|between:0,100|regex:/^\d+(\.\d{1,2})?$/',
            'kwitansi_tipe' =>"required|in:rab,without_rab,honor,transport"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            KelompokBelanjaModel::create([
                'mak_id'    =>$req['mak_id'],
                'nama_kelompok_belanja' =>$req['nama_kelompok_belanja'],
                'lampiran'  =>$req['lampiran'],
                'kwitansi_pajak'        =>$req['kwitansi_pajak'],
                'kwitansi_tipe' =>$req['kwitansi_tipe']
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
        if(Gate::denies('kelompok_belanja_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=KelompokBelanjaModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'nama_kelompok_belanja' =>"required",
            'lampiran' => 'required|array|min:0',
            'lampiran.*.kode_lampiran' => 'required|string|distinct|lowercase',
            'lampiran.*.nama_lampiran' => 'required|string',
            'lampiran.*.tipe' => 'required|in:required,optional',
            'kwitansi_pajak' => 'required|numeric|between:0,100|regex:/^\d+(\.\d{1,2})?$/',
            'kwitansi_tipe' =>"required|in:rab,without_rab,honor,transport"
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
                'nama_kelompok_belanja' =>$req['nama_kelompok_belanja'],
                'lampiran'  =>$req['lampiran'],
                'kwitansi_pajak'        =>$req['kwitansi_pajak'],
                'kwitansi_tipe' =>$req['kwitansi_tipe']
            ];

            KelompokBelanjaModel::find($id)->update($data_update);
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
        if(Gate::denies('kelompok_belanja_delete', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=KelompokBelanjaModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            KelompokBelanjaModel::find($id)->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION

        //VALIDATION ID
        $id_data=KelompokBelanjaModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        $data=KelompokBelanjaRepo::get($id);

        return response()->json([
            'data'      =>$data
        ]);
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
            'mak_id'        =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=KelompokBelanjaRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }
}
