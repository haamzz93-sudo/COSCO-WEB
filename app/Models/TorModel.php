<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TorModel extends Model
{
    //
    protected $table="tors";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'kegiatan_detail_id',
        'program_studi_id',
        'iku_id',
        'ik_id',
        'p_id',
        'latar_belakang',
        'rasionalisasi',
        'tujuan',
        'mekanisme_dan_rancangan',
        'jadwal_pelaksanaan',
        'iku_detail',
        'ik_detail',
        'keberlanjutan',
        'penanggung_jawab',
        'status_ajuan',
        'catatan_koordinator',
        'catatan_pp',
        'file_dokumen_pengadaan',
        'status_pengadaan',
        'catatan_wakil_dekan',
        'catatan_keuangan',
        'wakil_dekan_id',
        'rab',
        'total_rab'
    ];

    protected $casts=[
        'mekanisme_dan_rancangan'=>'array',
        'jadwal_pelaksanaan'=>'array',
        'iku_detail'=>'array',
        'ik_detail'=>'array',
        'penanggung_jawab'=>'array',
        'rab'   =>'array'
    ];

    public function kegiatan_detail(){
        return $this->belongsTo(KegiatanDetailModel::class);
    }
    
    public function program_studi(){
        return $this->belongsTo(ProgramStudiModel::class);
    }

    public function iku(){
        return $this->belongsTo(IkuModel::class);
    }
    
    public function ik(){
        return $this->belongsTo(IkModel::class);
    }
    
    public function p(){
        return $this->belongsTo(PModel::class);
    }
    
    public function memo_cair(){
        return $this->hasMany(MemoCairModel::class, "tor_id", "id");
    }
}
