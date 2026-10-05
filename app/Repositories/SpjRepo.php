<?php

namespace App\Repositories;

use App\Models\SpjModel;
use Illuminate\Support\Facades\DB;

class SpjRepo
{
    public static function get($id)
    {
        $query = SpjModel::with(['memo_cair', 'kelompok_belanja'])->find($id);
        return $query ? $query->toArray() : [];
    }

    public static function gets($req, $login_data)
    {
        $params = $req;
        $params['per_page'] = isset($params['per_page']) ? trim($params['per_page']) : "";
        $params['q'] = isset($params['q']) ? $params['q'] : "";
        $params['status'] = $params['status'] ?? "";

        $query = SpjModel::with(['memo_cair', 'kelompok_belanja']);

        if (!empty($params['q'])) {
            $query->where('keterangan', 'LIKE', '%' . $params['q'] . '%');
        }

        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        $query->orderByDesc('id');

        return $query->paginate($params['per_page'] ?: 15)->toArray();
    }
}
