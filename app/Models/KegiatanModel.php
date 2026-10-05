<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanModel extends Model
{
    //
    protected $table="kegiatans";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'tahun',
        'nama_kegiatan'
    ];



    public function kegiatan_detail(){
        return $this->hasMany(KegiatanDetailModel::class, "kegiatan_id", "id")->orderBy("id", "desc");
    }
}
