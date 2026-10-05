<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\TorModel;
use App\Models\MemoCairModel;
use App\Models\SpjModel;
use App\Models\KegiatanDetailModel;
use App\Models\KegiatanModel;
use App\Models\PerjalananDinasModel;
use App\Models\PengaturanModel;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $userRole = strtolower(trim($user->role ?? ''));
            $userId = $user->id ?? 0;

            $userPerms = [];
            if (method_exists($user, 'permissions')) {
                $userPerms = (array)$user->permissions();
            } elseif (isset($user->permissions)) {
                $userPerms = (array)$user->permissions;
            }

            $isSuperAdmin = $userRole === 'superadmin' || $userRole === 'admin' || ($user->is_admin ?? false) || (method_exists($user, 'checkIsAdmin') && $user->checkIsAdmin());
            
            // Koordinator, Wakil Dekan, Dekan, Sub Kor Non Akademik / Keuangan / Perencanaan
            $isKoordinator = str_contains($userRole, 'koor') || in_array('specific_is_user_koordinator', $userPerms) || in_array('tor_koordinator_validasi', $userPerms);
            $isWakilDekan = str_contains($userRole, 'wadek') || str_contains($userRole, 'dekan') || in_array('specific_is_user_wakil_dekan', $userPerms) || in_array('specific_wakil_dekan', $userPerms) || in_array('tor_wakil_dekan_validasi', $userPerms);
            $isSubKor = str_contains($userRole, 'sub') || str_contains($userRole, 'keu') || str_contains($userRole, 'rencana') || in_array('specific_is_user_keuangan', $userPerms) || in_array('tor_keuangan_validasi', $userPerms);
            $isPimpinan = in_array($userRole, ['superadmin', 'admin', 'pimpinan', 'bendahara']);

            $isExecutive = $isSuperAdmin || $isKoordinator || $isWakilDekan || $isSubKor || $isPimpinan;
            $isPICOnly = !$isExecutive;

            // 1. Tahun Filter Logic
            $latestYearFromDb = DB::table("kegiatans")->max("tahun");
            $defaultYear = $latestYearFromDb ? (string)$latestYearFromDb : (string)date("Y");
            $tahun = (string) $request->query('tahun', $defaultYear);

            $availableYearsFromDb = DB::table("kegiatans")
                ->whereNotNull("tahun")
                ->distinct()
                ->orderBy("tahun", "desc")
                ->pluck("tahun")
                ->map(fn($y) => (string)$y)
                ->toArray();

            $baseYears = ['2026', '2025', '2024'];
            $available_years = array_values(array_unique(array_merge($availableYearsFromDb, $baseYears)));
            rsort($available_years);

            // 2. Base Query: kegiatan_details strictly filtered by year
            $kegiatanQuery = DB::table("kegiatan_details")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->where("kegiatans.tahun", $tahun);

            if ($isPICOnly) {
                // PIC = total pagu dan realisasi dari semua dana yang dia jalankan sendiri
                $kegiatanQuery->where("kegiatan_details.pic_kegiatan", $userId);
            }

            // 3. Manual Overrides Check from pengaturans
            $manualPagu = DB::table('pengaturans')->where('type', "pagu_anggaran_{$tahun}")->value('content');
            $manualBeasiswa = DB::table('pengaturans')->where('type', "realisasi_beasiswa_{$tahun}")->value('content');

            // 8 Card Metrics:
            // 1. Pagu Anggaran (Input manual jika ada, jika tidak otomatis sum kegiatan_details)
            $calcPagu = (float) (clone $kegiatanQuery)->sum("kegiatan_details.biaya");
            $isManualPagu = ($isExecutive && $manualPagu !== null && $manualPagu !== '' && (float)$manualPagu > 0);
            if ($isManualPagu) {
                $pagu_anggaran = (float) $manualPagu;
            } else {
                $pagu_anggaran = $calcPagu;
            }

            // 3. Jumlah Kegiatan (Otomatis Get data dashboard)
                        // 3. Jumlah Kegiatan (Otomatis Get data dashboard)
            $jumlah_kegiatan = (int) (clone $kegiatanQuery)->count();

            // Total Inventaris Tambahan Nominal (Otomatis sinkron HPS & Belanja Inventaris)
            $total_inventaris = (float) (clone $kegiatanQuery)
                ->where(function($q) {
                    $q->where('kegiatan_details.kategori_kegiatan', 'inventaris')
                      ->orWhere('kegiatan_details.nama_kegiatan_detail', 'like', '%inventaris%')
                      ->orWhere('kegiatans.nama_kegiatan', 'like', '%inventaris%');
                })
                ->sum('kegiatan_details.biaya');

            $jumlah_inventaris = (int) (clone $kegiatanQuery)
                ->where(function($q) {
                    $q->where('kegiatan_details.kategori_kegiatan', 'inventaris')
                      ->orWhere('kegiatan_details.nama_kegiatan_detail', 'like', '%inventaris%')
                      ->orWhere('kegiatans.nama_kegiatan', 'like', '%inventaris%');
                })
                ->count();

            // 4. Dana Kegiatan (Otomatis Get data dashboard)
            $dana_kegiatan = $calcPagu;

            // 5. Dana Rencana TOR RAB Disetujui (Otomatis Get data dashboard: status = wakil_dekan_applied)
            $torDisetujuiQuery = DB::table("tors")
                ->join("kegiatan_details", "tors.kegiatan_detail_id", "=", "kegiatan_details.id")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->where("kegiatans.tahun", $tahun)
                ->where("tors.status_ajuan", "wakil_dekan_applied");
            if ($isPICOnly) {
                $torDisetujuiQuery->where("kegiatan_details.pic_kegiatan", $userId);
            }
            $dana_tor_disetujui = (float) $torDisetujuiQuery->sum("kegiatan_details.biaya");

            // 6. Dana Memo Cair Disetujui (Otomatis Get data dashboard)
            $memoDisetujuiQuery = DB::table("memo_cairs")
                ->join("tors", "memo_cairs.tor_id", "=", "tors.id")
                ->join("kegiatan_details", "tors.kegiatan_detail_id", "=", "kegiatan_details.id")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->where("kegiatans.tahun", $tahun)
                ->whereIn("memo_cairs.status_ajuan", ["keuangan_applied", "terbayar", "selesai", "disetujui", "wakil_dekan_applied"]);
            if ($isPICOnly) {
                $memoDisetujuiQuery->where("kegiatan_details.pic_kegiatan", $userId);
            }
            $dana_memo_cair_disetujui = (float) $memoDisetujuiQuery->sum("memo_cairs.total_rab");

            // 7. Dana PK Disetujui (Otomatis Get data dashboard)
            $pkQuery = DB::table("perjalanan_dinas")
                ->leftJoin("kegiatan_details", "perjalanan_dinas.kegiatan_detail_id", "=", "kegiatan_details.id")
                ->leftJoin("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id");

            if ($isPICOnly) {
                $pkQuery->where(function($q) use ($userId) {
                    $q->where("perjalanan_dinas.user_id", $userId)
                      ->orWhere("kegiatan_details.pic_kegiatan", $userId);
                });
            }

            $dana_pk_disetujui = (float) (clone $pkQuery)
                ->where(function($q) use ($tahun) {
                    $q->where("kegiatans.tahun", $tahun)
                      ->orWhereYear("perjalanan_dinas.created_at", $tahun);
                })
                ->whereIn("perjalanan_dinas.status", ["diverifikasi", "dibayarkan"])
                ->sum(DB::raw("COALESCE(perjalanan_dinas.nominal_disetujui, perjalanan_dinas.nominal_klaim, 0)"));

            $dana_pk_dicairkan = (float) (clone $pkQuery)
                ->where(function($q) use ($tahun) {
                    $q->where("kegiatans.tahun", $tahun)
                      ->orWhereYear("perjalanan_dinas.created_at", $tahun);
                })
                ->where("perjalanan_dinas.status", "dibayarkan")
                ->sum(DB::raw("COALESCE(perjalanan_dinas.nominal_disetujui, perjalanan_dinas.nominal_klaim, 0)"));

            // 8. Dana Dicairkan (Otomatis Get data dashboard: Memo Cair Terbayar + PK Dibayarkan)
            $dana_memo_dicairkan = (float) DB::table("memo_cairs")
                ->join("tors", "memo_cairs.tor_id", "=", "tors.id")
                ->join("kegiatan_details", "tors.kegiatan_detail_id", "=", "kegiatan_details.id")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->where("kegiatans.tahun", $tahun)
                ->when($isPICOnly, fn($q) => $q->where("kegiatan_details.pic_kegiatan", $userId))
                ->where(function($q) {
                    $q->where("memo_cairs.status_ajuan", "terbayar")
                      ->orWhere("memo_cairs.status_pembayaran_pk", "terbayar")
                      ->orWhereNotNull("memo_cairs.tgl_bayar");
                })
                ->sum("memo_cairs.total_rab");

            $dana_dicairkan = $dana_memo_dicairkan + $dana_pk_dicairkan;

            // 2. Realisasi Anggaran / Beasiswa (Input manual jika ada, jika tidak otomatis dana dicairkan)
            $isManualBeasiswa = ($isExecutive && $manualBeasiswa !== null && $manualBeasiswa !== '' && (float)$manualBeasiswa > 0);
            if ($isManualBeasiswa) {
                $realisasi_anggaran = (float) $manualBeasiswa;
            } else {
                $realisasi_anggaran = $dana_dicairkan > 0 ? $dana_dicairkan : $dana_memo_cair_disetujui;
            }

            // Counts for TOR approvals
            $torCountQuery = DB::table("tors")
                ->join("kegiatan_details", "tors.kegiatan_detail_id", "=", "kegiatan_details.id")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->where("kegiatans.tahun", $tahun);
            if ($isPICOnly) {
                $torCountQuery->where("kegiatan_details.pic_kegiatan", $userId);
            }

            $disetujui_count = (clone $torCountQuery)->where("tors.status_ajuan", "wakil_dekan_applied")->count();
            $review_count = (clone $torCountQuery)->whereIn("tors.status_ajuan", ["sent", "koordinator_applied", "keuangan_applied"])->count();
            $total_prodi = DB::table("program_studis")->count();

            // 4. Matriks Visualisasi: Tracking PK & Tracking Memo Cair (REALTIME & SINKRON)
            // Mengambil seluruh detail kegiatan pada tahun anggaran aktif secara transparan (tanpa limit kaku)
            $activitiesList = DB::table("kegiatan_details")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->leftJoin("users", "kegiatan_details.pic_kegiatan", "=", "users.id")
                ->leftJoin("tors", "kegiatan_details.id", "=", "tors.kegiatan_detail_id")
                ->where("kegiatans.tahun", $tahun)
                ->select(
                    "kegiatan_details.id",
                    "kegiatans.nama_kegiatan",
                    "kegiatan_details.nama_kegiatan_detail",
                    "kegiatan_details.biaya",
                    "kegiatan_details.pic_kegiatan",
                    "users.name as pic_name",
                    "tors.id as tor_id",
                    "tors.status_ajuan as tor_status"
                )
                ->orderBy("kegiatan_details.id", "asc")
                ->get();

            // Matriks Grafik Tracking PK (Presekot Kerja / Uang Muka)
            $tracking_pk = [];
            foreach ($activitiesList as $item) {
                // Presekot Kerja (PK) tersimpan di memo_cairs tipe_pencairan = 'pk'
                $pkRecord = null;
                if (!empty($item->tor_id)) {
                    $pkRecord = DB::table("memo_cairs")
                        ->where("tor_id", $item->tor_id)
                        ->where("tipe_pencairan", "pk")
                        ->orderBy("id", "desc")
                        ->first();
                }

                // Fallback untuk kegiatan transportasi / surat tugas dinas
                $pdRecord = DB::table("perjalanan_dinas")
                    ->where("kegiatan_detail_id", $item->id)
                    ->orderBy("id", "desc")
                    ->first();

                $torStatus = $item->tor_status ?? null;

                // 1. Create TOR RAB
                if (in_array($torStatus, ['sent', 'koordinator_applied', 'koordinator_revisi', 'keuangan_applied', 'keuangan_revisi', 'wakil_dekan_applied', 'wakil_dekan_revisi'])) {
                    $torCreate = 'selesai'; // Diajukan
                } elseif ($torStatus === 'draft') {
                    $torCreate = 'review'; // Draft pengerjaan
                } else {
                    $torCreate = 'belum'; // Belum ada ajuan
                }

                // 2. Review Koordinator
                if (in_array($torStatus, ['koordinator_applied', 'keuangan_applied', 'wakil_dekan_applied'])) {
                    $torKoor = 'selesai'; // ACC Koor
                } elseif ($torStatus === 'koordinator_revisi') {
                    $torKoor = 'revisi'; // Revisi Koordinator
                } elseif ($torStatus === 'sent') {
                    $torKoor = 'review'; // Sedang direview Koordinator
                } else {
                    $torKoor = 'belum';
                }

                // 3. Review Wadek II (Pengesahan Final Pimpinan)
                if ($torStatus === 'wakil_dekan_applied') {
                    $torWadek = 'selesai'; // Disahkan Wadek II
                } elseif ($torStatus === 'wakil_dekan_revisi') {
                    $torWadek = 'revisi'; // Revisi Wadek II
                } elseif (in_array($torStatus, ['koordinator_applied', 'keuangan_applied'])) {
                    $torWadek = 'review'; // Sedang ditelaah Wadek II
                } else {
                    $torWadek = 'belum';
                }

                // 4. Review Sub Koor (Persetujuan PK oleh Sub Koor Non Akademik / Keuangan)
                $torSubkor = 'belum';
                if ($pkRecord) {
                    if (in_array($pkRecord->status_ajuan, ['keuangan_applied', 'terbayar'])) {
                        $torSubkor = 'selesai'; // ACC Subkor
                    } elseif (in_array($pkRecord->status_ajuan, ['keuangan_rejected', 'revisi'])) {
                        $torSubkor = 'revisi';
                    } elseif ($pkRecord->status_ajuan === 'sent') {
                        $torSubkor = 'review';
                    }
                } elseif ($pdRecord) {
                    if (in_array($pdRecord->status, ['diverifikasi', 'dibayarkan'])) {
                        $torSubkor = 'selesai';
                    } elseif ($pdRecord->status === 'revisi') {
                        $torSubkor = 'revisi';
                    } elseif ($pdRecord->status === 'diajukan') {
                        $torSubkor = 'review';
                    }
                }

                // 5. Pembayaran Bendahara (Pencairan PK)
                $pkBayar = 'belum';
                if ($pkRecord) {
                    if ($pkRecord->status_ajuan === 'terbayar' || !empty($pkRecord->tgl_cair_pk)) {
                        $pkBayar = 'selesai'; // Dibayarkan / Lunas
                    } elseif ($pkRecord->status_ajuan === 'keuangan_applied') {
                        $pkBayar = 'review'; // Menunggu pencairan
                    }
                } elseif ($pdRecord) {
                    if ($pdRecord->status === 'dibayarkan') {
                        $pkBayar = 'selesai';
                    } elseif ($pdRecord->status === 'diverifikasi') {
                        $pkBayar = 'review';
                    }
                }

                // 6. Review & Validasi SPJ (Lapor SPJ PK)
                $pkValidasi = 'belum';
                if ($pkRecord) {
                    if (in_array($pkRecord->status_spj, ['keuangan_applied', 'disetujui'])) {
                        $pkValidasi = 'selesai'; // SPJ Valid
                    } elseif (in_array($pkRecord->status_spj, ['revisi', 'keuangan_rejected'])) {
                        $pkValidasi = 'revisi';
                    } elseif ($pkRecord->status_spj === 'sent') {
                        $pkValidasi = 'review'; // SPJ Verifikasi
                    }
                } elseif ($pdRecord) {
                    if ($pdRecord->status === 'dibayarkan') {
                        if (in_array($pdRecord->status_spj ?? '', ['valid', 'disetujui', 'keuangan_applied'])) {
                            $pkValidasi = 'selesai';
                        } elseif (in_array($pdRecord->status_spj ?? '', ['revisi', 'ditolak'])) {
                            $pkValidasi = 'revisi';
                        } elseif (($pdRecord->status_spj ?? '') === 'diajukan') {
                            $pkValidasi = 'review';
                        }
                    }
                }

                // 7. Status Akhir Keseluruhan
                if ($pkValidasi === 'selesai') {
                    $pkFinal = 'selesai';
                } elseif ($torKoor === 'revisi' || $torWadek === 'revisi' || $torSubkor === 'revisi' || $pkValidasi === 'revisi') {
                    $pkFinal = 'revisi';
                } elseif ($pkBayar === 'selesai' || $pkBayar === 'review' || $torSubkor === 'selesai' || $torSubkor === 'review' || $torWadek === 'selesai' || $torWadek === 'review' || $torKoor === 'selesai' || $torKoor === 'review') {
                    $pkFinal = 'review';
                } elseif ($torCreate === 'selesai' || $torCreate === 'review') {
                    $pkFinal = 'review';
                } else {
                    $pkFinal = 'belum';
                }

                $tracking_pk[] = [
                    'id'            => $item->id,
                    'kegiatan'      => $item->nama_kegiatan,
                    'item_kegiatan' => $item->nama_kegiatan_detail,
                    'pic_id'        => $item->pic_kegiatan,
                    'pic'           => $item->pic_name ?? 'PIC Belum Ditentukan',
                    'pagu'          => (float) $item->biaya,
                    'nominal_pk'    => $pkRecord ? (float)$pkRecord->total_rab : ($pdRecord ? (float)($pdRecord->nominal_disetujui ?: $pdRecord->nominal_klaim) : 0),
                    'tor_create'    => $torCreate,
                    'tor_koor'      => $torKoor,
                    'tor_wadek'     => $torWadek,
                    'tor_subkor'    => $torSubkor,
                    'pk_bayar'      => $pkBayar,
                    'pk_validasi'   => $pkValidasi,
                    'status_akhir'  => $pkFinal,
                    'is_my'         => $userId && ((int)$item->pic_kegiatan === (int)$userId),
                ];
            }

            // Matriks Grafik Tracking Memo Cair (Normal)
            $tracking_memo_cair = [];
            foreach ($activitiesList as $item) {
                $mcRecord = null;
                if (!empty($item->tor_id)) {
                    $mcRecord = DB::table("memo_cairs")
                        ->where("tor_id", $item->tor_id)
                        ->where(function($q) {
                            $q->where('tipe_pencairan', 'normal')
                              ->orWhereNull('tipe_pencairan')
                              ->orWhere('tipe_pencairan', '');
                        })
                        ->orderBy("id", "desc")
                        ->first();
                }

                $torStatus = $item->tor_status ?? null;

                // 1. Koordinator
                if (in_array($torStatus, ['koordinator_applied', 'keuangan_applied', 'wakil_dekan_applied'])) {
                    $torKoor = 'selesai';
                } elseif ($torStatus === 'koordinator_revisi') {
                    $torKoor = 'revisi';
                } elseif ($torStatus === 'sent') {
                    $torKoor = 'review';
                } else {
                    $torKoor = 'belum';
                }

                // 2. Wakil Dekan
                if ($torStatus === 'wakil_dekan_applied') {
                    $torWadek = 'selesai';
                } elseif ($torStatus === 'wakil_dekan_revisi') {
                    $torWadek = 'revisi';
                } elseif (in_array($torStatus, ['koordinator_applied', 'keuangan_applied'])) {
                    $torWadek = 'review';
                } else {
                    $torWadek = 'belum';
                }

                // 3. Pengajuan Memo Cair
                $mcPengajuan = 'belum';
                if ($mcRecord) {
                    if (in_array($mcRecord->status_ajuan, ['sent', 'keuangan_applied', 'terbayar', 'revisi', 'keuangan_rejected'])) {
                        $mcPengajuan = 'selesai';
                    } elseif ($mcRecord->status_ajuan === 'draft') {
                        $mcPengajuan = 'review';
                    }
                }

                // 4. Validasi Cair (Sub Kor Non Akademik / Perencanaan)
                $mcValidasi = 'belum';
                if ($mcRecord) {
                    if (in_array($mcRecord->status_ajuan, ['keuangan_applied', 'terbayar'])) {
                        $mcValidasi = 'selesai';
                    } elseif (in_array($mcRecord->status_ajuan, ['keuangan_rejected', 'revisi'])) {
                        $mcValidasi = 'revisi';
                    } elseif ($mcRecord->status_ajuan === 'sent') {
                        $mcValidasi = 'review';
                    }
                }

                // 5. Pembayaran Bendahara
                $mcBayar = 'belum';
                if ($mcRecord) {
                    if ($mcRecord->status_ajuan === 'terbayar' || !empty($mcRecord->tgl_bayar)) {
                        $mcBayar = 'selesai';
                    } elseif ($mcRecord->status_ajuan === 'keuangan_applied') {
                        $mcBayar = 'review';
                    }
                }

                // 6. Status SPJ
                $mcSpjStatus = 'belum';
                if ($mcRecord) {
                    if (in_array($mcRecord->status_spj, ['keuangan_applied', 'disetujui'])) {
                        $mcSpjStatus = 'selesai';
                    } elseif (in_array($mcRecord->status_spj, ['revisi', 'keuangan_rejected'])) {
                        $mcSpjStatus = 'revisi';
                    } elseif ($mcRecord->status_spj === 'sent') {
                        $mcSpjStatus = 'review';
                    }
                }

                // 7. Status Akhir
                if ($mcSpjStatus === 'selesai') {
                    $mcFinal = 'selesai';
                } elseif ($torKoor === 'revisi' || $torWadek === 'revisi' || $mcValidasi === 'revisi' || $mcSpjStatus === 'revisi') {
                    $mcFinal = 'revisi';
                } elseif ($mcBayar === 'selesai' || $mcBayar === 'review' || $mcValidasi === 'selesai' || $mcValidasi === 'review' || $mcPengajuan === 'selesai' || $torWadek === 'selesai' || $torWadek === 'review' || $torKoor === 'selesai' || $torKoor === 'review') {
                    $mcFinal = 'review';
                } else {
                    $mcFinal = 'belum';
                }

                $tracking_memo_cair[] = [
                    'id'            => $item->id,
                    'kegiatan'      => $item->nama_kegiatan,
                    'item_kegiatan' => $item->nama_kegiatan_detail,
                    'pic_id'        => $item->pic_kegiatan,
                    'pic'           => $item->pic_name ?? 'PIC Belum Ditentukan',
                    'pagu'          => (float) $item->biaya,
                    'nominal_memo'  => $mcRecord ? (float)$mcRecord->total_rab : 0,
                    'tor_koor'      => $torKoor,
                    'tor_wadek'     => $torWadek,
                    'memo_pengajuan'=> $mcPengajuan,
                    'memo_validasi' => $mcValidasi,
                    'memo_bayar'    => $mcBayar,
                    'memo_spj'      => $mcSpjStatus,
                    'status_akhir'  => $mcFinal,
                    'is_my'         => $userId && ((int)$item->pic_kegiatan === (int)$userId),
                ];
            }

            // 5. Real Prodi Distribution for Selected Year
            $prodis = DB::table("program_studis")->get();
            $prodi_data = [];
            $palette = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-indigo-600', 'bg-rose-500', 'bg-teal-600', 'bg-cyan-600', 'bg-purple-600'];

            foreach ($prodis as $idx => $p) {
                $p_query = DB::table("tors")
                    ->join("kegiatan_details", "tors.kegiatan_detail_id", "=", "kegiatan_details.id")
                    ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                    ->where("kegiatans.tahun", $tahun)
                    ->where("tors.program_studi_id", $p->id);

                if ($isPICOnly) {
                    $p_query->where("kegiatan_details.pic_kegiatan", $userId);
                }

                $p_biaya = (float) (clone $p_query)->sum("kegiatan_details.biaya");
                $p_count = (int) (clone $p_query)->count();

                if ($p_count > 0 || !$isPICOnly) {
                    $pct = $pagu_anggaran > 0 ? min(100, round(($p_biaya / $pagu_anggaran) * 100)) : 0;
                    $prodi_data[] = [
                        'name' => $p->nama_program_studi,
                        'biaya' => $p_biaya,
                        'kegiatan' => $p_count,
                        'color' => $palette[$idx % count($palette)],
                        'percent' => $pct
                    ];
                }
            }

            // 6. Real Activities Table
            $recent_db_query = DB::table("kegiatan_details")
                ->join("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
                ->leftJoin("tors", "kegiatan_details.id", "=", "tors.kegiatan_detail_id")
                ->leftJoin("users", "kegiatan_details.pic_kegiatan", "=", "users.id")
                ->leftJoin("program_studis", "tors.program_studi_id", "=", "program_studis.id")
                ->leftJoin("ikus", "tors.iku_id", "=", "ikus.id")
                ->leftJoin("iks", "tors.ik_id", "=", "iks.id")
                ->where("kegiatans.tahun", $tahun)
                ->select(
                    "kegiatan_details.id",
                    "kegiatan_details.nama_kegiatan_detail",
                    "kegiatan_details.biaya",
                    "kegiatans.nama_kegiatan",
                    "program_studis.nama_program_studi",
                    "users.name as pic_name",
                    "tors.id as tor_id",
                    "tors.status_ajuan",
                    "ikus.kode_iku",
                    "ikus.deskripsi_iku",
                    "iks.kode_ik",
                    "iks.deskripsi_ik"
                );

            if ($isPICOnly) {
                $recent_db_query->where("kegiatan_details.pic_kegiatan", $userId);
            }

            $recent_db = $recent_db_query->orderBy("kegiatan_details.id", "desc")
                ->limit(10)
                ->get();

            $recent_activities = [];
            foreach ($recent_db as $item) {
                $status_label = "Draft Pengerjaan";
                $status_color = "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300";
                $step_label = "Step 1 Pengisian";

                if ($item->status_ajuan == "sent") {
                    $status_label = "Menunggu Telaah Koordinator";
                    $status_color = "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300";
                    $step_label = "Step 2 Diajukan";
                } elseif ($item->status_ajuan == "koordinator_applied" || $item->status_ajuan == "keuangan_applied") {
                    $status_label = "Menunggu Wakil Dekan";
                    $status_color = "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300";
                    $step_label = "Step 3 Verifikasi";
                } elseif ($item->status_ajuan == "wakil_dekan_applied") {
                    $status_label = "Disetujui Wakil Dekan";
                    $status_color = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300";
                    $step_label = "TOR RAB Selesai";
                } elseif (str_contains($item->status_ajuan ?? '', 'revisi')) {
                    $status_label = "Perlu Revisi";
                    $status_color = "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300";
                    $step_label = "Revisi Dokumen";
                }

                $recent_activities[] = [
                    'id' => $item->id,
                    'tor_id' => $item->tor_id,
                    'kegiatan' => $item->nama_kegiatan ?? "Kegiatan Akademik UNS",
                    'detail' => $item->nama_kegiatan_detail ?? "Rincian Pelaksanaan Kegiatan",
                    'biaya' => (float) $item->biaya,
                    'prodi' => $item->nama_program_studi ?? "D3 TEKNIK INFORMATIKA",
                    'pic' => $item->pic_name ?? ($user->name ?? "PIC Penanggung Jawab"),
                    'iku' => $item->kode_iku ? ($item->kode_iku . " - " . $item->deskripsi_iku) : "IKU002 - Prestasi di Luar Kampus",
                    'ik' => $item->kode_ik ? ($item->kode_ik . " - " . $item->deskripsi_ik) : "IK07 - Mahasiswa Meraih Prestasi",
                    'status' => $status_label,
                    'statusColor' => $status_color,
                    'step' => $step_label
                ];
            }

            // 7. 12-Month Real Time Dynamic Monthly Data
            $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            $monthly_data = [];
            $cumRencana = 0;
            $cumRealisasi = 0;

            $rencanaMap = (clone $kegiatanQuery)
                ->select(DB::raw("MONTH(kegiatan_details.created_at) as m, sum(kegiatan_details.biaya) as total"))
                ->groupBy(DB::raw("MONTH(kegiatan_details.created_at)"))
                ->pluck("total", "m")
                ->toArray();

            $realisasiMap = (clone $memoDisetujuiQuery)
                ->select(DB::raw("MONTH(COALESCE(memo_cairs.tgl_bayar, memo_cairs.created_at)) as m, sum(memo_cairs.total_rab) as total"))
                ->groupBy(DB::raw("MONTH(COALESCE(memo_cairs.tgl_bayar, memo_cairs.created_at))"))
                ->pluck("total", "m")
                ->toArray();

            for ($m = 1; $m <= 12; $m++) {
                $mRencana = (float) ($rencanaMap[$m] ?? 0);
                $mRealisasi = (float) ($realisasiMap[$m] ?? 0);
                $cumRencana += $mRencana;
                $cumRealisasi += $mRealisasi;

                $monthly_data[] = [
                    'month' => $monthNames[$m - 1],
                    'rencana' => round($cumRencana / 1000000, 2),
                    'realisasi' => round($cumRealisasi / 1000000, 2)
                ];
            }

                        $dashboardPayload = [

                    'selected_year' => $tahun,
                    'available_years' => $available_years,
                    'is_pic_only' => $isPICOnly,
                    'user_role' => $userRole,
                    'can_edit_metrics' => $isExecutive,

                    // 8 Financial Metrics
                    'pagu_anggaran' => $pagu_anggaran,
                    'realisasi_anggaran' => $realisasi_anggaran,
                    'jumlah_kegiatan' => $jumlah_kegiatan,
                    'total_inventaris' => $total_inventaris,
                    'jumlah_inventaris' => $jumlah_inventaris,
                    'dana_kegiatan' => $dana_kegiatan,
                    'dana_tor_disetujui' => $dana_tor_disetujui,
                    'dana_memo_cair_disetujui' => $dana_memo_cair_disetujui,
                    'dana_pk_disetujui' => $dana_pk_disetujui,
                    'dana_dicairkan' => $dana_dicairkan,

                    // Manual indicators
                    'is_manual_pagu' => $isManualPagu,
                    'is_manual_beasiswa' => $isManualBeasiswa,

                    // Legacy & derived metrics for backwards compatibility
                    'total_pagu' => $pagu_anggaran,
                    'realisasi_cair' => $realisasi_anggaran,
                    'sisa_pagu' => max(0, $pagu_anggaran - $realisasi_anggaran),
                    'percent_cair' => $pagu_anggaran > 0 ? round(($realisasi_anggaran / $pagu_anggaran) * 100, 1) : 0,
                    'total_kegiatan' => $jumlah_kegiatan,
                    'total_prodi' => $total_prodi,
                    'disetujui_count' => $disetujui_count,
                    'review_count' => $review_count,

                    // Tracking Matrices & Charts
                    'tracking_pk' => $tracking_pk,
                    'tracking_memo_cair' => $tracking_memo_cair,
                    'prodi_data' => $prodi_data,
                    'monthly_data' => $monthly_data,
                    'recent_activities' => $recent_activities
                
            ];

            return Inertia::render('dashboard/dashboard/index', array_merge($dashboardPayload, ['realtime' => $dashboardPayload]));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("DashboardController index error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return Inertia::render('dashboard/dashboard/index', [
                'realtime' => [
                    'selected_year' => (string)date('Y'),
                    'available_years' => ['2026', '2025', '2024'],
                    'is_pic_only' => false,
                    'user_role' => '',
                    'can_edit_metrics' => false,
                    'pagu_anggaran' => 0,
                    'realisasi_anggaran' => 0,
                    'jumlah_kegiatan' => 0,
                    'dana_kegiatan' => 0,
                    'dana_tor_disetujui' => 0,
                    'dana_memo_cair_disetujui' => 0,
                    'dana_pk_disetujui' => 0,
                    'dana_dicairkan' => 0,
                    'total_pagu' => 0,
                    'realisasi_cair' => 0,
                    'sisa_pagu' => 0,
                    'percent_cair' => 0,
                    'total_kegiatan' => 0,
                    'total_prodi' => 0,
                    'disetujui_count' => 0,
                    'review_count' => 0,
                    'tracking_pk' => [],
                    'tracking_memo_cair' => [],
                    'prodi_data' => [],
                    'monthly_data' => [],
                    'recent_activities' => []
                ]
            ]);
        }
    }

    public function update_financial_metrics(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'UNAUTHORIZED'], 401);
        }

        $tahun = (string) $request->input('tahun', date('Y'));
        $pagu = $request->input('pagu_anggaran');
        $beasiswa = $request->input('realisasi_beasiswa');

        if ($pagu !== null) {
            PengaturanModel::updateOrCreate(
                ['type' => "pagu_anggaran_{$tahun}"],
                ['content' => (string) $pagu]
            );
        }

        if ($beasiswa !== null) {
            PengaturanModel::updateOrCreate(
                ['type' => "realisasi_beasiswa_{$tahun}"],
                ['content' => (string) $beasiswa]
            );
        }

        return response()->json([
            'status' => 'ok',
            'message' => "Pagu Anggaran & Realisasi Beasiswa Tahun {$tahun} berhasil disimpan!"
        ]);
    }

    public function user(Request $request)
    {
        return Inertia::render('dashboard/user/index');
    }

    public function role(Request $request)
    {
        return Inertia::render('dashboard/role/index');
    }

    public function pengaturan(Request $request)
    {
        return Inertia::render('dashboard/pengaturan/index');
    }

    public function program_studi(Request $request)
    {
        return Inertia::render('dashboard/program_studi/index');
    }

    public function satuan(Request $request)
    {
        return Inertia::render('dashboard/satuan/index');
    }

    public function ik(Request $request)
    {
        return Inertia::render('dashboard/ik/index');
    }

    public function iku(Request $request)
    {
        return Inertia::render('dashboard/iku/index');
    }

    public function p(Request $request)
    {
        return Inertia::render('dashboard/p/index');
    }

    public function mak(Request $request)
    {
        return Inertia::render('dashboard/mak/index');
    }

    public function kelompok_belanja(Request $request)
    {
        return Inertia::render('dashboard/kelompok_belanja/index');
    }

    public function tor(Request $request)
    {
        return Inertia::render('dashboard/tor/index');
    }

    public function kegiatan(Request $request)
    {
        return Inertia::render('dashboard/kegiatan/index');
    }

    public function kegiatan_detail(Request $request)
    {
        return Inertia::render('dashboard/kegiatan_detail/index');
    }

    public function rab(Request $request)
    {
        return Inertia::render('dashboard/rab/index');
    }

    public function pic_kegiatan(Request $request)
    {
        return Inertia::render('dashboard/pic_kegiatan/index');
    }

    public function tor_detail_kegiatan(Request $request, $id)
    {
        $kd = DB::table("kegiatan_details")->where("id", $id)->first();
        if (!$kd) {
            $tor = DB::table("tors")->where("id", $id)->first();
            if ($tor && $tor->kegiatan_detail_id) {
                $id = $tor->kegiatan_detail_id;
            }
        }

        return Inertia::render('dashboard/tor/detail_kegiatan', [
            'id' => $id
        ]);
    }

    public function tor_detail(Request $request, $kegiatan_detail_id)
    {
        $tor = (array) DB::table("tors")->where("kegiatan_detail_id", $kegiatan_detail_id)->first();
        if (empty($tor)) {
            $tor = (array) DB::table("tors")->where("id", $kegiatan_detail_id)->first();
            if (!empty($tor) && !empty($tor['kegiatan_detail_id'])) {
                $kegiatan_detail_id = $tor['kegiatan_detail_id'];
            }
        }
        return Inertia::render('dashboard/tor/detail', [
            'id' => $kegiatan_detail_id,
            'tor_id' => $tor['id'] ?? null
        ]);
    }

    public function tor_rab(Request $request, $kegiatan_detail_id)
    {
        $tor = (array) DB::table("tors")->where("kegiatan_detail_id", $kegiatan_detail_id)->first();
        if (empty($tor)) {
            $tor = (array) DB::table("tors")->where("id", $kegiatan_detail_id)->first();
            if (!empty($tor) && !empty($tor['kegiatan_detail_id'])) {
                $kegiatan_detail_id = $tor['kegiatan_detail_id'];
            }
        }
        return Inertia::render('dashboard/tor/rab', [
            'id' => $kegiatan_detail_id,
            'tor_id' => $tor['id'] ?? null
        ]);
    }

    public function tor_persetujuan(Request $request)
    {
        return Inertia::render('dashboard/tor/persetujuan_tor_rab', []);
    }

    public function memo_cair(Request $request)
    {
        return Inertia::render('dashboard/memo_cair/index');
    }

    public function memo_cair_detail(Request $request, $kegiatan_detail_id)
    {
        $tor = (array) DB::table("tors")->where("kegiatan_detail_id", $kegiatan_detail_id)->first();
        $kegiatan_detail = (array) DB::table("kegiatan_details")
            ->leftJoin("users", "kegiatan_details.pic_kegiatan", "=", "users.id")
            ->leftJoin("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
            ->select("kegiatan_details.*", "users.name as pic_name", "kegiatans.nama_kegiatan")
            ->where("kegiatan_details.id", $kegiatan_detail_id)
            ->first();

        return Inertia::render('dashboard/memo_cair/detail', [
            'id' => $kegiatan_detail_id,
            'tor_id' => $tor['id'] ?? null,
            'kegiatan_detail_fallback' => $kegiatan_detail ?? null
        ]);
    }

    public function memo_cair_detail_persetujuan(Request $request, $kegiatan_detail_id)
    {
        $tor = (array) DB::table("tors")->where("kegiatan_detail_id", $kegiatan_detail_id)->first();
        $kegiatan_detail = (array) DB::table("kegiatan_details")
            ->leftJoin("users", "kegiatan_details.pic_kegiatan", "=", "users.id")
            ->leftJoin("kegiatans", "kegiatan_details.kegiatan_id", "=", "kegiatans.id")
            ->select("kegiatan_details.*", "users.name as pic_name", "kegiatans.nama_kegiatan")
            ->where("kegiatan_details.id", $kegiatan_detail_id)
            ->first();

        return Inertia::render('dashboard/memo_cair/detail_persetujuan', [
            'id' => $kegiatan_detail_id,
            'tor_id' => $tor['id'] ?? null,
            'kegiatan_detail_fallback' => $kegiatan_detail ?? null
        ]);
    }

    public function memo_cair_persetujuan(Request $request)
    {
        return Inertia::render('dashboard/memo_cair/persetujuan_memo_cair', []);
    }

    public function memo_cair_validasi_spj(Request $request)
    {
        return Inertia::render('dashboard/memo_cair/persetujuan_memo_cair', [
            'is_validasi_spj' => true,
        ]);
    }

    public function memo_cair_pembayaran(Request $request)
    {
        return Inertia::render('dashboard/memo_cair/persetujuan_memo_cair', [
            'is_bendahara_pembayaran' => true,
        ]);
    }

    public function spj(Request $request)
    {
        return Inertia::render('dashboard/spj/index');
    }

    public function spj_detail(Request $request, $memo_cair_id)
    {
        $memo_cair = \App\Models\MemoCairModel::with([
            'tor',
            'tor.program_studi',
            'tor.kegiatan_detail',
            'tor.kegiatan_detail.kegiatan',
            'tor.kegiatan_detail.user_pic_kegiatan'
        ])->find($memo_cair_id);

        $spjs = \App\Models\SpjModel::with([
            'kelompok_belanja',
            'penerima',
            'kuasa_pengguna_anggaran',
            'bendahara',
            'pic'
        ])
            ->where('memo_cair_id', $memo_cair_id)
            ->get();

        $all_rab_spj = [];
        foreach ($spjs as $s) {
            if (is_array($s->rab)) {
                foreach ($s->rab as $r) {
                    $all_rab_spj[] = $r;
                }
            }
        }

        return Inertia::render('dashboard/spj/detail', [
            'id'          => $memo_cair_id,
            'memo_cair'   => $memo_cair ? $memo_cair->toArray() : ['rab' => []],
            'spj'         => $spjs ? $spjs->toArray() : [],
            'all_rab_spj' => $all_rab_spj
        ]);
    }

    public function spj_print(Request $request, $spj_id)
    {
        $spj = SpjModel::with([
            'kelompok_belanja',
            'penerima',
            'pic',
            'bendahara',
            'kuasa_pengguna_anggaran',
            'memo_cair.tor',
            'memo_cair.tor.program_studi',
            'memo_cair.tor.kegiatan_detail.kegiatan'
        ])->find($spj_id);

        if (!$spj) {
            abort(404, 'Data SPJ tidak ditemukan.');
        }

        return view('print.kwitansi', [
            'spj' => $spj->toArray()
        ]);
    }

            public function spj_viewer(Request $request, $spj_id)
    {
        $spj = SpjModel::find($spj_id);
        if (!$spj) {
            return redirect('/dashboard/spjs');
        }

        // If file_spj is present, try to find it on disk
        if (!empty($spj->file_spj)) {
            $cleanFilename = basename($spj->file_spj);

            $possiblePaths = [
                storage_path('app/public/' . $cleanFilename),
                storage_path('app/' . $cleanFilename),
                public_path('storage/' . $cleanFilename),
                base_path('storage/app/public/' . $cleanFilename),
                base_path('../public/storage/' . $cleanFilename),
                base_path('../storage/' . $cleanFilename),
                '/www/wwwroot/cosco.unsmadiun.id/laravel/storage/app/public/' . $cleanFilename,
                '/www/wwwroot/cosco.unsmadiun.id/public/storage/' . $cleanFilename,
                '/www/wwwroot/cosco.unsmadiun.id/storage/' . $cleanFilename,
                '/www/wwwroot/cosco.unsmadiun.id/laravel/public/storage/' . $cleanFilename,
            ];

            foreach ($possiblePaths as $p) {
                if (file_exists($p) && is_file($p)) {
                    return response()->file($p, [
                        'Content-Type' => 'application/pdf',
                        'Content-Disposition' => 'inline; filename="' . $cleanFilename . '"'
                    ]);
                }
            }
        }

        // Fallback: If physical file is not found, redirect to the official generated print kwitansi view
        return redirect("/dashboard/spjs/print/{$spj_id}");
    }

    public function spj_template(Request $request)
    {
        $possiblePaths = [
            public_path('templates/Format_SPJ_Hibah.xlsx'),
            storage_path('app/public/templates/Format_SPJ_Hibah.xlsx'),
            base_path('public/templates/Format_SPJ_Hibah.xlsx'),
            base_path('storage/app/public/templates/Format_SPJ_Hibah.xlsx'),
            base_path('../Format SPJ Hibah.xlsx'),
            base_path('../../Format SPJ Hibah.xlsx'),
            '/www/wwwroot/cosco.unsmadiun.id/laravel/public/templates/Format_SPJ_Hibah.xlsx',
            '/www/wwwroot/cosco.unsmadiun.id/public/templates/Format_SPJ_Hibah.xlsx',
            '/www/wwwroot/cosco.unsmadiun.id/laravel/storage/app/public/templates/Format_SPJ_Hibah.xlsx',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path) && is_file($path)) {
                return response()->download($path, 'Format_SPJ_Hibah.xlsx', [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ]);
            }
        }

        abort(404, 'Template SPJ Hibah belum ditemukan.');
    }

    public function perjalanan_dinas(Request $request)
    {
        $loginUser = $request->user();

        // Ambil info TOR / Kegiatan jika tor_id dikirimkan via query param
        $torDetail = null;
        $torId = $request->query('tor_id');
        if (!empty($torId)) {
            try {
                $torDetail = \Illuminate\Support\Facades\DB::table('kegiatan_details')
                    ->join('kegiatans', 'kegiatan_details.kegiatan_id', '=', 'kegiatans.id')
                    ->leftJoin('tors', 'tors.kegiatan_detail_id', '=', 'kegiatan_details.id')
                    ->leftJoin('users', 'kegiatan_details.pic_kegiatan', '=', 'users.id')
                    ->where('kegiatan_details.id', $torId)
                    ->orWhere('tors.id', $torId)
                    ->select(
                        'tors.id as tor_id',
                        'kegiatan_details.id as kegiatan_detail_id',
                        'kegiatan_details.nama_kegiatan_detail',
                        'kegiatan_details.biaya',
                        'kegiatan_details.pic_kegiatan',
                        'users.name as pic_name',
                        'kegiatans.nama_kegiatan',
                        'kegiatans.tahun'
                    )
                    ->first();
            } catch (\Throwable $e) {
                \Log::warning('Error fetching tor detail for perjalanan_dinas: ' . $e->getMessage());
            }
        }

        $tahun = $request->query('tahun') ?: ($torDetail->tahun ?? (string) date('Y'));

        $paguSummary = [
            'tahun'            => (int) $tahun,
            'total_pagu'       => 0,
            'total_dibayarkan' => 0,
            'total_pending'    => 0,
            'sisa_pagu'        => 0,
            'persentase'       => 0,
            'pagu_list'        => [],
            'active_pagu'      => null,
            'is_per_pic'       => false,
        ];

        try {
            if (class_exists(\App\Repositories\PerjalananDinasRepo::class)) {
                $paguSummary = \App\Repositories\PerjalananDinasRepo::getPaguSummary($tahun, $loginUser, $request->all());
            }
        } catch (\Throwable $e) {
            \Log::warning('getPaguSummary error: ' . $e->getMessage());
        }

        $kegiatanList = [];
        try {
            if (class_exists(\App\Models\KegiatanDetailModel::class)) {
                $kegiatanList = \App\Models\KegiatanDetailModel::with(['kegiatan', 'user_pic_kegiatan'])
                    ->whereHas('kegiatan', function($q) use ($tahun) {
                        $q->where('tahun', $tahun);
                    })
                    ->orderBy('id', 'desc')
                    ->get();
            }
        } catch (\Throwable $e) {}

        $usersList = [];
        try {
            if (class_exists(\App\Models\User::class)) {
                $usersList = \App\Models\User::select('id', 'name', 'email', 'role')->orderBy('name', 'asc')->get();
            }
        } catch (\Throwable $e) {}

        return \Inertia\Inertia::render('dashboard/perjalanan_dinas/index', [
            'pagu_summary'  => $paguSummary,
            'action'        => $request->query('action'),
            'tor_id'        => $torId,
            'tor_detail'    => $torDetail,
            'kegiatan_list' => $kegiatanList,
            'users_list'    => $usersList
        ]);
    }

    public function perjalanan_dinas_form(Request $request, $id = null)
    {
        $loginUser = $request->user();
        $detail = null;

        if (!empty($id)) {
            try {
                if (class_exists(\App\Repositories\PerjalananDinasRepo::class)) {
                    $detail = \App\Repositories\PerjalananDinasRepo::get($id);
                }
            } catch (\Throwable $e) {
                \Log::warning('PerjalananDinasRepo get error: ' . $e->getMessage());
            }
        }

        $paguSummary = [
            'tahun'            => (int) date('Y'),
            'total_pagu'       => 10000000,
            'total_dibayarkan' => 0,
            'total_pending'    => 0,
            'sisa_pagu'        => 10000000,
            'persentase'       => 0,
            'pagu_list'        => [],
            'active_pagu'      => null,
            'is_per_pic'       => false,
        ];

        try {
            if (class_exists(\App\Repositories\PerjalananDinasRepo::class)) {
                $paguSummary = \App\Repositories\PerjalananDinasRepo::getPaguSummary(null, $loginUser);
            }
        } catch (\Throwable $e) {}

        $kegiatanList = [];
        try {
            if (class_exists(\App\Models\KegiatanDetailModel::class)) {
                $kegiatanList = \App\Models\KegiatanDetailModel::with('kegiatan')
                    ->orderBy('id', 'desc')
                    ->limit(50)
                    ->get();
            }
        } catch (\Throwable $e) {}

        return \Inertia\Inertia::render('dashboard/perjalanan_dinas/form_bukti', [
            'detail_id'     => $id,
            'initial_data'  => $detail,
            'pagu_summary'  => $paguSummary,
            'kegiatan_list' => $kegiatanList
        ]);
    }

    public function sesi()
    {
        return redirect('/dashboard');
    }
}