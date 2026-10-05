<?php

namespace Database\Seeders;

use App\Models\RoleModel;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'role' => 'pic_kegiatan',
                'nama_role' => 'PIC Kegiatan',
                'permissions' => [
                    "specific_is_user_pic", 
                    "specific_pic",
                    "tor_pic_update", 
                    "tor_pic_ajukan",
                    "tor_update", 
                    "tor_ajukan",
                    "memo_cair_create", 
                    "memo_cair_update",
                    "memo_cair_pic_ajukan",
                    "spj_pic_update", 
                    "spj_pic_ajukan"
                ],
                'keterangan' => 'Pelaksana Kegiatan: Dashboard, TOR RAB, Memo Cair, Lapor SPJ'
            ],
            [
                'role' => 'koordinator',
                'nama_role' => 'Koordinator',
                'permissions' => [
                    "specific_is_user_koordinator",
                    "tor_koordinator_validasi",
                    "kegiatan_add",
                    "kegiatan_update",
                    "kegiatan_delete",
                    "kegiatan_detail_add",
                    "kegiatan_detail_update",
                    "kegiatan_detail_delete"
                ],
                'keterangan' => 'Role Persetujuan TOR RAB Stage 1 (Koordinator)'
            ],
            [
                'role' => 'keuangan',
                'nama_role' => 'Sub Kor Non Akademik / Perencanaan',
                'permissions' => [
                    "specific_is_user_keuangan",
                    "tor_keuangan_validasi",
                    "memo_cair_keuangan_validasi"
                ],
                'keterangan' => 'Role Verifikasi Awal TOR RAB & Persetujuan Memo Cair (Sub Kor Non Akademik / Perencanaan)'
            ],
            [
                'role' => 'wakil_dekan',
                'nama_role' => 'Wakil Dekan',
                'permissions' => [
                    "specific_is_user_wakil_dekan", 
                    "specific_wakil_dekan",
                    "tor_wakil_dekan_validasi"
                ],
                'keterangan' => 'Role Persetujuan TOR RAB Stage 3 (Pengesahan Final Pimpinan)'
            ],
            [
                'role' => 'sub_kor',
                'nama_role' => 'Sub Kor Non Akademik / Perencanaan',
                'permissions' => [
                    "specific_is_user_subkor",
                    "memo_cair_keuangan_validasi",
                    "spj_keuangan_validasi"
                ],
                'keterangan' => 'Role Sub Koordinator: Dashboard, Persetujuan Memo Cair, & Verifikasi Anggaran'
            ],
            [
                'role' => 'verifikator_spj',
                'nama_role' => 'Verifikator SPJ',
                'permissions' => [
                    "specific_is_user_verifikator_spj", 
                    "spj_keuangan_validasi"
                ],
                'keterangan' => 'Role Verifikator SPJ: Dashboard & Verifikasi Dokumen SPJ (Valid / Belum Valid)'
            ],
            [
                'role' => 'bendahara',
                'nama_role' => 'Bendahara Pembayaran',
                'permissions' => [
                    "specific_is_user_bendahara"
                ],
                'keterangan' => 'Role Bendahara: Dashboard & Pembayaran Memo Cair (Pelunasan / Terbayar)'
            ]
        ];

        foreach ($roles as $r) {
            RoleModel::updateOrCreate(
                ['role' => $r['role']],
                [
                    'nama_role' => $r['nama_role'],
                    'permissions' => $r['permissions'],
                    'keterangan' => $r['keterangan']
                ]
            );
        }

        // Clean up empty / duplicate legacy role if exists
        RoleModel::where('role', 'SubKorKeuangan')->delete();
    }
}
