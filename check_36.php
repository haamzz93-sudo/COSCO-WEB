<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$kd = Illuminate\Support\Facades\DB::table('kegiatan_details')->where('id', 36)->first();
echo "KD 36: " . json_encode($kd, JSON_PRETTY_PRINT) . PHP_EOL;

$all_kd = Illuminate\Support\Facades\DB::table('kegiatan_details')->get();
echo "Total KD: " . count($all_kd) . PHP_EOL;
foreach ($all_kd as $k) {
    echo "ID {$k->id}: {$k->nama_kegiatan_detail} (Kategori: {$k->kategori_kegiatan}, Biaya: {$k->biaya})" . PHP_EOL;
}
