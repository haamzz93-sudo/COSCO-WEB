<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //GATE
        //list gate dapat dilihat di table permissions (PrivilegeSeeder)
        Gate::before(function (User $user, $ability) {
            if ($user->checkIsAdmin()) {
                return true;
            }
        });

        //gate name
        $permissions = [
            // Spesifik
            'specific_is_user_pic',
            'specific_pic',
            "specific_is_user_wakil_dekan",
            'specific_wakil_dekan',
            "specific_is_user_koordinator",
            "specific_is_user_keuangan",
            "specific_is_user_pp",
            
            // Role
            'role_add',
            'role_update',
            'role_delete',
            
            // User
            'user_sync',
            'user_update',
            'user_role_update',
            
            // Pengaturan
            'pengaturan',
            
            // Satuan
            'satuan_add',
            'satuan_update',
            'satuan_delete',
            
            // Program Studi
            'program_studi_add',
            'program_studi_update',
            'program_studi_delete',
            
            // IKU
            'iku_add',
            'iku_update',
            'iku_delete',
            
            // IK
            'ik_add',
            'ik_update',
            'ik_delete',
            
            // P
            'p_add',
            'p_update',
            'p_delete',
            
            // MAK
            'mak_add',
            'mak_update',
            'mak_delete',

            // kelompok belanja
            'kelompok_belanja_add',
            'kelompok_belanja_update',
            'kelompok_belanja_delete',

            // Kegiatan
            'kegiatan_add',
            'kegiatan_update',
            'kegiatan_delete',
            
            // Kegiatan Detail
            'kegiatan_detail_add',
            'kegiatan_detail_update',
            'kegiatan_detail_delete',

            // tor
            'tor_pic_update',
            'tor_pic_ajukan',
            'tor_koordinator_validasi',
            'tor_pp_validasi',
            'tor_keuangan_validasi',
            'tor_wakil_dekan_validasi',
            'pengadaan_pp_execute',
            'pengadaan_pp_upload',
            
            // memo cair
            'memo_cair_pic_ajukan',
            'memo_cair_keuangan_validasi',
            
            // spj
            'spj_pic_update',
            'spj_pic_ajukan',
            'spj_keuangan_validasi'
        ];

        #spesifik

        #register all
        foreach ($permissions as $permission) {
            Gate::define($permission, function (User $user) use ($permission) {
                return $user->hasPermission($permission);
            });
        }
    }
}
