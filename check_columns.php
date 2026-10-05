<?php
require __DIR__ . '/vendor/autoload.php';
 = require_once __DIR__ . '/bootstrap/app.php';
 = ->make(Illuminate\Contracts\Console\Kernel::class);
->bootstrap();

echo 'tipe_pencairan exists: ' . (Illuminate\Support\Facades\Schema::hasColumn('memo_cairs', 'tipe_pencairan') ? 'YES' : 'NO') . PHP_EOL;
echo 'termin_ke exists: ' . (Illuminate\Support\Facades\Schema::hasColumn('memo_cairs', 'termin_ke') ? 'YES' : 'NO') . PHP_EOL;
