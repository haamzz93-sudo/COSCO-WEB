<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IkuModel extends Model
{
    //
    protected $table="ikus";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'kode_iku',
        'deskripsi_iku'
    ];
}
