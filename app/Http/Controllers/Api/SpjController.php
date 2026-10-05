<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repositories\SpjRepo;
use App\Models\SpjModel;
use App\Models\MemoCairModel;
use App\Models\KelompokBelanjaModel;
use App\Models\TorModel;

class SpjController extends Controller
{
    public function update(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (Gate::denies('spj_pic_update', $login_data) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        // VALIDATION ID
        $id_data = SpjModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Data SPJ tidak ditemukan'
            ], 400);
        }

        // VALIDATION CLOSED
        $memo_cair = MemoCairModel::find($id_data['memo_cair_id']);
        if ($memo_cair) {
            if (!in_array($memo_cair['status_spj'], ["draft", "keuangan_revisi", "closed", "", null]) && !$login_data->checkIsAdmin()) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Status SPJ sudah terkunci dan tidak dapat diubah."
                ], 400);
            }
        }
        
        // PIC KEGIATAN TOR VALIDATION
        $tor_id = $memo_cair ? $memo_cair['tor_id'] : null;
        if ($tor_id && !$login_data->checkIsAdmin()) {
            $tor = TorModel::with("kegiatan_detail")->find($tor_id);
            if (isset($tor)) {
                if ($tor['status_ajuan'] != "wakil_dekan_applied") {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Status TOR belum disetujui Wakil Dekan."
                    ], 400);
                }

                if (in_array("specific_pic", $login_data['permissions'] ?? []) && ($tor['kegiatan_detail']['pic_kegiatan'] ?? 0) != $login_data['id']) {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Anda bukan PIC untuk kegiatan ini."
                    ], 400);
                }
            }
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'no_kwitansi'                => "nullable",
            'sudah_diterima_dari'        => "required",
            'untuk_pembayaran'           => "required",
            'penerima_id'                => "required|exists:App\Models\User,id",
            'kuasa_pengguna_anggaran_id' => "nullable|exists:App\Models\User,id",
            'bendahara_id'               => "nullable|exists:App\Models\User,id",
            'lampiran'                   => 'nullable|array'
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
                'no_kwitansi'                => $req['no_kwitansi'] ?? '',
                'sudah_diterima_dari'        => $req['sudah_diterima_dari'] ?? '',
                'untuk_pembayaran'           => $req['untuk_pembayaran'] ?? '',
                'penerima_id'                => $req['penerima_id'] ?? null,
                'kuasa_pengguna_anggaran_id' => $req['kuasa_pengguna_anggaran_id'] ?? null,
                'bendahara_id'               => $req['bendahara_id'] ?? null,
            ];

            if (isset($req['lampiran'])) {
                $data_update['lampiran'] = $req['lampiran'];
            }

            SpjModel::find($id)->update($data_update);
        });

        return response()->json([
            'status' => "ok"
        ]);
    }

    public function update_kwitansi(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (Gate::denies('spj_pic_update', $login_data) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        // VALIDATION ID
        $id_data = SpjModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Data SPJ tidak ditemukan'
            ], 400);
        }

        // VALIDATION CLOSED
        $memo_cair = MemoCairModel::find($id_data['memo_cair_id']);
        if ($memo_cair) {
            if (!in_array($memo_cair['status_spj'], ["draft", "keuangan_revisi", "closed", "", null]) && !$login_data->checkIsAdmin()) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Status SPJ sudah terkunci dan tidak dapat diubah."
                ], 400);
            }
        }
        
        // PIC KEGIATAN TOR VALIDATION
        $tor_id = $memo_cair ? $memo_cair['tor_id'] : null;
        if ($tor_id && !$login_data->checkIsAdmin()) {
            $tor = TorModel::with("kegiatan_detail")->find($tor_id);
            if (isset($tor)) {
                if ($tor['status_ajuan'] != "wakil_dekan_applied") {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Status TOR belum disetujui Wakil Dekan."
                    ], 400);
                }

                if (in_array("specific_pic", $login_data['permissions'] ?? []) && ($tor['kegiatan_detail']['pic_kegiatan'] ?? 0) != $login_data['id']) {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Anda bukan PIC untuk kegiatan ini."
                    ], 400);
                }
            }
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'no_kwitansi'                => "nullable",
            'sudah_diterima_dari'        => "required",
            'untuk_pembayaran'           => "required",
            'penerima_id'                => "required|exists:App\Models\User,id",
            'kuasa_pengguna_anggaran_id' => "nullable|exists:App\Models\User,id",
            'bendahara_id'               => "nullable|exists:App\Models\User,id"
        ]);
        
        if ($validation->fails()) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => $validation->errors()->first()
            ], 400);
        }

        // SUCCESS
        DB::transaction(function() use ($req, $id, $id_data) {
            $existingData = is_array($id_data->data) ? $id_data->data : [];
            if (isset($req['is_penerima_membayarkan'])) {
                $existingData['is_penerima_membayarkan'] = (bool)$req['is_penerima_membayarkan'];
            }

            $data_update = [
                'no_kwitansi'                => $req['no_kwitansi'] ?? '',
                'sudah_diterima_dari'        => $req['sudah_diterima_dari'] ?? '',
                'untuk_pembayaran'           => $req['untuk_pembayaran'] ?? '',
                'penerima_id'                => $req['penerima_id'] ?? null,
                'kuasa_pengguna_anggaran_id' => $req['kuasa_pengguna_anggaran_id'] ?? null,
                'bendahara_id'               => $req['bendahara_id'] ?? null,
                'data'                       => $existingData
            ];

            SpjModel::find($id)->update($data_update);
        });

        return response()->json([
            'status' => "ok"
        ]);
    }

    public function update_lampiran(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (Gate::denies('spj_pic_update', $login_data) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        // VALIDATION ID
        $id_data = SpjModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Data SPJ tidak ditemukan'
            ], 400);
        }

        // VALIDATION CLOSED
        $memo_cair = MemoCairModel::find($id_data['memo_cair_id']);
        if ($memo_cair) {
            if (!in_array($memo_cair['status_spj'], ["draft", "keuangan_revisi", "closed", "", null]) && !$login_data->checkIsAdmin()) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Status SPJ sudah terkunci dan tidak dapat diubah."
                ], 400);
            }
        }
        
        // PIC KEGIATAN TOR VALIDATION
        $tor_id = $memo_cair ? $memo_cair['tor_id'] : null;
        if ($tor_id && !$login_data->checkIsAdmin()) {
            $tor = TorModel::with("kegiatan_detail")->find($tor_id);
            if (isset($tor)) {
                if ($tor['status_ajuan'] != "wakil_dekan_applied") {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Status TOR belum disetujui Wakil Dekan."
                    ], 400);
                }

                if (in_array("specific_pic", $login_data['permissions'] ?? []) && ($tor['kegiatan_detail']['pic_kegiatan'] ?? 0) != $login_data['id']) {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Anda bukan PIC untuk kegiatan ini."
                    ], 400);
                }
            }
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'lampiran' => 'nullable|array'
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
                'lampiran' => $req['lampiran'] ?? []
            ];

            SpjModel::find($id)->update($data_update);
        });

        return response()->json([
            'status' => "ok"
        ]);
    }

    public function update_data(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (Gate::denies('spj_pic_update', $login_data) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        // VALIDATION ID
        $id_data = SpjModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Data SPJ tidak ditemukan'
            ], 400);
        }

        // VALIDATION CLOSED
        $memo_cair = MemoCairModel::find($id_data['memo_cair_id']);
        if ($memo_cair) {
            if (!in_array($memo_cair['status_spj'], ["draft", "keuangan_revisi", "closed", "", null]) && !$login_data->checkIsAdmin()) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Status SPJ sudah terkunci dan tidak dapat diubah."
                ], 400);
            }
        }
        
        // PIC KEGIATAN TOR VALIDATION
        $tor_id = $memo_cair ? $memo_cair['tor_id'] : null;
        if ($tor_id && !$login_data->checkIsAdmin()) {
            $tor = TorModel::with("kegiatan_detail")->find($tor_id);
            if (isset($tor)) {
                if ($tor['status_ajuan'] != "wakil_dekan_applied") {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Status TOR belum disetujui Wakil Dekan."
                    ], 400);
                }

                if (in_array("specific_pic", $login_data['permissions'] ?? []) && ($tor['kegiatan_detail']['pic_kegiatan'] ?? 0) != $login_data['id']) {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Anda bukan PIC untuk kegiatan ini."
                    ], 400);
                }
            }
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'data' => 'nullable'
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
                'data' => $req['data']
            ];

            SpjModel::find($id)->update($data_update);
        });

        return response()->json([
            'status' => "ok"
        ]);
    }

    public function update_file_spj(Request $request, $id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // ROLE AUTHENTICATION
        if (Gate::denies('spj_pic_update', $login_data) && !$login_data->checkIsAdmin()) {
            return response('Not Allowed.', 403);
        }

        // VALIDATION ID
        $id_data = SpjModel::find($id);
        if (!isset($id_data)) {
            return response()->json([
                'error' => 'VALIDATION_ERROR',
                'data' => 'Data SPJ tidak ditemukan'
            ], 400);
        }

        // VALIDATION CLOSED
        $memo_cair = MemoCairModel::find($id_data['memo_cair_id']);
        if ($memo_cair) {
            if (!in_array($memo_cair['status_spj'], ["draft", "keuangan_revisi", "closed", "", null]) && !$login_data->checkIsAdmin()) {
                return response()->json([
                    'error' => "VALIDATION_ERROR",
                    'data'  => "Status SPJ sudah terkunci dan tidak dapat diubah."
                ], 400);
            }
        }
        
        // PIC KEGIATAN TOR VALIDATION
        $tor_id = $memo_cair ? $memo_cair['tor_id'] : null;
        if ($tor_id && !$login_data->checkIsAdmin()) {
            $tor = TorModel::with("kegiatan_detail")->find($tor_id);
            if (isset($tor)) {
                if ($tor['status_ajuan'] != "wakil_dekan_applied") {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Status TOR belum disetujui Wakil Dekan."
                    ], 400);
                }

                if (in_array("specific_pic", $login_data['permissions'] ?? []) && ($tor['kegiatan_detail']['pic_kegiatan'] ?? 0) != $login_data['id']) {
                    return response()->json([
                        'error' => "VALIDATION_ERROR",
                        'data'  => "Anda bukan PIC untuk kegiatan ini."
                    ], 400);
                }
            }
        }

        // VALIDATION
        $validation = Validator::make($req, [
            'file_spj' => 'required|string'
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
                'file_spj' => $req['file_spj']
            ];

            SpjModel::find($id)->update($data_update);
        });

        return response()->json([
            'status' => "ok"
        ]);
    }

    public function gets(Request $request)
    {
        return response()->json(['data' => []]);
    }

    public function get(Request $request, $id)
    {
        $data = SpjModel::find($id);
        return response()->json(['data' => $data]);
    }

    public function add(Request $request)
    {
        return response()->json(['status' => 'ok']);
    }

    public function delete(Request $request, $id)
    {
        $item = SpjModel::find($id);
        if ($item) $item->delete();
        return response()->json(['status' => 'ok']);
    }
}