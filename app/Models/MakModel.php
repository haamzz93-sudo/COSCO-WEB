<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MakModel extends Model
{
    //
    protected $table="maks";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'kode_mak',
        'nama_belanja'
    ];
}
