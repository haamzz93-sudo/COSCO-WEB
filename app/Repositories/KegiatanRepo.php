<?php

namespace App\Repositories;

use App\Models\KegiatanModel;

class KegiatanRepo
{
    public static function get($id)
    {
        $query = KegiatanModel::find($id);
        return $query ? $query->toArray() : [];
    }

    public static function gets($params, $login_data = null)
    {
        $per_page = !empty($params['per_page']) ? (int) $params['per_page'] : 15;
        $q = $params['q'] ?? "";
        $tahun = $params['tahun'] ?? "";

        $columns = ["nama_kegiatan"];

        $query = KegiatanModel::query();
        $query = $query->with([
            "kegiatan_detail" => function($query_kd) use ($login_data) {
                if ($login_data) {
                    $role = is_object($login_data) ? ($login_data->role ?? '') : ($login_data['role'] ?? '');
                    $userId = is_object($login_data) ? ($login_data->id ?? 0) : ($login_data['id'] ?? 0);
                    $permissions = is_object($login_data) ? ($login_data->permissions ?? []) : ($login_data['permissions'] ?? []);

                    $isSuperAdmin = $role === 'admin' || $role === 'superadmin';
                    $isKoordinator = $role === 'koordinator' || in_array('specific_is_user_koordinator', $permissions);
                    $isPIC = ($role === 'pic_kegiatan' || in_array('specific_is_user_pic', $permissions) || in_array('specific_pic', $permissions)) && !$isSuperAdmin && !$isKoordinator;

                    if ($isPIC) {
                        $query_kd->where("pic_kegiatan", $userId);
                    }
                }
            },
            "kegiatan_detail.user_pic_kegiatan",
            "kegiatan_detail.user_pic",
            "kegiatan_detail.tor",
            "kegiatan_detail.memo_cair"
        ]);

        if ($login_data) {
            $role = is_object($login_data) ? ($login_data->role ?? '') : ($login_data['role'] ?? '');
            $userId = is_object($login_data) ? ($login_data->id ?? 0) : ($login_data['id'] ?? 0);
            $permissions = is_object($login_data) ? ($login_data->permissions ?? []) : ($login_data['permissions'] ?? []);

            $isSuperAdmin = $role === 'admin' || $role === 'superadmin';
            $isKoordinator = $role === 'koordinator' || in_array('specific_is_user_koordinator', $permissions);
            $isPIC = ($role === 'pic_kegiatan' || in_array('specific_is_user_pic', $permissions) || in_array('specific_pic', $permissions)) && !$isSuperAdmin && !$isKoordinator;

            if ($isPIC) {
                $query->whereHas("kegiatan_detail", function($q_has) use ($userId) {
                    $q_has->where("pic_kegiatan", $userId);
                });
            }
        }

        if (!empty($q)) {
            $query->where(function($query_like) use ($columns, $q) {
                foreach ($columns as $idx => $value) {
                    if ($idx === 0) {
                        $query_like->where($value, "LIKE", "%" . $q . "%");
                        continue;
                    }
                    $query_like->orWhere($value, "LIKE", "%" . $q . "%");
                }
            });
        }

        if (!empty($tahun)) {
            $query->where("tahun", $tahun);
        }

        $query->orderBy("id", "desc");

        return $query->paginate($per_page)->toArray();
    }
}
