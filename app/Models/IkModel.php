<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IkModel extends Model
{
    //
    protected $table="iks";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'iku_id',
        'kode_ik',
        'deskripsi_ik'
    ];

    
    public function iku(){
        return $this->belongsTo(IkuModel::class);
    }
}
