<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemoCairModel extends Model
{
    //
    protected $table="memo_cairs";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'tor_id',
        'status_ajuan',
        'status_spj',
        'catatan_keuangan',
        'catatan_keuangan_spj',
        'tipe_pencairan',
        'termin_ke',
        'status_pembayaran_pk',
        'tgl_cair_pk',
        'bukti_bayar',
        'tgl_bayar',
        'catatan_pembayaran',
        'rab',
        'total_rab'
    ];

    protected $casts=[
        'rab'   =>'array'
    ];

    public function tor(){
        return $this->belongsTo(TorModel::class);
    }
}
