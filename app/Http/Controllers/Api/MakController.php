<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repositories\MakRepo;
use App\Models\MakModel;

class MakController extends Controller
{

    public function add(Request $request)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if ($login_data && !$login_data->checkIsAdmin() && Gate::denies('mak_add', $login_data)) {
            return response()->json([
                'error' => "AUTH_ERROR",
                'message' => "Anda tidak memiliki hak akses untuk menambah MAK."
            ], 403);
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'kode_mak'     => 'required|unique:maks,kode_mak',
            'nama_belanja' => 'required'
        ], [
            'kode_mak.required'     => 'Kode MAK wajib diisi.',
            'kode_mak.unique'       => 'Kode MAK sudah terdaftar, gunakan kode yang berbeda.',
            'nama_belanja.required' => 'Nama belanja anggaran wajib diisi.'
        ]);

        if ($validation->fails()) {
            return response()->json([
                'error'   => "VALIDATION_ERROR",
                'data'    => $validation->errors()->first(),
                'message' => $validation->errors()->first()
            ], 400);
        }

        // SUCCESS
        try {
            DB::transaction(function() use ($req) {
                MakModel::create([
                    'kode_mak'     => trim($req['kode_mak']),
                    'nama_belanja' => trim($req['nama_belanja'])
                ]);
            });

            return response()->json([
                'status'  => "ok",
                'message' => "Mata Anggaran berhasil ditambahkan!"
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error'   => "SERVER_ERROR",
                'message' => "Gagal menyimpan data: " . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if ($login_data && !$login_data->checkIsAdmin() && Gate::denies('mak_update', $login_data)) {
            return response()->json([
                'error' => "AUTH_ERROR",
                'message' => "Anda tidak memiliki hak akses untuk mengedit MAK."
            ], 403);
        }

        // VALIDATION ID
        $id_data = MakModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "Data MAK tidak ditemukan."
            ], 404);
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'kode_mak' => [
                'required',
                Rule::unique('maks', 'kode_mak')->ignore($id)
            ],
            'nama_belanja' => 'required'
        ], [
            'kode_mak.required'     => 'Kode MAK wajib diisi.',
            'kode_mak.unique'       => 'Kode MAK sudah digunakan oleh data lain.',
            'nama_belanja.required' => 'Nama belanja anggaran wajib diisi.'
        ]);

        if ($validation->fails()) {
            return response()->json([
                'error'   => "VALIDATION_ERROR",
                'data'    => $validation->errors()->first(),
                'message' => $validation->errors()->first()
            ], 400);
        }

        // SUCCESS
        try {
            DB::transaction(function() use ($req, $id) {
                MakModel::find($id)->update([
                    'kode_mak'     => trim($req['kode_mak']),
                    'nama_belanja' => trim($req['nama_belanja'])
                ]);
            });

            return response()->json([
                'status'  => "ok",
                'message' => "Mata Anggaran berhasil diperbarui!"
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error'   => "SERVER_ERROR",
                'message' => "Gagal memperbarui data: " . $e->getMessage()
            ], 500);
        }
    }

    public function delete(Request $request, $id)
    {
        $login_data = $request->user();

        // ROLE AUTHENTICATION
        if ($login_data && !$login_data->checkIsAdmin() && Gate::denies('mak_delete', $login_data)) {
            return response()->json([
                'error' => "AUTH_ERROR",
                'message' => "Anda tidak memiliki hak akses untuk menghapus MAK."
            ], 403);
        }

        // VALIDATION ID
        $id_data = MakModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "Data MAK tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        try {
            DB::transaction(function() use ($id) {
                MakModel::find($id)->delete();
            });

            return response()->json([
                'status'  => "ok",
                'message' => "Mata Anggaran berhasil dihapus!"
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error'   => "SERVER_ERROR",
                'message' => "Gagal menghapus data: " . $e->getMessage()
            ], 500);
        }
    }

    public function get(Request $request, $id)
    {
        $id_data = MakModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "Data MAK tidak ditemukan."
            ], 404);
        }

        $data = MakRepo::get($id);

        return response()->json([
            'data' => $data
        ]);
    }

    public function gets(Request $request)
    {
        $req = $request->all();

        $validation = Validator::make($req, [
            'per_page' => "nullable|integer|min:1",
            'q'        => "nullable"
        ]);
        if ($validation->fails()) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => $validation->errors()->first()
            ], 400);
        }

        $data = MakRepo::gets($req);

        return response()->json([
            'first_page'   => 1,
            'current_page' => $data['current_page'],
            'last_page'    => $data['last_page'],
            'total'        => $data['total'],
            'data'         => $data['data']
        ]);
    }
}
