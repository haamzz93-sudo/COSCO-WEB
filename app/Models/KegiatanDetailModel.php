<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanDetailModel extends Model
{
    //
    protected $table="kegiatan_details";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'kegiatan_id',
        'nama_kegiatan_detail',
        'kategori_kegiatan',
        'biaya',
        'pic_kegiatan'
    ];

    
    public function kegiatan(){
        return $this->belongsTo(KegiatanModel::class, "kegiatan_id", "id");
    }
    public function user_pic(){
        return $this->belongsTo(User::class, "pic_kegiatan", "id");
    }
    public function user_pic_kegiatan(){
        return $this->belongsTo(User::class, "pic_kegiatan", "id");
    }
    public function tor(){
        return $this->hasOne(TorModel::class, "kegiatan_detail_id", "id");
    }
    public function memo_cair(){
        return $this->hasManyThrough(
            MemoCairModel::class,        // Model tujuan
            TorModel::class,             // Model perantara (through)
            'kegiatan_detail_id',        // Foreign key di TorModel yang merujuk ke KegiatanDetailModel
            'tor_id',                    // Foreign key di MemoCairModel yang merujuk ke TorModel
            'id',                        // Local key di KegiatanDetailModel
            'id'                         // Local key di TorModel
        )->orderBy('memo_cairs.id', 'asc');
    }
}
