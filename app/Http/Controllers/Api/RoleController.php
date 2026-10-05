<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use App\Models\RoleModel;
use App\Models\User as UserModel;
use App\Repositories\RoleRepo;

class RoleController extends Controller
{

    public function add(Request $request)
    {
        $login_data = $request->user();
        $req = $request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('role_add', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation = Validator::make($req, [
            'role'          => 'required|not_in:admin,unique:roles,role,role',
            'nama_role'     => 'required',
            'keterangan'    => 'present',
            'permissions'   => 'present|array|min:0',
            'permissions.*' => 'string'
        ]);
        if ($validation->fails()) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => $validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function() use ($req) {
            RoleModel::create([
                'role'          => $req['role'],
                'nama_role'     => $req['nama_role'],
                'keterangan'    => $req['keterangan'],
                'permissions'   => $req['permissions'] ?? []
            ]);
        });

        return response()->json([
            'status' => 'ok'
        ], 201);
    }


    public function update(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('role_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=RoleModel::find($id);
        if (!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        $validation = Validator::make($req, [
            'nama_role'     => 'required',
            'keterangan'    => 'present',
            'permissions'   => 'present|array|min:0',
            'permissions.*' => 'string'
        ]);
        if ($validation->fails()) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => $validation->errors()->first()
            ], 400);
        }

        // SUCCESS
        DB::transaction(function() use ($req, $id) {
            $data_update = [
                'nama_role'     => $req['nama_role'],
                'keterangan'    => $req['keterangan']
            ];

            if (isset($req['permissions'])) {
                $data_update['permissions'] = $req['permissions'];
            }

            RoleModel::where('id', $id)->update($data_update);
        });

        return response()->json([
            'status' => 'ok'
        ]);
    }

    public function delete(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('role_delete', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=RoleModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id, $id_data){
            UserModel::where("role", $id_data['role'])->update(['role'=>""]);
            RoleModel::where("id", $id)->delete();
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
        $id_data=RoleModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        $data=RoleRepo::get($req['id']);

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
            'per_page'  =>"nullable|integer|min:1",
            'q'         =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $user=RoleRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$user['current_page'],
            'last_page'     =>$user['last_page'],
            'total'         =>$user['total'],
            'data'          =>$user['data']
        ]);
    }
}