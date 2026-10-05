<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dashboard\KegiatanController;
use App\Http\Controllers\Dashboard\TorController;
use App\Http\Controllers\Dashboard\MemoCairController;

Route::match(['get', 'post'], '/', [DashboardController::class, 'index'])->name("dashboard");

Route::controller(DashboardController::class)->group(function(){
    Route::post("/financial-metrics", "update_financial_metrics");
    Route::get("/roles", "role");
    Route::get("/users", "user");
    Route::get("/pengaturans", "pengaturan");
    Route::get("/sesis", "sesi");
    Route::get("/program_studis", "program_studi");
    Route::get("/ikus", "iku");
    Route::get("/iks", "ik");
    Route::get("/ps", "p");
    Route::get("/satuans", "satuan");
    Route::get("/maks", "mak");
    Route::get("/kelompok_belanjas", "kelompok_belanja");
    Route::get("/kegiatans", "kegiatan");
    Route::get("/kegiatans/type/detail", "kegiatan_detail");
    Route::get("/kegiatans/type/summary/rab", "rab");
    Route::get("/kegiatans/type/summary/pic_kegiatan", "pic_kegiatan");
    Route::get("/tors", "tor");
    Route::match(['get', 'post'], "/tors/detail_kegiatan/{id}", "tor_detail_kegiatan");
    Route::match(['get', 'post'], "/tors/detail/{kegiatan_detail_id}", "tor_detail");
    Route::match(['get', 'post'], "/tors/rab/{kegiatan_detail_id}", "tor_rab");
    Route::match(['get', 'post'], "/tors/persetujuan", "tor_persetujuan");

    // DEDICATED ROUTES FOR HPS / BHP / INVENTARIS
    Route::match(['get', 'post'], "/hps/detail_kegiatan/{id}", "tor_detail_kegiatan");
    Route::match(['get', 'post'], "/hps/rab/{kegiatan_detail_id}", "tor_rab");
    Route::match(['get', 'post'], "/hps/detail/{kegiatan_detail_id}", "tor_rab");
    Route::match(['get', 'post'], "/bhp/detail_kegiatan/{id}", "tor_detail_kegiatan");
    Route::match(['get', 'post'], "/bhp/rab/{kegiatan_detail_id}", "tor_rab");
    Route::match(['get', 'post'], "/inventaris/detail_kegiatan/{id}", "tor_detail_kegiatan");
    Route::match(['get', 'post'], "/inventaris/rab/{kegiatan_detail_id}", "tor_rab");
    Route::match(['get', 'post'], "/memo_cairs", "memo_cair");
    Route::match(['get', 'post'], "/memo_cairs/detail/{kegiatan_detail_id}", "memo_cair_detail");
    Route::match(['get', 'post'], "/memo_cairs/persetujuan/detail/{kegiatan_detail_id}", "memo_cair_detail_persetujuan");
    Route::get("/memo_cairs/persetujuan", "memo_cair_persetujuan");
    Route::get("/memo_cairs/validasi_spj", "memo_cair_validasi_spj");
    Route::get("/memo_cairs/pembayaran", "memo_cair_pembayaran");
    Route::get("/spjs", "spj");
    Route::get("/spjs/template", "spj_template");
    Route::get("/spjs/detail/{memo_cair_id}", "spj_detail");
    Route::get("/spjs/print/{spj_id}", "spj_print");
    Route::get("/spjs/view/{spj_id}", "spj_viewer");
    // PERJALANAN DINAS (SPPD)
    Route::get("/perjalanan_dinas", "perjalanan_dinas");
    Route::match(['get', 'post'], "/perjalanan_dinas/isi_bukti/{id?}", "perjalanan_dinas_form");
});