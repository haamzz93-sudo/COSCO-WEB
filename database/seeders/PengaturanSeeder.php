<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PengaturanModel;

class PengaturanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PengaturanModel::firstOrCreate([
            'type'      =>"prompt_tor",
        ], [
            'content'   =>""
        ]);
        PengaturanModel::firstOrCreate([
            'type'      =>"prompt_rab",
        ], [
            'content'   =>""
        ]);
        PengaturanModel::firstOrCreate([
            'type'      =>"return_prompt_tor",
        ], [
            'content'   =>"Kembalikan dalam format JSON murni dengan type textarea dengan properti 'latar_belakang', 'rasionalisasi', 'tujuan', 'keberlanjutan', khusus untuk mekanisme dan rancangan kembalikan dengan properti 'mekanisme_dan_rancangan' dengan value array 1 dimensi."
        ]);
        PengaturanModel::firstOrCreate([
            'type'      =>"return_prompt_rab",
        ], [
            'content'   =>"Kembalikan rab dengan nama field 'rab' yang berisi array 1 dimensi dengan kolom kelompok_belanja_id,nama_kelompok_belanja,kode_item,keterangan,frekuensi,volume,satuan,harga_satuan,pajak. masukkan Kelompok Belanja(id dan nama_kelompok_belanja) di kolom kelompok_belanja_id dan nama_kelompok_belanja_id, kolom keterangan isikan dengan nama barang, kolom kode_item generate secara otomatis uuid v4, kolom pajak ambil value dari kelompok_belanja attribut kwitansi_pajak"
        ]);
        PengaturanModel::firstOrCreate([
            'type'      =>"bendahara",
        ], [
            'content'   =>""
        ]);
        
        //GEMINI API
        PengaturanModel::firstOrCreate([
            'type'      =>"GEMINI_API_KEY",
        ], [
            'content'   =>""
        ]);

        //WABLAS API TOKEN
        PengaturanModel::firstOrCreate([
            'type'      =>"wablas_api_token",
        ], [
            'content'   =>""
        ]);
        PengaturanModel::firstOrCreate([
            'type'      =>"wablas_api_secret",
        ], [
            'content'   =>""
        ]);
        PengaturanModel::firstOrCreate([
            'type'      =>"wablas_url",
        ], [
            'content'   =>""
        ]);


        //NOTIFIKASI WA
        $notifikasi_wa=[
            "assign_pic" => "",
            "remind_pic_tor" => "",
            "submit_tor_koordinator" => "",
            "submit_tor_keuangan" => "",
            "submit_tor_wd" => "",
            "approve_tor_koordinator" => "",
            "revisi_tor_koordinator" => "",
            "approve_tor_keuangan" => "",
            "revisi_tor_keuangan" => "",
            "approve_tor_wd" => "",
            "revisi_tor_wd" => "",
            "remind_memo_cair" => "",
            "submit_memo_cair" => "",
            "approve_memo_cair_keuangan" => "",
            "reject_memo_cair_keuangan" => ""
        ];

        foreach ($notifikasi_wa as $key=>$value) {
            PengaturanModel::firstOrCreate(
                ['type' => $key],
                [
                    'content' => ""
                ]
            );
        }
    }
}
