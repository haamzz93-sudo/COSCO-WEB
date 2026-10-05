<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanModel extends Model
{

    //
    protected $table="pengaturans";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'type',
        'content'
    ];

}
