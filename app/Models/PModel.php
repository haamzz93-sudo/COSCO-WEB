<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PModel extends Model
{
    //
    protected $table="ps";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'ik_id',
        'kode_p',
        'deskripsi_p'
    ];

    
    public function ik(){
        return $this->belongsTo(IkModel::class);
    }
}
