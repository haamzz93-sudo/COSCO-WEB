<?php

namespace App\Repositories;

use App\Models\TorModel;

class TorRepo
{
    public static function get($id)
    {
        $query = TorModel::with([
            'kegiatan_detail', 
            'kegiatan_detail.kegiatan', 
            'kegiatan_detail.user_pic_kegiatan', 
            'kegiatan_detail.user_pic',
            'iku', 
            'ik', 
            'p', 
            'program_studi'
        ])->find($id);

        return $query ? $query->toArray() : [];
    }

    public static function gets($params = [])
    {
        $per_page = !empty($params['per_page']) ? (int) $params['per_page'] : 15;
        $q = isset($params['q']) ? trim($params['q']) : '';
        $tahun = isset($params['tahun']) ? trim($params['tahun']) : '';
        $program_studi_id = isset($params['program_studi_id']) ? trim($params['program_studi_id']) : '';
        $status_ajuan = isset($params['status_ajuan']) ? $params['status_ajuan'] : '';
        $wakil_dekan_id = isset($params['wakil_dekan_id']) ? $params['wakil_dekan_id'] : '';
        $exists_memo_cair_status_ajuan = isset($params['exists_memo_cair_status_ajuan']) ? $params['exists_memo_cair_status_ajuan'] : '';

        // Query dengan relasi lengkap
        $query = TorModel::with([
            'kegiatan_detail', 
            'kegiatan_detail.kegiatan', 
            'kegiatan_detail.user_pic_kegiatan', 
            'kegiatan_detail.user_pic',
            'iku', 
            'ik', 
            'p', 
            'program_studi'
        ]);

        // 1. Pencarian keyword (q)
        if ($q !== '') {
            $query->where(function ($query_q) use ($q) {
                $query_q->whereHas('kegiatan_detail', function ($kd) use ($q) {
                    $kd->where('nama_kegiatan_detail', 'LIKE', "%{$q}%")
                       ->orWhereHas('kegiatan', function ($k) use ($q) {
                           $k->where('nama_kegiatan', 'LIKE', "%{$q}%");
                       });
                })
                ->orWhereHas('program_studi', function ($ps) use ($q) {
                    $ps->where('nama_program_studi', 'LIKE', "%{$q}%");
                });
            });
        }

        // 2. Filter Tahun (relasi kegiatan_detail -> kegiatan -> tahun)
        if ($tahun !== '') {
            $query->whereHas('kegiatan_detail.kegiatan', function ($kQuery) use ($tahun) {
                $kQuery->where('tahun', $tahun);
            });
        }

        // 3. Filter Program Studi
        if ($program_studi_id !== '') {
            $query->where('program_studi_id', $program_studi_id);
        }

        // 4. Filter Status Ajuan
        if (!empty($status_ajuan)) {
            if (is_array($status_ajuan)) {
                $query->whereIn('status_ajuan', $status_ajuan);
            } elseif (str_contains($status_ajuan, ',')) {
                $statuses = array_map('trim', explode(',', $status_ajuan));
                $query->whereIn('status_ajuan', $statuses);
            } else {
                $query->where('status_ajuan', $status_ajuan);
            }
        }

        // 5. Filter Wakil Dekan ID
        if ($wakil_dekan_id !== '') {
            $query->where('wakil_dekan_id', $wakil_dekan_id);
        }

        // 6. Filter Memo Cair Status Ajuan
        if ($exists_memo_cair_status_ajuan !== '') {
            $query->whereHas('memo_cair', function ($mc) use ($exists_memo_cair_status_ajuan) {
                $mc->where('status_ajuan', $exists_memo_cair_status_ajuan);
            });
        }

        $query->orderByDesc('id');

        return $query->paginate($per_page)->toArray();
    }
}
