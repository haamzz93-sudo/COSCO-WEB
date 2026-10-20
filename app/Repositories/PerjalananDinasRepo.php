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

            // 1. Filter fleksibel berdasarkan Tahun Anggaran (kegiatan resmi ATAU tanggal surat tugas)
            if (!empty($params['tahun'])) {
                $thn = (string) $params['tahun'];
                $query->where(function($w) use ($thn) {
                    $w->whereHas('kegiatan_detail.kegiatan', function($k) use ($thn) {
                        $k->where('tahun', $thn);
                    })
                    ->orWhereYear('tgl_berangkat', $thn)
                    ->orWhereYear('created_at', $thn);
                });
            }

            // 2. Drop / abaikan data dummy testing lawas (tetsing / ST lama September yang bukan dinas riil)
            $query->where(function($w) {
                $w->where('nama_kegiatan', 'NOT LIKE', '%tetsing%')
                  ->where('nama_kegiatan', 'NOT LIKE', '%(Operasional / Lomba / Workshop)%')
                  ->where('nomor_surat_tugas', 'NOT LIKE', 'ST/20260924%')
                  ->where('nomor_surat_tugas', 'NOT LIKE', 'ST/2026091%');
            });

            // Urutkan: Data terbaru di atas, data lama di bawah
            return $query->orderBy('created_at', 'desc')->orderBy('id', 'desc')->paginate($perPage);
        } catch (\Throwable $e) {
            \Log::warning('PerjalananDinasRepo gets error: ' . $e->getMessage());
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);
        }
    }

    public static function applyTransportFilter($query, $kdTable = 'kegiatan_details', $kegiatanTable = 'kegiatans')
    {
        return $query->where(function($w) use ($kdTable, $kegiatanTable) {
            // HANYA ambil sub-kegiatan resmi di bawah kegiatan induk 'Perjalanan Dinas'
            if (method_exists($w, 'whereHas')) {
                $w->whereHas('kegiatan', function($k) {
                    $k->where(DB::raw('LOWER(nama_kegiatan)'), 'LIKE', '%perjalanan dinas%')
                      ->orWhere(DB::raw('LOWER(nama_kegiatan)'), 'LIKE', '%perjalanan_dinas%');
                });
            } else {
                $w->where(function($sub) use ($kegiatanTable) {
                    $sub->where(DB::raw("LOWER({$kegiatanTable}.nama_kegiatan)"), 'LIKE', '%perjalanan dinas%')
                        ->orWhere(DB::raw("LOWER({$kegiatanTable}.nama_kegiatan)"), 'LIKE', '%perjalanan_dinas%');
                });
            }
        });
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
            // 1. Akun PIC Civitas (non-admin) -> MURNI PER-PIC (hanya pagu kegiatan dinas miliknya di tahun aktif)
            // 2. Admin di tab 'my' (Tugas Pribadi) -> PER-PIC untuk loginUser
            // 3. Admin memilih filter PIC tertentu -> PER-PIC untuk filterUserId
            // 4. Admin melihat 'Semua Penugasan PIC' -> GLOBAL ADMIN (Hanya pagu kegiatan Transportasi / Perjalanan Dinas)
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
                // === MODE PER-PIC (SINKRON HANYA KEGIATAN TRANSPORTASI / PERJALANAN DINAS PIC) ===
                if (class_exists(\App\Models\User::class)) {
                    $picUser = \App\Models\User::find($targetUserId);
                    $picName = $picUser ? $picUser->name : null;
                }

                // 1. Ambil pagu kegiatan transportasi/perjalanan dinas resmi di mana user bertindak sebagai PIC
                $kdPicQuery = \Illuminate\Support\Facades\DB::table('kegiatan_details')
                    ->join('kegiatans', 'kegiatan_details.kegiatan_id', '=', 'kegiatans.id')
                    ->where('kegiatans.tahun', $tahun)
                    ->where('kegiatan_details.pic_kegiatan', $targetUserId);
                self::applyTransportFilter($kdPicQuery);
                $sumKdPagu = (int) $kdPicQuery->sum('kegiatan_details.biaya');

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

                // 2. Fallback untuk staf/pelaksana non-PIC: Ambil dari akumulasi nominal surat tugas dinas miliknya
                $sumPdPagu = (int) (clone $pdQuery)->sum('nominal_pagu');

                // Prioritaskan pagu kegiatan transport resmi milik PIC jika ada
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
                // === MODE GLOBAL ADMIN (HANYA MENGHITUNG PAGU PERJALANAN DINAS / TRANSPORTASI) ===
                $kdGlobalQuery = \Illuminate\Support\Facades\DB::table('kegiatan_details')
                    ->join('kegiatans', 'kegiatan_details.kegiatan_id', '=', 'kegiatans.id')
                    ->where('kegiatans.tahun', $tahun);
                self::applyTransportFilter($kdGlobalQuery);
                $sumKdTransportPagu = (int) $kdGlobalQuery->sum('kegiatan_details.biaya');

                $dbPaguManual = 0;
                if (class_exists(\App\Models\PaguPerjalananDinasModel::class)) {
                    $paguList = \App\Models\PaguPerjalananDinasModel::with(['kegiatan_detail.kegiatan', 'kegiatan_detail.tor'])
                        ->where('tahun_anggaran', $tahun)
                        ->whereHas('kegiatan_detail.kegiatan', function($k) use ($tahun) {
                            $k->where('tahun', $tahun);
                        })
                        ->get();
                    $activePagu = $paguList->first();
                    $dbPaguManual = (int) ($activePagu->total_pagu ?? 0);
                }

                // Pagu Perjalanan Dinas resmi: prioritaskan sum pagu kegiatan transportasi / dinas (contoh: Rp 29.000.000)
                $totalPagu = $sumKdTransportPagu > 0 ? $sumKdTransportPagu : $dbPaguManual;

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

            // Rincian masing-masing paket transportasi resmi (Tiket/Tol/BBM Rp 29jt, Sewa Hiace Rp 21jt, dll)
            $paketList = [];
            try {
                $kdPaketQuery = \Illuminate\Support\Facades\DB::table('kegiatan_details')
                    ->join('kegiatans', 'kegiatan_details.kegiatan_id', '=', 'kegiatans.id')
                    ->leftJoin('users', 'kegiatan_details.pic_kegiatan', '=', 'users.id')
                    ->where('kegiatans.tahun', $tahun);
                self::applyTransportFilter($kdPaketQuery);
                $rawPakets = $kdPaketQuery->select(
                    'kegiatan_details.id',
                    'kegiatan_details.nama_kegiatan_detail',
                    'kegiatan_details.biaya',
                    'kegiatan_details.pic_kegiatan',
                    'users.name as pic_name',
                    'kegiatans.nama_kegiatan'
                )->orderBy('kegiatan_details.biaya', 'desc')->get();

                foreach ($rawPakets as $pk) {
                    $used = 0;
                    $pending = 0;
                    if (class_exists(\App\Models\PerjalananDinasModel::class)) {
                        $used = (int) \App\Models\PerjalananDinasModel::where('kegiatan_detail_id', $pk->id)
                            ->where('status', 'dibayarkan')
                            ->get()
                            ->sum(function($p) {
                                return $p->nominal_disetujui > 0 ? $p->nominal_disetujui : ($p->nominal_klaim ?: 0);
                            });

                        $pending = (int) \App\Models\PerjalananDinasModel::where('kegiatan_detail_id', $pk->id)
                            ->whereIn('status', ['diajukan', 'diverifikasi'])
                            ->sum('nominal_klaim');
                    }

                    $biaya = (int) $pk->biaya;
                    $sisa = max(0, $biaya - $used);

                    $paketList[] = [
                        'id'           => $pk->id,
                        'nama'         => $pk->nama_kegiatan_detail,
                        'kegiatan'     => $pk->nama_kegiatan,
                        'biaya'        => $biaya,
                        'dibayarkan'   => $used,
                        'pending'      => $pending,
                        'sisa'         => $sisa,
                        'pic_name'     => $pk->pic_name ?: 'Belum ditentukan',
                        'is_available' => $sisa > 0
                    ];
                }
            } catch (\Throwable $e) {}

            return [
                'tahun'             => (int) $tahun,
                'total_pagu'        => $totalPagu,
                'total_dibayarkan'  => $totalDibayarkan,
                'total_pending'     => $totalPending,
                'sisa_pagu'         => $sisaPagu,
                'persentase'        => $persentase,
                'pagu_list'         => $paguList,
                'paket_list'        => $paketList,
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
