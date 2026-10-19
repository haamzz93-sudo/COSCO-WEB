<?php

namespace App\Repositories;

use App\Models\MemoCairModel;

class MemoCairRepo{

    public static function get($id)
    {
        $query = MemoCairModel::with([
            "tor",
            "tor.program_studi",
            "tor.kegiatan_detail",
            "tor.kegiatan_detail.kegiatan",
            "tor.kegiatan_detail.user_pic_kegiatan"
        ])->find($id);

        return $query ? $query->toArray() : [];
    }

    public static function gets($params, $loginUser = null)
    {
        $params['per_page'] = isset($params['per_page']) ? trim($params['per_page']) : "";
        $params['q'] = isset($params['q']) ? trim($params['q']) : "";
        $params['tor_id'] = isset($params['tor_id']) ? $params['tor_id'] : "";
        $params['status_ajuan'] = isset($params['status_ajuan']) ? $params['status_ajuan'] : "";
        $params['status_spj'] = isset($params['status_spj']) ? $params['status_spj'] : "";
        $params['program_studi_id'] = isset($params['program_studi_id']) ? $params['program_studi_id'] : "";
        $params['tahun'] = isset($params['tahun']) ? $params['tahun'] : "";
        $isValidasiSpj = !empty($params['is_validasi_spj']) || ($params['tab'] ?? '') === 'validasi_spj';

        $query = MemoCairModel::with([
            "tor",
            "tor.program_studi",
            "tor.kegiatan_detail",
            "tor.kegiatan_detail.kegiatan",
            "tor.kegiatan_detail.user_pic_kegiatan",
            "tor.memo_cair"
        ]);

        if (!empty($params['tor_id'])) {
            $query->where("tor_id", $params['tor_id']);
        }

        // PENCARIAN BERDASARKAN QUERY Q
        if (!empty($params['q'])) {
            $q = $params['q'];
            $query->where(function($queryQ) use ($q) {
                $queryQ->whereHas("tor.kegiatan_detail", function($kd) use ($q) {
                    $kd->where("nama_kegiatan_detail", "like", "%{$q}%")
                       ->orWhereHas("kegiatan", function($k) use ($q) {
                           $k->where("nama_kegiatan", "like", "%{$q}%");
                       })
                       ->orWhereHas("user_pic_kegiatan", function($u) use ($q) {
                           $u->where("name", "like", "%{$q}%");
                       });
                })->orWhereHas("tor", function($t) use ($q) {
                    $t->where("judul_kegiatan", "like", "%{$q}%");
                });
            });
        }

        // FILTER PROGRAM STUDI
        if (!empty($params['program_studi_id'])) {
            $prodiId = $params['program_studi_id'];
            $query->whereHas("tor", function($t) use ($prodiId) {
                $t->where("program_studi_id", $prodiId);
            });
        }

        // FILTER TAHUN ANGGARAN
        if (!empty($params['tahun'])) {
            $tahun = $params['tahun'];
            $query->whereHas("tor.kegiatan_detail.kegiatan", function($k) use ($tahun) {
                $k->where("tahun", $tahun);
            });
        }

        $tipeFilter = $params['tipe_pencairan'] ?? $params['tipe'] ?? '';
        if (!empty($tipeFilter)) {
            if ($tipeFilter === 'pk') {
                $query->where('tipe_pencairan', 'pk');
            } elseif ($tipeFilter === 'normal') {
                $query->where(function($q) {
                    $q->where('tipe_pencairan', 'normal')->orWhereNull('tipe_pencairan')->orWhere('tipe_pencairan', '');
                });
            }
        }

        // ROLE ISOLATION: Jika role pic_kegiatan (bukan admin), batasi HANYA kegiatan milik PIC yang login
        if ($loginUser) {
            $isAdmin = method_exists($loginUser, 'checkIsAdmin') ? $loginUser->checkIsAdmin() : false;
            $userRole = strtolower(trim((string)($loginUser['role'] ?? $loginUser->role ?? '')));
            if ($userRole === 'pic_kegiatan' && !$isAdmin) {
                $picId = $loginUser['id'] ?? $loginUser->id;
                $query->whereHas("tor.kegiatan_detail", function($kd) use ($picId) {
                    $kd->where("pic_kegiatan", $picId);
                });
            }
        }
        
        // FILTER KHUSUS VALIDASI SPJ (VERIFIKATOR SPJ)
        if ($isValidasiSpj) {
            // SPJ hanya berlaku untuk memo cair yang sudah disetujui pencairannya / terbayar
            $query->whereIn("status_ajuan", ["keuangan_applied", "terbayar"]);

            // Item hanya muncul setelah PIC submit berkas SPJ (status_spj bukan null, bukan draft, bukan kosong)
            $spjStatusFilter = $params['status_spj'] ?: 'sent';

            if ($spjStatusFilter === 'all_submitted' || $spjStatusFilter === 'all') {
                $query->whereIn("status_spj", ["sent", "keuangan_applied", "keuangan_revisi"]);
            } elseif (str_contains($spjStatusFilter, ',')) {
                $statuses = array_map('trim', explode(',', $spjStatusFilter));
                $query->whereIn("status_spj", $statuses);
            } else {
                // Default: HANYA item yang diajukan PIC dan menunggu validasi ('sent')
                // Item otomatis hilang jika verifikator SPJ telah menyetujui ('keuangan_applied') atau merevisi ('keuangan_revisi')
                $query->where("status_spj", $spjStatusFilter);
            }
        } else {
            // FILTER STATUS AJUAN MEMO CAIR
            if (!empty($params['status_ajuan'])) {
                if ($params['status_ajuan'] === 'bendahara_all') {
                    $query->whereIn("status_ajuan", ["keuangan_applied", "terbayar"]);
                } elseif (is_array($params['status_ajuan'])) {
                    $query->whereIn("status_ajuan", $params['status_ajuan']);
                } elseif (str_contains($params['status_ajuan'], ',')) {
                    $statuses = array_map('trim', explode(',', $params['status_ajuan']));
                    $query->whereIn("status_ajuan", $statuses);
                } else {
                    $query->where("status_ajuan", $params['status_ajuan']);
                }
            }

            // FILTER STATUS SPJ (JIKA ADA DARI REQUEST LUAR VALIDASI SPJ)
            if (!empty($params['status_spj'])) {
                if (is_array($params['status_spj'])) {
                    $query->whereIn("status_spj", $params['status_spj']);
                } elseif (str_contains($params['status_spj'], ',')) {
                    $statuses = array_map('trim', explode(',', $params['status_spj']));
                    $query->whereIn("status_spj", $statuses);
                } else {
                    $query->where("status_spj", $params['status_spj']);
                }
            }
        }
        
        $query->orderByDesc("id");

        return $query->paginate($params['per_page'] ?: 15)->toArray();
    }
}
