<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelompokBelanjaModel extends Model
{
    //
    protected $table="kelompok_belanjas";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'mak_id',
        'nama_kelompok_belanja',
        'lampiran',
        'kwitansi_pajak',
        'kwitansi_tipe'
    ];

    protected $casts=[
        'lampiran'  =>'array'
    ];

    
    public function mak(){
        return $this->belongsTo(MakModel::class);
    }
}
