<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\KelompokBelanjaModel;
use App\Models\MakModel;

echo "=== MENAMBAH KELOMPOK BELANJA: MAK 03 Transport Lokal Dalam UNS ===\n";

$mak = MakModel::where('kode_mak', '03')->first();

if (!$mak) {
    echo "ERROR: MAK 03 tidak ditemukan di database!\n";
    exit(1);
}

// Cek apakah sudah ada
$sudahAda = KelompokBelanjaModel::where('mak_id', $mak->id)
    ->where('nama_kelompok_belanja', 'like', '%Dalam UNS%')
    ->first();

if ($sudahAda) {
    echo "INFO: Kelompok belanja Transport Lokal Dalam UNS sudah ada (id={$sudahAda->id}). Tidak ada yang ditambahkan.\n";
    exit(0);
}

$lampiran = [
    [
        'kode_lampiran' => 'c1a2b3d4-e5f6-7890-abcd-ef1234567890',
        'nama_lampiran'  => 'Undangan / Surat Keterangan Kegiatan Internal UNS',
        'tipe'           => 'required',
    ],
    [
        'kode_lampiran' => 'd2b3c4e5-f6a7-8901-bcde-f12345678901',
        'nama_lampiran'  => 'Daftar Penerimaan Bantuan Transport',
        'tipe'           => 'required',
    ],
    [
        'kode_lampiran' => 'e3c4d5f6-a7b8-9012-cdef-123456789012',
        'nama_lampiran'  => 'Surat Tugas / SK Panitia',
        'tipe'           => 'required',
    ],
    [
        'kode_lampiran' => 'f4d5e6a7-b8c9-0123-defa-234567890123',
        'nama_lampiran'  => 'LPJ',
        'tipe'           => 'required',
    ],
    [
        'kode_lampiran' => 'a5e6f7b8-c9d0-1234-efab-345678901234',
        'nama_lampiran'  => 'Dokumentasi',
        'tipe'           => 'required',
    ],
];

$baru = KelompokBelanjaModel::create([
    'mak_id'                => $mak->id,
    'nama_kelompok_belanja' => 'Lampiran Bantuan Transport Keg. Dalam UNS (Transport Lokal)',
    'lampiran'              => $lampiran,
    'kwitansi_pajak'        => 0.0,
    'kwitansi_tipe'         => 'transport',
]);

echo "✓ Berhasil menambahkan [MAK 03] {$baru->nama_kelompok_belanja} (id={$baru->id})\n";
echo "  Lampiran:\n";
foreach ($lampiran as $l) {
    echo "  - [{$l['tipe']}] {$l['nama_lampiran']}\n";
}
echo "=== SELESAI ===\n";
