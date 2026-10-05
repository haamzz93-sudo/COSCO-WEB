<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\MakModel;
use App\Models\KelompokBelanjaModel;

echo "=== MEMULAI SUNTIK DATA KELOMPOK BELANJA ===\n";

$data = [
    [
        'kode_mak' => '01',
        'nama_kelompok_belanja' => 'Lampiran Belanja Barang (<10juta)',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'rab',
        'lampiran' => [
            ['kode_lampiran' => 'a159d83a-a08c-466a-9a84-b97f581b41c2', 'nama_lampiran' => 'Nota/ Bukti Pembelian', 'tipe' => 'required'],
            ['kode_lampiran' => 'af2d34ae-ca96-4b54-8f55-18e79d4648bc', 'nama_lampiran' => 'Faktur Pajak Jika pembelian lebih dari 2 juta', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '02',
        'nama_kelompok_belanja' => 'Lampiran SPJ Honorarium Pembicara/Narasumber, Penguji atau Moderator',
        'kwitansi_pajak' => 5.0,
        'kwitansi_tipe' => 'rab',
        'lampiran' => [
            ['kode_lampiran' => '9da0fa6a-7afd-4602-8c30-9278f8af3fe8', 'nama_lampiran' => 'Undangan Kegiatan ke peserta', 'tipe' => 'required'],
            ['kode_lampiran' => '8f50a2a8-1cca-4cfe-9c36-456980e14484', 'nama_lampiran' => 'Undangan sebagai Narasumber', 'tipe' => 'required'],
            ['kode_lampiran' => '754c5ee9-87d7-417d-9c25-401dae829ce5', 'nama_lampiran' => 'Surat Kesediaan Menjadi Narasumber', 'tipe' => 'required'],
            ['kode_lampiran' => 'e328648a-bf48-4c46-a064-954af5dc4ae6', 'nama_lampiran' => 'Daftar hadir Narasumber dan peserta dgn format terlampir', 'tipe' => 'required'],
            ['kode_lampiran' => '4c17a3eb-deb6-4195-8841-d9fd3340609c', 'nama_lampiran' => 'Rundown Acara', 'tipe' => 'required'],
            ['kode_lampiran' => 'd2325434-7af5-4640-b318-f93f783abe74', 'nama_lampiran' => 'Apabila NS dari luar negeri dan tidak punya NPWP maka dipotong pajak pph 26 sebesar 20%', 'tipe' => 'required'],
            ['kode_lampiran' => 'a4f72ca4-24bf-4704-aebb-b2f0224cb25c', 'nama_lampiran' => 'Narasumber dari luar negeri wajib melampirkan FC pasport ataupun visa', 'tipe' => 'required'],
            ['kode_lampiran' => 'fe779a4a-8961-4453-b9cf-5f68f9800c5f', 'nama_lampiran' => 'Copy Buku Rekening + NPWP / KTP', 'tipe' => 'required'],
            ['kode_lampiran' => '6b10323b-0b50-4250-9f43-1798093f3ada', 'nama_lampiran' => 'Laporan kegiatan', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '03',
        'nama_kelompok_belanja' => 'Lampiran Bantuan Transport Keg. Luar UNS (Transport Lokal)',
        'kwitansi_pajak' => 0.0,
        'kwitansi_tipe' => 'transport',
        'lampiran' => [
            ['kode_lampiran' => '3282756f-85a8-40a5-a257-eda40f9b2e3b', 'nama_lampiran' => 'Undangan dan Daftar Undangan', 'tipe' => 'required'],
            ['kode_lampiran' => '94bb6860-5fe8-4cbb-aa45-bf5924fc6ceb', 'nama_lampiran' => 'Surat Tugas (Dicap Instansi Yang dikunjungi)', 'tipe' => 'required'],
            ['kode_lampiran' => '9a471b83-be8c-47a2-9908-dd27bc45d7d9', 'nama_lampiran' => 'Daftar Penerimaan bantuan Transport', 'tipe' => 'required'],
            ['kode_lampiran' => '4845a20b-0093-440a-b426-1680ede61b77', 'nama_lampiran' => 'LPJ', 'tipe' => 'required'],
            ['kode_lampiran' => '9fa30bde-fca7-4a02-94eb-af76ca467b01', 'nama_lampiran' => 'Dokumentasi', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '03',
        'nama_kelompok_belanja' => 'Lampiran Bantuan Transport Keg. Dalam UNS (Transport Lokal)',
        'kwitansi_pajak' => 0.0,
        'kwitansi_tipe' => 'transport',
        'lampiran' => [
            ['kode_lampiran' => 'f1a00001-0001-0001-0001-000000000001', 'nama_lampiran' => 'Undangan / Surat Keterangan Kegiatan Internal UNS', 'tipe' => 'required'],
            ['kode_lampiran' => 'f1a00001-0001-0001-0001-000000000002', 'nama_lampiran' => 'Daftar Penerimaan Bantuan Transport', 'tipe' => 'required'],
            ['kode_lampiran' => 'f1a00001-0001-0001-0001-000000000003', 'nama_lampiran' => 'LPJ', 'tipe' => 'required'],
            ['kode_lampiran' => 'f1a00001-0001-0001-0001-000000000004', 'nama_lampiran' => 'Dokumentasi', 'tipe' => 'required'],
            ['kode_lampiran' => 'f1a00001-0001-0001-0001-000000000005', 'nama_lampiran' => 'Surat Tugas / Undangan Internal', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '04',
        'nama_kelompok_belanja' => 'Kontribusi/Registrasi Pelatihan/ Serkom <10Jt',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'without_rab',
        'lampiran' => [
            ['kode_lampiran' => '990270cf-6e8c-4021-9829-83e9adbebaba', 'nama_lampiran' => 'Undangan/ Penawaran Pelatihan (Semacam Iklan) atau Surat Penunjukan / Permohonan Pelatihan atau Serkom', 'tipe' => 'required'],
            ['kode_lampiran' => '0037d1d7-8cff-446c-a2d7-ea6f857bdabf', 'nama_lampiran' => 'Invoice/Kwitansi', 'tipe' => 'required'],
            ['kode_lampiran' => 'f30a025a-bd8a-444d-9636-4fd1addca94e', 'nama_lampiran' => 'Surat Tugas Mengikuti', 'tipe' => 'required'],
            ['kode_lampiran' => 'f904a7b8-05e5-45a8-8f67-39162a59af86', 'nama_lampiran' => 'LPJ', 'tipe' => 'required'],
            ['kode_lampiran' => '5bd393d0-9009-43ec-bcd7-e11102ec2f17', 'nama_lampiran' => 'Dokumentasi', 'tipe' => 'required'],
            ['kode_lampiran' => '3c5cdd7c-82ed-489e-afde-c7e2b1a7b5f9', 'nama_lampiran' => 'Daftar Hadir/presensi', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '04',
        'nama_kelompok_belanja' => 'Lampiran SPJ biaya keanggotaan yang dibayar setiap tahun',
        'kwitansi_pajak' => 0.0,
        'kwitansi_tipe' => 'without_rab',
        'lampiran' => [
            ['kode_lampiran' => '0297b57d-8972-4bfe-b3da-fdace232d2cb', 'nama_lampiran' => 'Surat tagihan dari organisasi yg diikuti', 'tipe' => 'required'],
            ['kode_lampiran' => '83d84cf9-5ab0-4c96-9b54-bc98063ed1a3', 'nama_lampiran' => 'Bukti pembayaran/kuitansi asli dari organisasi bermeterai (nominal diatas 5 juta)', 'tipe' => 'required'],
            ['kode_lampiran' => '252f6840-4cbd-4bc6-8ec1-b8e64a5ec07d', 'nama_lampiran' => 'LPJ dan Dokumentasi', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '05',
        'nama_kelompok_belanja' => 'Lampiran SPJ bantuan Transport Mahasiswa/Narasumber',
        'kwitansi_pajak' => 0.0,
        'kwitansi_tipe' => 'without_rab',
        'lampiran' => [
            ['kode_lampiran' => 'bc167858-1dcc-4518-aaa2-baa04243ad60', 'nama_lampiran' => 'Bukti tiket dan receipt nya (Kereta api maupun pesawat)', 'tipe' => 'required'],
            ['kode_lampiran' => '57e71104-77ff-4371-9aec-17194e9dc391', 'nama_lampiran' => 'Boarding (kereta maupun pesawat)', 'tipe' => 'required'],
            ['kode_lampiran' => 'ae1d159a-1079-4324-a954-1cdaa9aa53cf', 'nama_lampiran' => 'Apabila yang berangkat mahasiswa rombongan (dalam jumlah lebih dari 1) maka dibuatkan daftarnya (lihat lampiran)', 'tipe' => 'required'],
            ['kode_lampiran' => '61e3a719-f37b-4db7-b774-c1392045123c', 'nama_lampiran' => 'Melampirkan Surat Tugas/ undangan', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '06',
        'nama_kelompok_belanja' => 'Lampiran Belanja Jasa/Sewa',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'without_rab',
        'lampiran' => [
            ['kode_lampiran' => 'da9caf05-d16f-4028-8e18-b0ef9c26a4da', 'nama_lampiran' => 'Nota/ Bukti Pembelian', 'tipe' => 'required'],
            ['kode_lampiran' => 'beec367f-dfb0-44dc-890f-8bdca6336434', 'nama_lampiran' => 'NIK/ NPWP penyedia', 'tipe' => 'required'],
            ['kode_lampiran' => '27da296b-c92e-44bf-9ede-e726d8d7307e', 'nama_lampiran' => 'Faktur Pajak Jika pembelian lebih dari 2 juta', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '07',
        'nama_kelompok_belanja' => 'Lampiran Belanja Barang (<10juta)',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'rab',
        'lampiran' => [
            ['kode_lampiran' => '23a844c3-2430-47f5-947e-33d117b156c4', 'nama_lampiran' => 'Nota/ Bukti Pembelian', 'tipe' => 'required'],
            ['kode_lampiran' => 'ad5bccfa-2922-4a08-a49f-4fe11fc8b965', 'nama_lampiran' => 'Faktur Pajak Jika pembelian lebih dari 2 juta', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '08',
        'nama_kelompok_belanja' => 'Lampiran Belanja Biaya Promosi dan Iklan',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'without_rab',
        'lampiran' => [
            ['kode_lampiran' => '0720b514-bca6-4478-a57d-be238ff32f0a', 'nama_lampiran' => 'Nota / Invoice bukti pembelian', 'tipe' => 'required'],
            ['kode_lampiran' => 'e6690c5b-37f8-440d-b8f3-254752b7751a', 'nama_lampiran' => 'Bukti transfer', 'tipe' => 'required'],
            ['kode_lampiran' => 'dbd8ec90-1246-4e56-89ac-578d262f27ec', 'nama_lampiran' => 'SC berita yg di publish', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '10',
        'nama_kelompok_belanja' => 'Lampiran Belanja Jasa/Sewa',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'rab',
        'lampiran' => [
            ['kode_lampiran' => '57248a48-5a01-457e-b595-b659e44aa59e', 'nama_lampiran' => 'Nota/ Bukti Pembelian', 'tipe' => 'required'],
            ['kode_lampiran' => '71f6e3fe-d145-4f7e-9f9e-45f38494f05c', 'nama_lampiran' => 'NIK/ NPWP penyedia', 'tipe' => 'required'],
            ['kode_lampiran' => '6f09d14c-09df-4286-a3d1-fd40a7915e36', 'nama_lampiran' => 'Faktur Pajak Jika pembelian lebih dari 2 juta', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '11',
        'nama_kelompok_belanja' => 'Lampiran Belanja Barang (<10juta)',
        'kwitansi_pajak' => 10.0,
        'kwitansi_tipe' => 'rab',
        'lampiran' => [
            ['kode_lampiran' => '8c654514-edc3-4a65-a264-32959ea64c0b', 'nama_lampiran' => 'Nota/ Bukti Pembelian', 'tipe' => 'required'],
            ['kode_lampiran' => '9ec00db4-ef99-4355-9cc2-ee35a8d476cb', 'nama_lampiran' => 'Faktur Pajak Jika pembelian lebih dari 2 juta', 'tipe' => 'required'],
        ],
    ],
    [
        'kode_mak' => '13',
        'nama_kelompok_belanja' => 'Lampiran Belanja Registrasi HKI',
        'kwitansi_pajak' => 0.0,
        'kwitansi_tipe' => 'without_rab',
        'lampiran' => [
            ['kode_lampiran' => '885a9651-fb56-4973-b8bc-85395b1c2a40', 'nama_lampiran' => 'Nota / Invoice', 'tipe' => 'required'],
            ['kode_lampiran' => '173ee309-8b5d-4a8f-99b6-b167f1b0b529', 'nama_lampiran' => 'Bukti tf', 'tipe' => 'required'],
            ['kode_lampiran' => '70f4ac2c-9e7f-4eab-8d04-3705ccce3be2', 'nama_lampiran' => 'Sertifikat HKI', 'tipe' => 'required'],
        ],
    ],
];

DB::transaction(function() use ($data) {
    DB::table('kelompok_belanjas')->delete();

    foreach ($data as $item) {
        $mak = MakModel::where('kode_mak', $item['kode_mak'])->first();
        if (!$mak) {
            echo "Warning: MAK {$item['kode_mak']} tidak ditemukan!\n";
            continue;
        }

        KelompokBelanjaModel::create([
            'mak_id'                => $mak->id,
            'nama_kelompok_belanja' => $item['nama_kelompok_belanja'],
            'lampiran'              => $item['lampiran'],
            'kwitansi_pajak'        => $item['kwitansi_pajak'],
            'kwitansi_tipe'         => $item['kwitansi_tipe'],
        ]);

        echo "✓ Berhasil suntik [MAK {$item['kode_mak']}] {$item['nama_kelompok_belanja']}\n";
    }
});

echo "=== SELESAI! DATA KELOMPOK BELANJA BERHASIL DI-SUNTIK ===\n";
