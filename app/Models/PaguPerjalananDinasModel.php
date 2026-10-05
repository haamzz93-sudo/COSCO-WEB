<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaguPerjalananDinasModel extends Model
{
    protected $table = 'pagu_perjalanan_dinas';
    protected $primaryKey = 'id';
    protected $perPage = 99999999999999999999;

    protected $fillable = [
        'tahun_anggaran',
        'nama_pagu',
        'kegiatan_detail_id',
        'total_pagu',
        'keterangan',
        'created_by'
    ];

    protected $appends = ['total_terpakai', 'sisa_pagu'];

    public function kegiatan_detail()
    {
        return $this->belongsTo(KegiatanDetailModel::class, 'kegiatan_detail_id');
    }

    public function perjalanan_dinas()
    {
        return $this->hasMany(PerjalananDinasModel::class, 'pagu_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTotalTerpakaiAttribute()
    {
        return (int) $this->perjalanan_dinas()->where('status', 'dibayarkan')->sum('nominal_disetujui');
    }

    public function getSisaPaguAttribute()
    {
        return max(0, (int) $this->total_pagu - $this->total_terpakai);
    }
}
