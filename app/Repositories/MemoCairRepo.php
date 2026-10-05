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
        $params['q'] = isset($params['q']) ? $params['q'] : "";
        $params['tor_id'] = isset($params['tor_id']) ? $params['tor_id'] : "";
        $params['status_ajuan'] = isset($params['status_ajuan']) ? $params['status_ajuan'] : "";

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
        
        $query->orderByDesc("id");

        return $query->paginate($params['per_page'] ?: 15)->toArray();
    }
}
