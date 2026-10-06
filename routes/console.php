<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\WablasService;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 1. Schedule Reminder PIC untuk mengajukan TOR RAB
// Menjalankan pengecekan TOR berstatus "draft" setiap hari jam 7:30 pagi
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_pic_tor();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('30 7 * * *')
    ->name('reminder:pic-tor')
    ->withoutOverlapping();

// 2. Schedule Reminder PIC untuk Memo Cair
// Menjalankan pengecekan Memo berstatus "wakil_dekan_applied" setiap hari jam 07:00 pagi
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_pic_memo_cair();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 7 * * *')
    ->name('reminder:pic-memo-cair')
    ->withoutOverlapping();