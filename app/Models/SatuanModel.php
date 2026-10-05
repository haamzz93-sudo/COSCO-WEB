<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SatuanModel extends Model
{
    //
    protected $table="satuans";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'nama_satuan',
    ];
}
