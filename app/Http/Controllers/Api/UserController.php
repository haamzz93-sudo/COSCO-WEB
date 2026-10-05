<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use App\Models\User as UserModel;
use App\Repositories\UserRepo;
use App\Models\RoleModel;


class UserController extends Controller
{
    
    /**
     * tambah user
     *
     * @authenticated
     * @group Users
     */
    public function add(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('user_add', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'username'  => "required|unique:users,username",
            'password'  => "required",
            'role'      => "required",
            'name'      => "required",
            'avatar_url'=> "nullable",
            'no_wa'     => "nullable",
            'email'     => "nullable|email",
            'nip'       => "nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function() use ($req) {
            UserModel::create([
                'username'      => $req['username'],
                'password'      => Hash::make($req['password']),
                'role'          => $req['role'],
                'name'          => $req['name'],
                'avatar_url'    => $req['avatar_url'] ?? '',
                'no_wa'         => $req['no_wa'] ?? '',
                'email'         => $req['email'] ?? '',
                'nip'           => $req['nip'] ?? '',
                'status'        => 'active'
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
        if(Gate::denies('user_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=UserModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'username'  => ['nullable', 'string', Rule::unique('users', 'username')->ignore($id)],
            'password'  => 'nullable',
            'name'      => 'required',
            'avatar_url'=> 'nullable',
            'no_wa'     => 'nullable',
            'email'     => ['nullable', 'email', Rule::unique('users', 'email')->ignore($id)],
            'nip'       => 'nullable'
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
                'name'           =>$req['name'],
                'no_wa'          =>$req['no_wa'] ?? '',
                'email'          =>$req['email'] ?? '',
                'nip'            =>$req['nip'] ?? '',
                'nama_bank'      =>$req['nama_bank'] ?? '',
                'nomor_rekening' =>$req['nomor_rekening'] ?? ''
            ];
            if(!empty($req['username'])){
                $data_update['username'] = $req['username'];
            }
            if(!empty($req['avatar_url'])){
                $data_update['avatar_url'] = $req['avatar_url'];
            }
            if(isset($req['password']) && trim($req['password'])!=""){
                $data_update['password']=Hash::make($req['password']);
            }

            UserModel::where("id", $id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function update_role(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('user_role_update', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=UserModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Data pengguna tidak ditemukan."
            ], 400);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'role'      =>"required"
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
                'role'  =>$req['role']
            ];

            UserModel::where("id", $id)->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }
    

    /**
     * hapus user
     *
     * @authenticated
     * @bodyParam id diambil dari id(abaikan ini). No-example
     * @group Users
     */
    public function delete(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('user_delete', $login_data)) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION ID
        $id_data=UserModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, $id){
            UserModel::where("id", $id)->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function sync_master_data(Request $request)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if ($login_data) {
            $isAdmin = method_exists($login_data, 'checkIsAdmin') ? $login_data->checkIsAdmin() : ($login_data->role === 'admin');
            if (!$isAdmin && Gate::forUser($login_data)->denies('user_sync')) {
                return response()->json([
                    'error' => 'PERMISSION_DENIED',
                    'data' => 'Anda tidak memiliki hak akses untuk sinkronisasi master data.'
                ], 403);
            }
        }

        // SUCCESS
        try {
            $master_url = config('services.master_data.url') ?? env("MASTER_DATA_URL") ?? env("URL_MASTER_DATA") ?? "https://unsmadiun.id";
            $master_url = rtrim($master_url, '/');
            
            $response = Http::withoutVerifying()
                ->timeout(20)
                ->withHeaders([
                    'Content-Type' => "application/json",
                    'Accept' => 'application/json',
                    'User-Agent' => 'Cosco-UNS-App'
                ])
                ->get($master_url . '/api/unauth/users');

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'SYNC_ERROR',
                    'data' => 'Server master data tidak merespon (HTTP ' . $response->status() . '). Endpoint: ' . $master_url . '/api/unauth/users'
                ], 500);
            }
            $res_json = $response->json();
            if (!isset($res_json['data']) || !is_array($res_json['data'])) {
                return response()->json([
                    'error' => 'SYNC_ERROR',
                    'data' => 'Format data dari server master data tidak valid.'
                ], 500);
            }
            $res_data = $res_json['data'];
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'SYNC_ERROR',
                'data' => 'Gagal terhubung ke server master data: ' . $e->getMessage()
            ], 500);
        }

        $res_data = array_filter($res_data, function($data) {
            return ($data['role'] ?? '') != "admin";
        });

        $success_count = 0;
        $fail = [];
        try {
            DB::transaction(function() use ($req, $res_data, &$success_count, &$fail) {
                $admin_user = UserModel::where("role", "admin")->get()->toArray();
                $data_admin_user = [];
                foreach ($admin_user as $list) {
                    $data_admin_user[] = $list['username'];
                }

                foreach ($res_data as $list) {
                    if (!in_array($list['username'], $data_admin_user)) {
                        $user = UserModel::where("master_user_id", $list['id'])
                            ->orWhere('username', $list['username'])
                            ->first();
                            
                        if (isset($user)) {
                            $user->update([
                                'master_user_id' => $list['id'],
                                'username'       => $list['username'],
                                'name'           => $list['name'] ?? $user->name,
                                'avatar_url'     => $list['avatar_url'] ?? '',
                                'no_wa'          => $list['no_wa'] ?? '',
                                'email'          => $list['email'] ?? '',
                                'tipe_user'      => $list['tipe_user'] ?? 'dosen',
                                'status'         => $list['status'] ?? 'active',
                                'nip'            => $list['nip'] ?? $user->nip ?? '',
                                'nama_bank'      => $list['nama_bank'] ?? $user->nama_bank ?? '',
                                'nomor_rekening' => $list['nomor_rekening'] ?? $user->nomor_rekening ?? ''
                            ]);
                        } else {
                            UserModel::create([
                                'master_user_id' => $list['id'],
                                'username'       => $list['username'],
                                'name'           => $list['name'] ?? '',
                                'password'       => "",
                                'role'           => "",
                                'avatar_url'     => $list['avatar_url'] ?? '',
                                'no_wa'          => $list['no_wa'] ?? '',
                                'email'          => $list['email'] ?? '',
                                'tipe_user'      => $list['tipe_user'] ?? 'dosen',
                                'status'         => $list['status'] ?? 'active',
                                'nip'            => $list['nip'] ?? '',
                                'nama_bank'      => $list['nama_bank'] ?? '',
                                'nomor_rekening' => $list['nomor_rekening'] ?? ''
                            ]);
                        }
                        $success_count++;
                    } else {
                        $fail[] = $list['username'];
                    }
                }
            });
        } catch (\Throwable $e) {
            \Log::error("SYNC_MASTER_DATA_DB_ERROR: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'error' => 'SYNC_ERROR',
                'data' => 'Gagal menyimpan data master ke database Cosco: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'status' => "ok",
            'data'   => [
                'total_data'    => count($res_data),
                'success_count' => $success_count,
                'fail'          => $fail
            ]
        ]);
    }

    public function get(Request $request, $id)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        

        //VALIDATION ID
        $id_data=UserModel::find($id);
        if(!isset($id_data)){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>"Bad request."
            ], 400);
        }

        //SUCCESS
        $data=UserRepo::get($id);

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
            'q'         =>"nullable",
            'role'      =>"nullable",
            'status'    =>"nullable",
            'tipe_user' =>"nullable",
            'permission'=>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $user=UserRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$user['current_page'],
            'last_page'     =>$user['last_page'],
            'total'         =>$user['total'],
            'data'          =>$user['data']
        ]);
    }
}