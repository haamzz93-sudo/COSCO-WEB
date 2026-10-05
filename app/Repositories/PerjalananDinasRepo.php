<?php

namespace App\Repositories;

use App\Models\PerjalananDinasModel;
use App\Models\PaguPerjalananDinasModel;
use Illuminate\Support\Facades\DB;

class PerjalananDinasRepo
{
    public static function get($id)
    {
        try {
            $query = PerjalananDinasModel::with([
                'user',
                'pagu',
                'kegiatan_detail.kegiatan',
                'verifikator',
                'bendahara'
            ])->find($id);

            return $query ? $query->toArray() : null;
        } catch (\Throwable $e) {
            \Log::warning('PerjalananDinasRepo get error: ' . $e->getMessage());
            return null;
        }
    }

    public static function gets($params, $loginUser)
    {
        try {
            $perPage = isset($params['per_page']) ? (int) $params['per_page'] : 15;
            $q = $params['q'] ?? '';
            $status = $params['status'] ?? '';
            $tab = $params['tab'] ?? ''; // 'my', 'validasi', 'pembayaran', 'all'

            $query = PerjalananDinasModel::with([
                'user',
                'pagu',
                'kegiatan_detail.kegiatan',
                'verifikator',
                'bendahara'
            ]);

            $userRole = strtolower(trim((string)($loginUser['role'] ?? $loginUser->role ?? '')));
            $isAdmin = method_exists($loginUser, 'checkIsAdmin') ? $loginUser->checkIsAdmin() : false;
            $isVerifikator = $userRole === 'verifikator_spj' || in_array('spj_keuangan_validasi', $loginUser['permissions'] ?? []);
            $isBendahara = $userRole === 'bendahara';

            if ($isAdmin) {
                if ($tab === 'my') {
                    $query->where('user_id', $loginUser['id'] ?? $loginUser->id);
                } elseif (!empty($params['user_id'])) {
                    $query->where('user_id', $params['user_id']);
                } elseif ($tab === 'validasi') {
                    $query->whereIn('status', ['diajukan', 'diverifikasi', 'revisi']);
                } elseif ($tab === 'pembayaran') {
                    $query->whereIn('status', ['diverifikasi', 'dibayarkan']);
                }
            } elseif (!$isVerifikator && !$isBendahara) {
                $query->where('user_id', $loginUser['id'] ?? $loginUser->id);
            } elseif ($isVerifikator) {
                if ($tab === 'my') {
                    $query->where('user_id', $loginUser['id'] ?? $loginUser->id);
                } else {
                    $query->whereIn('status', ['diajukan', 'diverifikasi', 'revisi']);
                }
            } elseif ($isBendahara) {
                if ($tab === 'my') {
                    $query->where('user_id', $loginUser['id'] ?? $loginUser->id);
                } else {
                    $query->whereIn('status', ['diverifikasi', 'dibayarkan']);
                }
            }

            if (!empty($q)) {
                $query->where(function($w) use ($q) {
                    $w->where('nomor_surat_tugas', 'LIKE', "%{$q}%")
                      ->orWhere('nama_kegiatan', 'LIKE', "%{$q}%")
                      ->orWhere('tujuan_kota', 'LIKE', "%{$q}%")
                      ->orWhereHas('user', function($u) use ($q) {
                          $u->where('name', 'LIKE', "%{$q}%");
                      });
                });
            }

            if (!empty($status) && $status !== 'all') {
                $query->where('status', $status);
            }

            // 1. Filter ketat berdasarkan Tahun Anggaran dari kegiatan induk resmi
            if (!empty($params['tahun'])) {
                $thn = (string) $params['tahun'];
                $query->whereHas('kegiatan_detail.kegiatan', function($k) use ($thn) {
                    $k->where('tahun', $thn);
                });
            }

            // 2. Eliminasi data dummy: HANYA tampilkan penugasan yang memiliki rujukan Kegiatan resmi di database
            $query->whereHas('kegiatan_detail');

            return $query->orderBy('id', 'desc')->paginate($perPage);
        } catch (\Throwable $e) {
            \Log::warning('PerjalananDinasRepo gets error: ' . $e->getMessage());
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);
        }
    }

    public static function getPaguSummary($tahun = null, $loginUser = null, $params = [])
    {
        $tahun = $tahun ?: date('Y');

        $defaultSummary = [
            'tahun'             => (int) $tahun,
            'total_pagu'        => 0,
            'total_dibayarkan'  => 0,
            'total_pending'     => 0,
            'sisa_pagu'         => 0,
            'persentase'        => 0,
            'pagu_list'         => [],
            'active_pagu'       => null,
            'is_per_pic'        => false,
            'pic_id'            => null,
            'pic_name'          => null,
        ];

        try {
            $userRole = strtolower(trim((string)($loginUser['role'] ?? $loginUser->role ?? '')));
            $isAdmin = method_exists($loginUser, 'checkIsAdmin') 
                ? $loginUser->checkIsAdmin() 
                : in_array($userRole, ['superadmin', 'admin', 'pimpinan', 'bendahara']);

            $tab = $params['tab'] ?? '';
            $filterUserId = !empty($params['user_id']) ? (int)$params['user_id'] : null;
            $loginUserId = 0;
            if (is_object($loginUser) && isset($loginUser->id)) {
                $loginUserId = (int)$loginUser->id;
            } elseif (is_array($loginUser) && isset($loginUser['id'])) {
                $loginUserId = (int)$loginUser['id'];
            }

            // Aturan Pagu:
            // 1. Akun PIC Civitas (non-admin) -> MURNI PER-PIC (hanya pagu kegiatan TOR RAB miliknya di tahun aktif)
            // 2. Admin di tab 'my' (Tugas Pribadi) -> PER-PIC untuk loginUser
            // 3. Admin memilih filter PIC tertentu -> PER-PIC untuk filterUserId
            // 4. Admin melihat 'Semua Penugasan PIC' -> GLOBAL ADMIN (Tetap 740 Juta total pagu kampus)
            $targetUserId = null;
            if (!$isAdmin) {
                $targetUserId = $loginUserId;
            } else {
                if ($tab === 'my') {
                    $targetUserId = $loginUserId;
                } elseif (!empty($filterUserId)) {
                    $targetUserId = $filterUserId;
                }
            }

            $paguList = [];
            $activePagu = null;
            $totalPagu = 0;
            $totalDibayarkan = 0;
            $totalPending = 0;
            $picName = null;

            if ($targetUserId) {
                // === MODE PER-PIC (REALTIME SINKRON TOR RAB KEGIATAN PER TAHUN ANGGARAN) ===
                if (class_exists(\App\Models\User::class)) {
                    $picUser = \App\Models\User::find($targetUserId);
                    $picName = $picUser ? $picUser->name : null;
                }

                // 1. OPSI 2 (REALTIME TOR RAB): Ambil pagu kegiatan dari detail kegiatan TOR RAB di mana user bertindak sebagai PIC resmi pada tahun anggaran bersangkutan
                $sumKdPagu = (int) \Illuminate\Support\Facades\DB::table('kegiatan_details')
                    ->join('kegiatans', 'kegiatan_details.kegiatan_id', '=', 'kegiatans.id')
                    ->where('kegiatan_details.pic_kegiatan', $targetUserId)
                    ->where('kegiatans.tahun', $tahun)
                    ->sum('kegiatan_details.biaya');

                // Query seluruh surat tugas perjalanan dinas milik PIC di tahun bersangkutan
                $pdQuery = \App\Models\PerjalananDinasModel::where('user_id', $targetUserId);
                if (!empty($tahun)) {
                    $pdQuery->where(function($q) use ($tahun) {
                        $q->whereHas('kegiatan_detail.kegiatan', function($k) use ($tahun) {
                            $k->where('tahun', $tahun);
                        })
                        ->orWhereYear('tgl_berangkat', $tahun)
                        ->orWhereYear('created_at', $tahun);
                    });
                }

                // 2. Fallback untuk staf/pelaksana non-PIC kegiatan: Ambil dari akumulasi nominal surat tugas dinas
                $sumPdPagu = (int) (clone $pdQuery)->sum('nominal_pagu');

                // Prioritaskan pagu TOR RAB kegiatan PIC (misal Rp 26.800.000 untuk Pak Darmawan)
                $totalPagu = $sumKdPagu > 0 ? $sumKdPagu : $sumPdPagu;

                // Total realisasi yang sudah dicairkan / lunas untuk PIC ini
                $totalDibayarkan = (int) (clone $pdQuery)
                    ->where('status', 'dibayarkan')
                    ->get()
                    ->sum(function($p) {
                        return $p->nominal_disetujui > 0 ? $p->nominal_disetujui : ($p->nominal_klaim ?: 0);
                    });

                // Total klaim yang sedang dalam proses verifikasi / menunggu pencairan milik PIC ini
                $totalPending = (int) (clone $pdQuery)
                    ->whereIn('status', ['diajukan', 'diverifikasi'])
                    ->sum('nominal_klaim');

            } else {
                // === MODE GLOBAL ADMIN (SEMUA PENUGASAN CIVITAS - TETAP PAGU TOTAL UNIVERSITAS 740 JUTA) ===
                $totalPagu = (int) \Illuminate\Support\Facades\DB::table('kegiatan_details')
                    ->join('kegiatans', 'kegiatan_details.kegiatan_id', '=', 'kegiatans.id')
                    ->where('kegiatans.tahun', $tahun)
                    ->sum('kegiatan_details.biaya');

                if (class_exists(\App\Models\PaguPerjalananDinasModel::class)) {
                    $paguList = \App\Models\PaguPerjalananDinasModel::with(['kegiatan_detail.kegiatan', 'kegiatan_detail.tor'])
                        ->where('tahun_anggaran', $tahun)
                        ->whereHas('kegiatan_detail.kegiatan', function($k) use ($tahun) {
                            $k->where('tahun', $tahun);
                        })
                        ->get();
                    $activePagu = $paguList->first();
                }

                if (class_exists(\App\Models\PerjalananDinasModel::class)) {
                    $totalDibayarkan = (int) \App\Models\PerjalananDinasModel::where('status', 'dibayarkan')
                        ->where(function($q) use ($tahun) {
                            $q->whereHas('kegiatan_detail.kegiatan', function($k) use ($tahun) {
                                $k->where('tahun', $tahun);
                            })
                            ->orWhereYear('tgl_berangkat', $tahun)
                            ->orWhereYear('created_at', $tahun);
                        })
                        ->get()
                        ->sum(function($p) {
                            return $p->nominal_disetujui > 0 ? $p->nominal_disetujui : ($p->nominal_klaim ?: 0);
                        });

                    $totalPending = (int) \App\Models\PerjalananDinasModel::whereIn('status', ['diajukan', 'diverifikasi'])
                        ->where(function($q) use ($tahun) {
                            $q->whereHas('kegiatan_detail.kegiatan', function($k) use ($tahun) {
                                $k->where('tahun', $tahun);
                            })
                            ->orWhereYear('tgl_berangkat', $tahun)
                            ->orWhereYear('created_at', $tahun);
                        })
                        ->sum('nominal_klaim');
                }
            }

            $sisaPagu = max(0, $totalPagu - $totalDibayarkan);
            $persentase = $totalPagu > 0 ? round(($totalDibayarkan / $totalPagu) * 100, 1) : 0;

            return [
                'tahun'             => (int) $tahun,
                'total_pagu'        => $totalPagu,
                'total_dibayarkan'  => $totalDibayarkan,
                'total_pending'     => $totalPending,
                'sisa_pagu'         => $sisaPagu,
                'persentase'        => $persentase,
                'pagu_list'         => $paguList,
                'active_pagu'       => $activePagu,
                'is_per_pic'        => $targetUserId !== null,
                'pic_id'            => $targetUserId,
                'pic_name'          => $picName,
            ];
        } catch (\Throwable $e) {
            \Log::warning('PerjalananDinasRepo getPaguSummary error: ' . $e->getMessage());
            return $defaultSummary;
        }
    }
}
