<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpjModel extends Model
{

    protected $table = 'spjs';
    protected $primaryKey = 'id';
    protected $perPage=99999999999999999999;

    protected $fillable = [
        'memo_cair_id',
        'kelompok_belanja_id',
        'no_kwitansi',
        'sudah_diterima_dari',
        'jumlah_uang',
        'untuk_pembayaran',
        'penerima_id',
        'kuasa_pengguna_anggaran_id',
        'bendahara_id',
        'pic_id',
        'rab',
        'lampiran',
        'file_spj',
        'data'
    ];

    protected $casts = [
        'rab' => 'array',
        'lampiran'  => 'array',
        'data' =>"array"
    ];

    public function memo_cair()
    {
        return $this->belongsTo(MemoCairModel::class, 'memo_cair_id');
    }

    public function kelompok_belanja()
    {
        return $this->belongsTo(KelompokBelanjaModel::class, 'kelompok_belanja_id');
    }

    public function penerima()
    {
        return $this->belongsTo(User::class, "penerima_id", "id");
    }

    public function kuasa_pengguna_anggaran()
    {
        return $this->belongsTo(User::class, "kuasa_pengguna_anggaran_id", "id");
    }

    public function bendahara()
    {
        return $this->belongsTo(User::class, "bendahara_id", "id");
    }

    public function pic()
    {
        return $this->belongsTo(User::class, "pic_id", "id");
    }
}