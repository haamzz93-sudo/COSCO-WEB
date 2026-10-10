<?php

namespace Database\Seeders;

use App\Models\RoleModel;
use App\Models\User;
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

        $user = User::where('username', 'pejabat_pengadaan')
            ->orWhere('email', 'pengadaan.madiun@staff.uns.ac.id')
            ->first();

        $userData = [
            'name' => 'Pejabat Pengadaan PSDKU UNS Madiun',
            'username' => 'pejabat_pengadaan',
            'email' => 'pengadaan.madiun@staff.uns.ac.id',
            'password' => '$2y$12$Q4oP7QfZJ5z7u48uE70NKe9nCq64V2Q7K24a7N64kG2c3q4r8b5ty',
            'role' => 'pejabat_pengadaan',
            'status' => 'aktif',
            'tipe_user' => 'staff',
            'nip' => '198805122019031005',
            'no_wa' => '081234567890',
            'avatar_url' => '',
        ];

        if ($user) {
            $user->update($userData);
        } else {
            User::create($userData);
        }
    }
}
