<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'master_user_id',
        'name',
        'username',
        'password',
        'role',
        'avatar_url',
        'no_wa',
        'email',
        'tipe_user',
        'status',
        'nip',
        'nama_bank',
        'nomor_rekening'
    ];
    protected $perPage=99999999999999999999;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['permissions', 'is_admin'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }


    public function getPermissionsAttribute()
    {
        return $this->permissions();
    }

    public function data_role()
    {
        return $this->belongsTo(RoleModel::class, "role", "role");
    }

    public function checkIsAdmin(): bool
    {
        $r = strtolower(trim((string)$this->role));
        return in_array($r, ["admin", "superadmin", "administrator"]);
    }

    public function isAdmin(): bool
    {
        return $this->checkIsAdmin();
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->checkIsAdmin();
    }

    public function hasPermission($permission)
    {
        if ($this->checkIsAdmin()) {
            return true;
        }
        $permissions = $this->permissions();
        
        if ((collect($permissions))->contains($permission)) {
            return true;
        }
        return false;
    }

    public function permissions()
    {
        $permissions=[
            "specific_is_user_wakil_dekan",
            "specific_wakil_dekan",
            "specific_is_user_koordinator",
            "specific_is_user_keuangan",
            "specific_is_user_pic",
            "specific_is_user_pp",

            'kegiatan_add',
            'kegiatan_update',
            'kegiatan_delete',

            'kegiatan_detail_add',
            'kegiatan_detail_update',
            'kegiatan_detail_delete',

            'tor_pic_update',
            'tor_pic_ajukan',
            'tor_koordinator_validasi',
            'tor_pp_validasi',
            'tor_keuangan_validasi',
            'tor_wakil_dekan_validasi',
            'pengadaan_pp_execute',
            'pengadaan_pp_upload',
            
            'memo_cair_pic_ajukan',
            'memo_cair_keuangan_validasi',

            'spj_pic_update',
            'spj_pic_ajukan',
            'spj_keuangan_validasi',

            // Master data & CRUD permissions
            'program_studi_add',
            'program_studi_update',
            'program_studi_delete',

            'iku_add',
            'iku_update',
            'iku_delete',

            'ik_add',
            'ik_update',
            'ik_delete',

            'satuan_add',
            'satuan_update',
            'satuan_delete',

            'mak_add',
            'mak_update',
            'mak_delete',

            'kelompok_belanja_add',
            'kelompok_belanja_update',
            'kelompok_belanja_delete',

            'user_add',
            'user_update',
            'user_delete',

            'role_add',
            'role_update',
            'role_delete',

            'p_add',
            'p_update',
            'p_delete'
        ];
        if($this->checkIsAdmin()){
            return $permissions;
        }


        $role = RoleModel::where('role', $this->role)->first();
        
        if (!isset($role)) {
            return [];
        }
        
        return $role->permissions;
    }
}
