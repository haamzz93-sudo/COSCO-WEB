<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\PengaturanController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\KegiatanDetailController;
use App\Http\Controllers\Api\IkuController;
use App\Http\Controllers\Api\IkController;
use App\Http\Controllers\Api\PController;
use App\Http\Controllers\Api\SatuanController;
use App\Http\Controllers\Api\MakController;
use App\Http\Controllers\Api\KelompokBelanjaController;
use App\Http\Controllers\Api\ProgramStudiController;
use App\Http\Controllers\Api\TorController;
use App\Http\Controllers\Api\MemoCairController;
use App\Http\Controllers\Api\SpjController;
use App\Http\Controllers\Api\PerjalananDinasController;


//FILE
Route::controller(FileController::class)->prefix("/file")->group(function(){
    Route::post("/upload", "upload");
    Route::post("/upload_avatar", "upload_avatar");
});

//PENGATURAN
Route::controller(PengaturanController::class)->prefix("/pengaturans")->group(function(){
    Route::post("/test_gemini", "test_gemini");
    Route::post("/test_wablas", "test_wablas");
    Route::put("/", "update");
    Route::get("/", "get");
});

//ROLE
Route::controller(RoleController::class)->prefix("/roles")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//USER
Route::controller(UserController::class)->prefix("/users")->group(function(){
    Route::put("/actions/sync_master_data", "sync_master_data");
    Route::post("/actions/sync_master_data", "sync_master_data");
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::put("/role/{id}", "update_role");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//KEGIATAN
Route::controller(KegiatanController::class)->prefix("/kegiatans")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//KEGIATAN DETAIL
Route::controller(KegiatanDetailController::class)->prefix("/kegiatan_details")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::put("/action/pic_kegiatan/{id}", "update_pic_kegiatan");
    Route::post("/action/tor/{id}", "add_tor");
    Route::put("/action/tor/{id}", "edit_tor");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//IKU
Route::controller(IkuController::class)->prefix("/ikus")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//IK
Route::controller(IkController::class)->prefix("/iks")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//P
Route::controller(PController::class)->prefix("/ps")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//MAK
Route::controller(MakController::class)->prefix("/maks")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//Satuan
Route::controller(SatuanController::class)->prefix("/satuans")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//Program Studi
Route::controller(ProgramStudiController::class)->prefix("/program_studis")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//Tor
Route::controller(TorController::class)->prefix("/tors")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::put("/ajukan/{id}", "ajukan");
    Route::put("/validasi_koordinator/{id}", "validasi_koordinator");
    Route::put("/validasi_keuangan/{id}", "validasi_keuangan");
    Route::put("/validasi_wakil_dekan/{id}", "validasi_wakil_dekan");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
    Route::post("/actions/request_gemini_tor/{id}", "request_gemini_tor");
    Route::post("/action/request_gemini_tor/{id}", "request_gemini_tor");
    Route::post("/actions/request_gemini_rab/{id}", "request_gemini_rab");
    Route::post("/action/request_gemini_rab/{id}", "request_gemini_rab");
});

//Memo Cair
Route::controller(MemoCairController::class)->prefix("/memo_cairs")->group(function(){
    Route::post("/", "add");
    Route::put("/validasi_keuangan/{id}", "validasi_keuangan");
    Route::put("/ajukan_spj/{id}", "ajukan_spj");
    Route::put("/validasi_keuangan_spj/{id}", "validasi_keuangan_spj");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});



//kelompok belanja
Route::controller(KelompokBelanjaController::class)->prefix("/kelompok_belanjas")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//spj
Route::controller(SpjController::class)->prefix("/spjs")->group(function(){
    Route::post("/", "add");
    Route::put("/kwitansi/{id}", "update_kwitansi");
    Route::put("/lampiran/{id}", "update_lampiran");
    Route::put("/data/{id}", "update_data");
    Route::put("/file_spj/{id}", "update_file_spj");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

// Perjalanan Dinas (Klaim SPPD)
Route::controller(PerjalananDinasController::class)->prefix("/perjalanan_dinas")->group(function(){
    Route::get("/", "gets");
    Route::get("/{id}", "get");
    Route::post("/", "create");
    Route::put("/{id}", "update");
    Route::put("/submit/{id}", "submit");
    Route::put("/validasi/{id}", "validasi");
    Route::put("/pembayaran/{id}", "pembayaran");
    Route::delete("/{id}", "delete");
    Route::post("/pagu", "pagu_update");
});
