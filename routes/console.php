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
    ->cron('0 7 * * *')
    // ->cron('* * * * *')
    ->name('reminder:pic-tor')
    ->withoutOverlapping();

// 2. Schedule Reminder PIC untuk Memo Cair
// Menjalankan pengecekan Memo berstatus "wakil_dekan_applied" setiap hari jam 07:00 pagi
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_pic_memo_cair();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 7 * * *')
    // ->cron('* * * * *')
    ->name('reminder:pic-memo-cair')
    ->withoutOverlapping();

// 3. Schedule Reminder Koordinator untuk Tor
// Menjalankan pengecekan Tor yang belum diverifikasi koordinator
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_koordinator_tor();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 8 * * *')
    // ->cron('* * * * *')
    ->name('reminder:koordinator-tor')
    ->withoutOverlapping();

// 4. Schedule Reminder Wakil Dekan untuk Tor
// Menjalankan pengecekan Tor yang belum diverifikasi wakil dekan
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_wd_tor();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 8 * * *')
    // ->cron('* * * * *')
    ->name('reminder:wd-tor')
    ->withoutOverlapping();

// 5. Schedule Reminder sub koordinator untuk memo cair
// Menjalankan pengecekan memo cair yang belum diverifikasi sub koordinator
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_keuangan_memo_cair();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 8 * * *')
    // ->cron('* * * * *')
    ->name('reminder:subkor-memo_cair')
    ->withoutOverlapping();

// 6. Schedule Reminder PIC Lapor SPJ
// Menjalankan pengecekan Memo Cair yang sudah terbayar tapi SPJ belum dilaporkan/revisi PIC setiap hari jam 07:00 pagi
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_lapor_spj();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 7 * * *')
    // ->cron('* * * * *')
    ->name('reminder:pic-lapor-spj')
    ->withoutOverlapping();

// 7. Schedule Reminder Verifikator untuk SPJ (Jam 8 pagi)
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_verifikator_spj();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 8 * * *')
    // ->cron('* * * * *')
    ->name('reminder:verifikator-spj')
    ->withoutOverlapping();

// 8. Schedule Reminder Bendahara untuk Transfer Dana (PK & Normal) - Jam 08:00
// Menjalankan pengecekan memo cair yang menunggu transfer bendahara
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_bayar_bendahara();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 8 * * *')
    // ->cron('* * * * *')
    ->name('reminder:bendahara-bayar-pagi')
    ->withoutOverlapping();

// 9. Schedule Reminder Bendahara untuk Transfer Dana (PK & Normal) - Jam 14:00
// Menjalankan pengecekan memo cair yang menunggu transfer bendahara (sore)
Schedule::call(function (WablasService $wablasService) {
    $wablasService->send_remind_bayar_bendahara();
})
    ->timezone(env("APP_TIMEZONE", "Asia/Jakarta"))
    ->cron('0 14 * * *')
    // ->cron('* * * * *')
    ->name('reminder:bendahara-bayar-sore')
    ->withoutOverlapping();