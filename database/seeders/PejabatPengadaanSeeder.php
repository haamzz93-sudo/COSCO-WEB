<?php

namespace Database\Seeders;

use App\Models\RoleModel;
use Illuminate\Database\Seeder;

class PejabatPengadaanSeeder extends Seeder
{
    public function run(): void
    {
        RoleModel::updateOrCreate(
            ['role' => 'pejabat_pengadaan'],
            [
                'nama_role' => 'Pejabat Pengadaan (PP)',
                'permissions' => [
                    "specific_is_user_pp",
                    "tor_pp_validasi",
                    "pengadaan_pp_execute",
                    "pengadaan_pp_upload",
                    "satuan_add",
                    "satuan_update",
                    "kegiatan_detail_update"
                ],
                'keterangan' => 'Role Pejabat Pengadaan (PP): Verifikasi HPS BHP & Inventaris, Eksekusi Pengadaan, dan Unggah BAST Dokumen Belanja'
            ]
        );
    }
}
