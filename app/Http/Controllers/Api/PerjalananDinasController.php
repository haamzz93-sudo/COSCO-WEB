<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\PerjalananDinasModel;
use App\Models\PaguPerjalananDinasModel;
use App\Models\KegiatanDetailModel;
use App\Models\User;
use App\Repositories\PerjalananDinasRepo;
use App\Services\WablasService;
use App\Jobs\SendWablasJob;

class PerjalananDinasController extends Controller
{
    public function gets(Request $request)
    {
        $loginUser = $request->user();
        $params = $request->all();

        $data = PerjalananDinasRepo::gets($params, $loginUser);
        $paguSummary = PerjalananDinasRepo::getPaguSummary($params['tahun'] ?? null, $loginUser, $params);

        $usersList = [];
        try {
            if (class_exists(User::class)) {
                $usersList = User::select('id', 'name', 'email', 'role')->orderBy('name', 'asc')->get();
            }
        } catch (\Throwable $e) {}

        $tahunFilter = $params['tahun'] ?? date('Y');
        $kegiatanList = KegiatanDetailModel::with(['kegiatan', 'tor', 'user_pic'])
            ->whereHas('kegiatan', function($q) use ($tahunFilter) {
                $q->where('tahun', $tahunFilter);
            })
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status'        => 'success',
            'data'          => $data,
            'pagu_summary'  => $paguSummary,
            'kegiatan_list' => $kegiatanList,
            'users_list'    => $usersList
        ]);
    }

    public function get(Request $request, $id)
    {
        $data = PerjalananDinasRepo::get($id);
        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data perjalanan dinas tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data
        ]);
    }

    public function create(Request $request)
    {
        $loginUser = $request->user();
        $req = $request->all();

        // Validasi: Sesuai arahan Pak Darmawan, nomor_surat_tugas tidak perlu diisi manual oleh PIC
        $validator = Validator::make($req, [
            'nama_kegiatan' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        $durasi = 1;
        if (!empty($req['tgl_berangkat']) && !empty($req['tgl_kembali'])) {
            $tgl1 = strtotime($req['tgl_berangkat']);
            $tgl2 = strtotime($req['tgl_kembali']);
            $durasi = max(1, round(($tgl2 - $tgl1) / (60 * 60 * 24)) + 1);
        }

        $tahun = !empty($req['tgl_berangkat']) ? date('Y', strtotime($req['tgl_berangkat'])) : date('Y');
        $activePagu = PaguPerjalananDinasModel::where('tahun_anggaran', $tahun)->first();
        $paguId = !empty($req['pagu_id']) ? $req['pagu_id'] : ($activePagu ? $activePagu->id : null);

        $assignedUserId = $loginUser['id'];
        if ($loginUser->checkIsAdmin() && !empty($req['user_id'])) {
            $assignedUserId = $req['user_id'];
        }

        // Validasi: Alokasi pagu per rujukan kegiatan tidak boleh dobel melebihi pagu TOR
        if (!empty($kegiatanDetailId)) {
            $existingCount = PerjalananDinasModel::where('kegiatan_detail_id', $kegiatanDetailId)->count();
            if ($existingCount > 0) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Alokasi pagu perjalanan dinas untuk rujukan kegiatan ini sudah terpakai penuh (Sisa: Rp 0). Tidak dapat membuat usulan ganda.'
                ], 422);
            }
        }

        // Auto-generate nomor surat tugas jika tidak diinput manual
        $count = PerjalananDinasModel::count() + 1;
        $nomorST = !empty($req['nomor_surat_tugas']) 
            ? $req['nomor_surat_tugas'] 
            : ('ST/' . date('Ymd') . '/' . str_pad($count, 3, '0', STR_PAD_LEFT));

        $kegiatanDetailId = !empty($req['kegiatan_detail_id']) 
            ? $req['kegiatan_detail_id'] 
            : ($activePagu ? $activePagu->kegiatan_detail_id : null);

        $nominalPagu = !empty($req['nominal_pagu']) 
            ? (int)$req['nominal_pagu'] 
            : ($activePagu ? (int)$activePagu->total_pagu : 25000000);

        $kotaTujuan = $req['tujuan_kota'] ?? (isset($req['lokasi_tujuan']['kota']) ? $req['lokasi_tujuan']['kota'] : 'Daerah Khusus Ibukota Jakarta');
        $tempatTujuan = $req['tujuan_tempat'] ?? (isset($req['lokasi_tujuan']['tempat']) ? $req['lokasi_tujuan']['tempat'] : '');

        $model = PerjalananDinasModel::create([
            'nomor_surat_tugas'  => $nomorST,
            'nama_kegiatan'      => $req['nama_kegiatan'],
            'user_id'            => $assignedUserId,
            'pagu_id'            => $paguId,
            'kegiatan_detail_id' => $kegiatanDetailId,
            'nominal_pagu'       => $nominalPagu,
            'tgl_berangkat'      => $req['tgl_berangkat'] ?? date('Y-m-d'),
            'tgl_kembali'        => $req['tgl_kembali'] ?? date('Y-m-d'),
            'durasi_hari'        => $durasi,
            'lokasi_tujuan'      => [
                'kota'   => $kotaTujuan,
                'tempat' => $tempatTujuan,
                'lat'    => $req['lokasi_lat'] ?? null,
                'lng'    => $req['lokasi_lng'] ?? null,
            ],
            'jenis_transportasi' => $req['jenis_transportasi'] ?? 'Transportasi Dinas / Umum',
            'foto_kegiatan'      => $req['foto_kegiatan'] ?? [],
            'berkas_bukti'       => $req['berkas_bukti'] ?? [],
            'nominal_klaim'      => $req['nominal_klaim'] ?? 0,
            'nominal_disetujui'  => 0,
            'status'             => 'draft',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Ajuan perjalanan dinas berhasil dibuat. Silakan lengkapi berkas & foto kegiatan.',
            'data'    => PerjalananDinasRepo::get($model->id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $loginUser = $request->user();
        $model = PerjalananDinasModel::find($id);

        if (!$model) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data perjalanan dinas tidak ditemukan.'
            ], 404);
        }

        if ($model->user_id !== $loginUser['id'] && !$loginUser->checkIsAdmin()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak memiliki hak akses mengubah data ini.'
            ], 403);
        }

        $req = $request->all();

        $updateData = [];
        if (isset($req['nomor_surat_tugas'])) $updateData['nomor_surat_tugas'] = $req['nomor_surat_tugas'];
        if (isset($req['nama_kegiatan'])) $updateData['nama_kegiatan'] = $req['nama_kegiatan'];
        if (isset($req['tgl_berangkat'])) $updateData['tgl_berangkat'] = $req['tgl_berangkat'];
        if (isset($req['tgl_kembali'])) $updateData['tgl_kembali'] = $req['tgl_kembali'];
        if (isset($req['durasi_hari'])) $updateData['durasi_hari'] = $req['durasi_hari'];
        if (isset($req['lokasi_tujuan'])) $updateData['lokasi_tujuan'] = $req['lokasi_tujuan'];
        if (isset($req['jenis_transportasi'])) $updateData['jenis_transportasi'] = $req['jenis_transportasi'];
        if (isset($req['foto_kegiatan'])) $updateData['foto_kegiatan'] = $req['foto_kegiatan'];
        if (isset($req['berkas_bukti'])) $updateData['berkas_bukti'] = $req['berkas_bukti'];
        if (isset($req['nominal_klaim'])) $updateData['nominal_klaim'] = $req['nominal_klaim'];
        if (isset($req['kegiatan_detail_id'])) $updateData['kegiatan_detail_id'] = $req['kegiatan_detail_id'];

        $model->update($updateData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data bukti perjalanan dinas berhasil disimpan.',
            'data'    => PerjalananDinasRepo::get($model->id)
        ]);
    }

    public function submit(Request $request, $id)
    {
        $loginUser = $request->user();
        $model = PerjalananDinasModel::find($id);

        if (!$model) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data perjalanan dinas tidak ditemukan.'
            ], 404);
        }

        if ($model->user_id !== $loginUser['id'] && !$loginUser->checkIsAdmin()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak memiliki hak akses mengajukan data ini.'
            ], 403);
        }

        $req = $request->all();
        if (isset($req['foto_kegiatan'])) $model->foto_kegiatan = $req['foto_kegiatan'];
        if (isset($req['berkas_bukti'])) $model->berkas_bukti = $req['berkas_bukti'];
        if (isset($req['nominal_klaim'])) $model->nominal_klaim = $req['nominal_klaim'];

        $model->status = 'diajukan';
        $model->save();

        // Notifikasi WA ke Verifikator SPJ & Admin
        try {
            $verifikatorList = User::where('role', 'like', '%verifikator%')
                ->orWhere('role', 'like', '%admin%')
                ->get();

            $msg = "*COSCO SUPER APPS — PENGAJUAN KLAIM PERJALANAN DINAS BARU*\n\n"
                 . "Telah masuk pengajuan klaim SPPD dari *" . $loginUser['name'] . "*:\n\n"
                 . "📌 *No. Surat Tugas:* " . $model->nomor_surat_tugas . "\n"
                 . "📌 *Kegiatan:* " . $model->nama_kegiatan . "\n"
                 . "📌 *Nominal Klaim:* Rp " . number_format($model->nominal_klaim, 0, ',', '.') . "\n"
                 . "📌 *Status:* Menunggu Validasi SPJ\n\n"
                 . "Silakan login ke portal COSCO untuk memeriksa foto ber-watermark dan berkas pendukung:\n"
                 . "https://cosco.unsmadiun.id/dashboard/perjalanan_dinas";

            foreach ($verifikatorList as $v) {
                if (!empty($v->phone)) {
                    WablasService::sendMessage($v->phone, $msg);
                }
            }
        } catch (\Exception $e) {
            Log::error('WA Perjalanan Dinas Submit Notification Error: ' . $e->getMessage());
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Ajuan klaim perjalanan dinas berhasil diajukan untuk divalidasi.',
            'data'    => PerjalananDinasRepo::get($model->id)
        ]);
    }

    public function validasi(Request $request, $id)
    {
        $loginUser = $request->user();
        $model = PerjalananDinasModel::with('user')->find($id);

        if (!$model) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data perjalanan dinas tidak ditemukan.'
            ], 404);
        }

        $req = $request->all();
        $status = $req['status'] ?? 'diverifikasi'; // 'diverifikasi' or 'revisi'
        $catatan = $req['catatan_verifikator'] ?? '';
        $nominalDisetujui = isset($req['nominal_disetujui']) ? (int) $req['nominal_disetujui'] : (int) $model->nominal_klaim;

        $model->update([
            'status'              => $status,
            'nominal_disetujui'   => $status === 'diverifikasi' ? $nominalDisetujui : $model->nominal_disetujui,
            'catatan_verifikator' => $catatan,
            'verifikator_id'      => $loginUser['id'],
            'tgl_verifikasi'      => now(),
        ]);

        // Notifikasi WA ke Pengaju (PIC)
        try {
            if ($model->user && !empty($model->user->phone)) {
                $statusText = $status === 'diverifikasi' ? 'DISETUJUI & SIAP BAYAR' : 'PERLU REVISI';
                $msg = "*COSCO SUPER APPS — VALIDASI SPJ PERJALANAN DINAS*\n\n"
                     . "Halo *" . $model->user->name . "*,\n"
                     . "Pengajuan klaim perjalanan dinas Anda telah divalidasi dengan status: *" . $statusText . "*\n\n"
                     . "📌 *No. ST:* " . $model->nomor_surat_tugas . "\n"
                     . "📌 *Kegiatan:* " . $model->nama_kegiatan . "\n"
                     . "📌 *Nominal Disetujui:* Rp " . number_format($model->nominal_disetujui, 0, ',', '.') . "\n";

                if (!empty($catatan)) {
                    $msg .= "📌 *Catatan Verifikator:* " . $catatan . "\n";
                }

                $msg .= "\\nDetail ajuan: https://cosco.unsmadiun.id/dashboard/perjalanan_dinas";
                WablasService::sendMessage($model->user->phone, $msg);
            }
        } catch (\Exception $e) {
            Log::error('WA Perjalanan Dinas Validasi Error: ' . $e->getMessage());
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Status validasi SPJ berhasil diperbarui.',
            'data'    => PerjalananDinasRepo::get($model->id)
        ]);
    }

    public function pembayaran(Request $request, $id)
    {
        $loginUser = $request->user();
        $model = PerjalananDinasModel::with('user')->find($id);

        if (!$model) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data perjalanan dinas tidak ditemukan.'
            ], 404);
        }

        $req = $request->all();
        $buktiBayar = $req['bukti_bayar'] ?? null;
        $catatanBayar = $req['catatan_pembayaran'] ?? 'Pembayaran telah ditransfer melalui Bendahara.';

        $model->update([
            'status'             => 'dibayarkan',
            'bukti_bayar'        => $buktiBayar,
            'catatan_pembayaran' => $catatanBayar,
            'tgl_bayar'          => now(),
            'bendahara_id'       => $loginUser['id'],
        ]);

        // Notifikasi WA ke Pengaju (PIC)
        try {
            if ($model->user && !empty($model->user->phone)) {
                $msg = "*COSCO SUPER APPS — PENCAIRAN PERJALANAN DINAS*\n\n"
                     . "Yth. *" . $model->user->name . "*,\n"
                     . "Klaim perjalanan dinas Anda telah berhasil *DIBAYARKAN (LUNAS)* oleh Bendahara.\n\n"
                     . "📌 *No. ST:* " . $model->nomor_surat_tugas . "\n"
                     . "📌 *Kegiatan:* " . $model->nama_kegiatan . "\n"
                     . "📌 *Nominal Dicairkan:* Rp " . number_format($model->nominal_disetujui, 0, ',', '.') . "\n"
                     . "📌 *Tanggal Pencairan:* " . date('d F Y H:i') . " WIB\n\n"
                     . "Terima kasih telah melengkapi bukti perjalanan dinas Anda.\n"
                     . "Cek bukti transfer: https://cosco.unsmadiun.id/dashboard/perjalanan_dinas";
                WablasService::sendMessage($model->user->phone, $msg);
            }
        } catch (\Exception $e) {
            Log::error('WA Perjalanan Dinas Pembayaran Error: ' . $e->getMessage());
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Pembayaran klaim perjalanan dinas berhasil diselesaikan. Pagu anggaran telah diperbarui.',
            'data'    => PerjalananDinasRepo::get($model->id)
        ]);
    }

    public function delete(Request $request, $id)
    {
        $loginUser = $request->user();
        $model = PerjalananDinasModel::find($id);

        if (!$model) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        if ($model->status !== 'draft' && !$loginUser->checkIsAdmin()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hanya draft yang dapat dihapus.'
            ], 400);
        }

        $model->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data perjalanan dinas berhasil dihapus.'
        ]);
    }

    public function pagu_update(Request $request)
    {
        $loginUser = $request->user();
        if (!$loginUser->checkIsAdmin()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hanya Admin yang dapat mengelola pagu anggaran.'
            ], 403);
        }

        $req = $request->all();
        $tahun = $req['tahun_anggaran'] ?? date('Y');
        $namaPagu = $req['nama_pagu'] ?? ('Pagu Perjalanan Dinas TA ' . $tahun);
        $totalPagu = (int) ($req['total_pagu'] ?? 0);

        if ($totalPagu <= 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Total pagu harus lebih besar dari 0.'
            ], 422);
        }

        $pagu = PaguPerjalananDinasModel::updateOrCreate(
            ['tahun_anggaran' => $tahun],
            [
                'nama_pagu'          => $namaPagu,
                'total_pagu'         => $totalPagu,
                'kegiatan_detail_id' => !empty($req['kegiatan_detail_id']) ? $req['kegiatan_detail_id'] : null,
                'keterangan'         => $req['keterangan'] ?? 'Alokasi Pagu Perjalanan Dinas Civitas',
                'created_by'         => $loginUser['id']
            ]
        );

        // Sinkronisasi dua arah ke TOR Kegiatan (kegiatan_details.biaya)
        if (!empty($req['kegiatan_detail_id'])) {
            KegiatanDetailModel::where('id', $req['kegiatan_detail_id'])->update([
                'biaya' => $totalPagu
            ]);
        }

        return response()->json([
            'status'       => 'success',
            'message'      => 'Pagu anggaran perjalanan dinas berhasil disimpan.',
            'pagu_summary' => PerjalananDinasRepo::getPaguSummary($tahun)
        ]);
    }
}
