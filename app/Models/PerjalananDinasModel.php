<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerjalananDinasModel extends Model
{
    protected $table = 'perjalanan_dinas';
    protected $primaryKey = 'id';
    protected $perPage = 99999999999999999999;

    protected $fillable = [
        'nomor_surat_tugas',
        'nama_kegiatan',
        'user_id',
        'pagu_id',
        'kegiatan_detail_id',
        'nominal_pagu',
        'tgl_berangkat',
        'tgl_kembali',
        'durasi_hari',
        'lokasi_tujuan',
        'jenis_transportasi',
        'foto_kegiatan',
        'berkas_bukti',
        'nominal_klaim',
        'nominal_disetujui',
        'status',
        'catatan_verifikator',
        'verifikator_id',
        'tgl_verifikasi',
        'bukti_bayar',
        'catatan_pembayaran',
        'tgl_bayar',
        'bendahara_id'
    ];

    protected $casts = [
        'lokasi_tujuan'   => 'array',
        'foto_kegiatan'   => 'array',
        'berkas_bukti'    => 'array',
        'tgl_berangkat'   => 'date:Y-m-d',
        'tgl_kembali'     => 'date:Y-m-d',
        'tgl_verifikasi'  => 'datetime',
        'tgl_bayar'       => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pagu()
    {
        return $this->belongsTo(PaguPerjalananDinasModel::class, 'pagu_id');
    }

    public function kegiatan_detail()
    {
        return $this->belongsTo(KegiatanDetailModel::class, 'kegiatan_detail_id');
    }

    public function verifikator()
    {
        return $this->belongsTo(User::class, 'verifikator_id');
    }

    public function bendahara()
    {
        return $this->belongsTo(User::class, 'bendahara_id');
    }
}
