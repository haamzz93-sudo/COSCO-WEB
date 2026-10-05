<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$deletedPD = DB::table('perjalanan_dinas')
    ->whereNotNull('kegiatan_detail_id')
    ->whereNotExists(function($q) {
        $q->select(DB::raw(1))
          ->from('kegiatan_details')
          ->whereColumn('kegiatan_details.id', 'perjalanan_dinas.kegiatan_detail_id');
    })
    ->delete();

echo "Cleaned $deletedPD orphaned perjalanan dinas records.\n";
