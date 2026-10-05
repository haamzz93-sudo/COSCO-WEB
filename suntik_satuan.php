<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\SatuanModel;

echo "=== MEMULAI SUNTIK DATA SATUAN STANDAR UNS MADIUN ===\n";

$satuans = [
    'OB',
    'Paket',
    'Orang/Jam',
    'Orang/Hari',
    'Orang/Bulan',
    'Orang/Kegiatan',
    'Orang',
    'Set',
    'Pax',
    'Kegiatan',
    'Kali',
    'Lembar',
    'Buku',
    'Unit',
    'Pcs',
    'Rim',
    'Bulan',
    'Hari'
];

DB::transaction(function() use ($satuans) {
    foreach ($satuans as $nama) {
        $exists = SatuanModel::where('nama_satuan', $nama)->first();
        if (!$exists) {
            SatuanModel::create([
                'nama_satuan' => $nama
            ]);
            echo "✓ Berhasil tambah satuan: {$nama}\n";
        } else {
            echo "- Satuan sudah ada: {$nama}\n";
        }
    }
});

echo "=== SELESAI! SEMUA 18 SATUAN BERHASIL DISUNTIKKAN ===\n";