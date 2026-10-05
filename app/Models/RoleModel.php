<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;



class RoleModel extends Model
{
    //
    protected $table="roles";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'role',
        'nama_role',
        'keterangan',
        'permissions'
    ];

    protected $casts = [
        'permissions' => 'array' // Otomatis konversi JSON ke array
    ];
}
