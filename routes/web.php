<?php

use App\Http\Controllers\LandingController;


use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DataController;
use App\Models\IkuModel;
use App\Models\IkModel;
use App\Models\PModel;


// Route::get("/import", function(){
//     $json='{
//   "distinct_data": [
//     {
//       "kode_iku": "IKU001",
//       "iku": "Kesiapan kerja lulusan - QS Employer Reputation - QS Employment Outcomes"
//     },
//     {
//       "kode_iku": "IKU002",
//       "iku": "Mahasiswa berkegiatan di luar kampus /meraih prestasi di luar program studi - THE International Outlook (students) - QS Asia Student Outbound"
//     },
//     {
//       "kode_iku": "IKU003",
//       "iku": "Dosen di luar kampus - QS: Academic Reputation - THE: International Outlook (staff & research) - THE International collaboration - THE Reputation"
//     },
//     {
//       "kode_iku": "IKU004",
//       "iku": "Kualifikasi dosen/pengajar - QS International faculty ratio - QS Faculty/Student Ratio - THE: Proportion of international staff - QS Asia ranking Staff with PhD - QS Asia International Faculty Ratio"
//     },
//     {
//       "kode_iku": "IKU005",
//       "iku": "Penerapan karya dosen - QS: Citation Per Faculty - QS International Research Network - QS Academic Reputation - THE: Research (reputation survey, research income, research productivity) - THE citations (research influenece) - THE International Outlook (staff, students, research)- Webometric: Transparency (or openness) - Webometric: Excellence (or scholar)"
//     },
//     {
//       "kode_iku": "IKU006",
//       "iku": "Kemitraan program studi - QS Academic Reputation - THE International Outlook - QS Asia Inbound Exchange student - QS Asia Outbound Exchange student - QS International Student - QS Asia International Staff - QS Asia International Student"
//     },
//     {
//       "kode_iku": "IKU007",
//       "iku": "Pembelajaran dalam kelas"
//     },
//     {
//       "kode_iku": "IKU008",
//       "iku": "Akreditasi Internasional - QS: International student ratio - QS International faculty ratio; THE - Proportion of International students & international staff"
//     },
//     {
//       "kode_iku": "IKU009",
//       "iku": "Rata-rata predikat SAKIP Satker minimal BB"
//     },
//     {
//       "kode_iku": "IKU010",
//       "iku": "Rata-rata nilai Kinerja Anggaran atas Pelaksanaan RKA-K/L Satker minimal 80"
//     }
//   ]
// }';
//     foreach(json_decode($json, true)['distinct_data'] as $val){
//         IkuModel::create([
//             'kode_iku'  =>$val['kode_iku'],
//             'deskripsi_iku'=>$val['iku']
//         ]);
//     }
// });

// Route::get("/import_2", function(){
//     $json='{
//   "distinct_data": [
//     {
//       "kode_iku": "IKU001",
//       "kode_ik": "IK01",
//       "ik": "Mendapatkan pekerjaan yang layak"
//     },
//     {
//       "kode_iku": "IKU001",
//       "kode_ik": "IK02",
//       "ik": "Lulusan berwirausaha"
//     },
//     {
//       "kode_iku": "IKU001",
//       "kode_ik": "IK03",
//       "ik": "Lulusan melanjutkan studi S-2"
//     },
//     {
//       "kode_iku": "IKU001",
//       "kode_ik": "IK04",
//       "ik": "Alumni Berpengaruh"
//     },
//     {
//       "kode_iku": "IKU002",
//       "kode_ik": "IK05",
//       "ik": "Mahasiswa menghabiskan 20 sks di luar kampus"
//     },
//     {
//       "kode_iku": "IKU002",
//       "kode_ik": "IK06",
//       "ik": "Pertukaran mahasiswa jangka pendek"
//     },
//     {
//       "kode_iku": "IKU002",
//       "kode_ik": "IK07",
//       "ik": "Mahasiswa meraih prestasi"
//     },
//     {
//       "kode_iku": "IKU003",
//       "kode_ik": "IK08",
//       "ik": "Dosen bertridharma di kampus lain"
//     },
//     {
//       "kode_iku": "IKU003",
//       "kode_ik": "IK09",
//       "ik": "Dosen bekerja sebagai praktisi"
//     },
//     {
//       "kode_iku": "IKU003",
//       "kode_ik": "IK10",
//       "ik": "Dosen membimbing mahasiswa berkegiatan di luar program studi"
//     },
//     {
//       "kode_iku": "IKU004",
//       "kode_ik": "IK11",
//       "ik": "Dosen tetap berkualifikasi S3"
//     },
//     {
//       "kode_iku": "IKU004",
//       "kode_ik": "IK12",
//       "ik": "Dosen tetap memiliki bersertifikat kompetensi/profesi yang diakui"
//     },
//     {
//       "kode_iku": "IKU004",
//       "kode_ik": "IK13",
//       "ik": "Dosen berasal dari kalangan praktisi profesional, dengan pengalaman di dunia kerja"
//     },
//     {
//       "kode_iku": "IKU004",
//       "kode_ik": "IK14",
//       "ik": "Dosen berasal dari kalangan praktisi profesional, dengan pengalaman di dunia kerja"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK15",
//       "ik": "Luaran penelitian dan pengabdian rekognisi internasional dalam bentuk artikel ilmiah"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK16",
//       "ik": "Jumlah Sitasi"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK17",
//       "ik": "Luaran penelitian dan pengabdian rekognisi internasional dalam bentuk buku"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK18",
//       "ik": "Jurnal Terbitan UNS"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK19",
//       "ik": "Luaran penelitian dan pengabdian dalam bentuk publikasi artikel ilmiah populer di media massa"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK20",
//       "ik": "Konferensi yang diselenggarakan UNS"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK21",
//       "ik": "Luaran diterapkan oleh masyarakat/pemerintah/industri dalam bentuk HKI (Hak Kekayaan Intelektual)"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK22",
//       "ik": "Data Academic peer list QS"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK23",
//       "ik": "Proposal penelitian dan pengabdian masyarakat"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK24",
//       "ik": "Pendapatan institusi"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK25",
//       "ik": "Pendapatan dana riset"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK26",
//       "ik": "Pendapatan Kerjasama Industri"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK27",
//       "ik": "Unit usaha"
//     },
//     {
//       "kode_iku": "IKU005",
//       "kode_ik": "IK28",
//       "ik": "Jumlah Dana abadi"
//     },
//     {
//       "kode_iku": "IKU006",
//       "kode_ik": "IK29",
//       "ik": "Jumlah program Studi Bekerjasama dengan Mitra Kelas Dunia (THE Survei reputasi penelitian)"
//     },
//     {
//       "kode_iku": "IKU006",
//       "kode_ik": "IK30",
//       "ik": "Kolaborasi Internasional"
//     },
//     {
//       "kode_iku": "IKU006",
//       "kode_ik": "IK31",
//       "ik": "Visibilitas Website"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK32",
//       "ik": "Input mahasiswa yang berkualitas"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK33",
//       "ik": "Modul pembelajaran yang berkualitas"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK34",
//       "ik": "Teaching industry yang berkualitas"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK35",
//       "ik": "Mata kuliah yang menggunakan metode pemecahan kasus"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK36",
//       "ik": "Mata kuliah yang menggunakan metode project based learning"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK37",
//       "ik": "Mata kuliah yang menggunakan metode daring (MOOC) pada platform yang dapat diakses secara internasional"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK38",
//       "ik": "Fasilitas laboratorium"
//     },
//     {
//       "kode_iku": "IKU007",
//       "kode_ik": "IK39",
//       "ik": "Fasilitas berbasis ICT"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK40",
//       "ik": "Jumlah program Studi terakreditasi Internasional"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK41",
//       "ik": "Jumlah program Studi terakreditasi A (Unggul)"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK42",
//       "ik": "Rasio dosen per mahasiswa"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK43",
//       "ik": "Rasio mahasiswa program doktor per mahasiswa program sarjana"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK44",
//       "ik": "Rasio alumni program S-3 yang diangkat menjadi staff"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK45",
//       "ik": "Proporsi mahasiswa internasional degree dan non-degree"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK46",
//       "ik": "Dosen internasional dan inbound"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK47",
//       "ik": "Prodi yang menyelenggarakan double/joint degree/kelas internasional"
//     },
//     {
//       "kode_iku": "IKU008",
//       "kode_ik": "IK48",
//       "ik": "Dampak Sosial dan Keberlanjutan"
//     },
//     {
//       "kode_iku": "IKU009",
//       "kode_ik": "IK49",
//       "ik": "Manajemen Perubahan"
//     },
//     {
//       "kode_iku": "IKU009",
//       "kode_ik": "IK50",
//       "ik": "Penataan Tata Laksana"
//     },
//     {
//       "kode_iku": "IKU009",
//       "kode_ik": "IK51",
//       "ik": "Penataan Sistem Manajemen SDM"
//     },
//     {
//       "kode_iku": "IKU009",
//       "kode_ik": "IK52",
//       "ik": "Penguatan Akuntabilitas"
//     },
//     {
//       "kode_iku": "IKU009",
//       "kode_ik": "IK53",
//       "ik": "Penguatan Pengawasan"
//     },
//     {
//       "kode_iku": "IKU009",
//       "kode_ik": "IK54",
//       "ik": "Peningkatan Kualitas Pelayanan Publik"
//     },
//     {
//       "kode_iku": "IKU010",
//       "kode_ik": "IK55",
//       "ik": "Opini Penilaian Laporan Keuangan oleh Akuntan Publik"
//     },
//     {
//       "kode_iku": "IKU010",
//       "kode_ik": "IK56",
//       "ik": "Indeks kepuasan pegawai"
//     },
//     {
//       "kode_iku": "IKU010",
//       "kode_ik": "IK57",
//       "ik": "Indeks kepuasan unit"
//     }
//   ]
// }';
//     foreach(json_decode($json, true)['distinct_data'] as $val){
//         $iku=IkuModel::where("kode_iku", $val['kode_iku'])->first();
//         IkModel::create([
//             'iku_id'    =>$iku['id'],
//             'kode_ik'   =>$val['kode_ik'],
//             'deskripsi_ik'=>$val['ik']
//         ]);
//     }
// });

// Route::get("/import_3", function(){
//     $json='{
//   "distinct_data": [
//     {
//       "kode_ik": "IK01",
//       "kode_p": "P01",
//       "program": "Peningkatan jumlah lulusan yang mendapatkan pekerjaan yang layak setelah lulus sebelum 6 bulan"
//     },
//     {
//       "kode_ik": "IK01",
//       "kode_p": "P02",
//       "program": "Peningkatan layanan karir mahasiswa dan alumni"
//     },
//     {
//       "kode_ik": "IK01",
//       "kode_p": "P03",
//       "program": "Peningkatan jumlah partisipasi alumni untuk mendukung karir mahasiswa"
//     },
//     {
//       "kode_ik": "IK02",
//       "kode_p": "P04",
//       "program": "Peningkatan jumlah lulusan yang berwirausaha"
//     },
//     {
//       "kode_ik": "IK02",
//       "kode_p": "P05",
//       "program": "Peningkatan jumlah partisipasi alumni untuk mendukung kewirausahaan"
//     },
//     {
//       "kode_ik": "IK03",
//       "kode_p": "P06",
//       "program": "Peningkatan jumlah lulusan yang melanjutkan studi S2"
//     },
//     {
//       "kode_ik": "IK04",
//       "kode_p": "P07",
//       "program": "Peningkatan jumlah alumni yang berpengaruh"
//     },
//     {
//       "kode_ik": "IK04",
//       "kode_p": "P08",
//       "program": "Peningkatan jumlah partisipasi alumni dalam mendukung program kepemimpinan mahasiswa"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P09",
//       "program": "Peningkatan jumlah program studi dan mahasiswa kelas internasional"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P10",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program studi independen bersertifikat"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P11",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program Kampus Mengajar"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P12",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program Penelitian MBKM"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P13",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program Proyek Kemanusiaan"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P14",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang berwirausaha"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P15",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti programstudi/proyek independen"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P16",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program KKN MBKM"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P17",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program Bela Negara"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P18",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program pertukaran mahasiswa internasional"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P19",
//       "program": "Peningkatan jumlah mahasiswa S1/D4/D3 yang mengikuti program pertukaran mahasiswa nasional"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P20",
//       "program": "Peningkatan jumlah mahasiswa peserta program gelar ganda (double degree)"
//     },
//     {
//       "kode_ik": "IK05",
//       "kode_p": "P21",
//       "program": "Peningkatan jumlah mahasiswa peserta program gelar bersama (joint degree)"
//     },
//     {
//       "kode_ik": "IK06",
//       "kode_p": "P22",
//       "program": "Peningkatan jumlah mahasiswa yang mengikuti pertukaran pelajar jangka pendek"
//     },
//     {
//       "kode_ik": "IK07",
//       "kode_p": "P23",
//       "program": "Peningkatan jumlah prestasi internasional mahasiswa"
//     },
//     {
//       "kode_ik": "IK07",
//       "kode_p": "P24",
//       "program": "Peningkatan jumlah prestasi nasional mahasiswa"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P25",
//       "program": "Peningkatan jumlah riset kolaborasi bersama perguruan tinggi luar negeri yang salah satu prodinya masuk QS 100 by subject"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P26",
//       "program": "Peningkatan jumlah riset kolaborasi bersama mitra industri yang masuk dalam FORBES 2000"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P27",
//       "program": "Peningkatan jumlah riset kolaborasi bersama mitra perguruan tinggi luar negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P28",
//       "program": "Peningkatan jumlah riset kolaborasi bersama mitra industri/instansi luar negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P29",
//       "program": "Peningkatan jumlah riset kolaborasi bersama mitra perguruan tinggi dalam negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P30",
//       "program": "Peningkatan jumlah riset kolaborasi bersama mitra industri dalam negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P31",
//       "program": "Peningkatan jumlah pengabdian masyarakat kolaborasi bersama perguruan tinggi luar negeri yang salah satu prodinya masuk QS 100 by subject"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P32",
//       "program": "Peningkatan jumlah pengabdian masyarakat kolaborasi bersama mitra perguruan tinggi luar negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P33",
//       "program": "Peningkatan jumlah pengabdian masyarakat kolaborasi bersama mitra industri/instansi luar negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P34",
//       "program": "Peningkatan jumlah pengabdian masyarakat kolaborasi bersama mitra perguruan tinggi dalam negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P35",
//       "program": "Peningkatan jumlah pengabdian masyarakat kolaborasi bersama mitra industri/instansi dalam negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P36",
//       "program": "Peningkatan jumlah dosen yang mengajar di perguruan tinggi luar negeri yang salah satu prodinya masuk QS 100 by subject"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P37",
//       "program": "Peningkatan jumlah dosen yang membimbing thesis atau disertasi di perguruan tinggi luar negeri yang salah satu prodinya masuk QS 100 by subject"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P38",
//       "program": "Peningkatan jumlah dosen yang menguji thesis atau disertasi di perguruan tinggi luar negeri yang salah satu prodinya masuk QS 100 by subject"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P39",
//       "program": "Peningkatan jumlah dosen yang mengajar/membimbing thesis atau disertasi/menguji thesis atau disertasi di mitra perguruan tinggi luar negeri"
//     },
//     {
//       "kode_ik": "IK08",
//       "kode_p": "P40",
//       "program": "Peningkatan jumlah dosen yang mengajar/membimbing thesis atau disertasi/menguji thesis atau disertasi di mitra perguruan tinggi dalam negeri"
//     },
//     {
//       "kode_ik": "IK09",
//       "kode_p": "P41",
//       "program": "Peningkatan jumlah dosen yang menjadi praktisi di mitra industri yang masuk dalam FORBES 2000"
//     },
//     {
//       "kode_ik": "IK09",
//       "kode_p": "P42",
//       "program": "Peningkatan jumlah dosen yang menjadi praktisi di mitra industri internasional"
//     },
//     {
//       "kode_ik": "IK09",
//       "kode_p": "P43",
//       "program": "Peningkatan jumlah dosen yang menjadi praktisi di mitra industri nasional"
//     },
//     {
//       "kode_ik": "IK10",
//       "kode_p": "P44",
//       "program": "Peningkatan jumlah dosen yang mendampingi mahasiswa melakukan kegiatan pembelajaran di luar program studi"
//     },
//     {
//       "kode_ik": "IK10",
//       "kode_p": "P45",
//       "program": "Peningkatan jumlah dosen yang membimbing mahasiswa berkompetisi yang berprestasi dalam kompetisi atau lomba pada peringkat juara I sampai dengan juara III pada kompetisi"
//     },
//     {
//       "kode_ik": "IK10",
//       "kode_p": "P46",
//       "program": "Peningkatan jumlah dosen yang mendampingi mahasiswa mengembangkan produk yang digunakan dunia usaha, industri dan masyarakat"
//     },
//     {
//       "kode_ik": "IK10",
//       "kode_p": "P47",
//       "program": "Peningkatan jumlah dosen yang membimbing mahasiswa untuk sertifikasi kompetensi internasional"
//     },
//     {
//       "kode_ik": "IK11",
//       "kode_p": "P48",
//       "program": "Peningkatan jumlah dosen bergelar S3 alumni perguruan tinggi luar negeri QS 100 by subject"
//     },
//     {
//       "kode_ik": "IK11",
//       "kode_p": "P49",
//       "program": "Peningkatan jumlah dosen bergelar S3 alumni perguruan tinggi luar negeri"
//     },
//     {
//       "kode_ik": "IK11",
//       "kode_p": "P50",
//       "program": "Peningkatan jumlah dosen bergelar S3 alumni perguruan tinggi dalam negeri"
//     },
//     {
//       "kode_ik": "IK12",
//       "kode_p": "P51",
//       "program": "Peningkatan jumlah sertifikat kompetensi dosen dari lembaga luar negeri"
//     },
//     {
//       "kode_ik": "IK12",
//       "kode_p": "P52",
//       "program": "Peningkatan jumlah sertifikat kompetensi dosen dari dalam negeri"
//     },
//     {
//       "kode_ik": "IK13",
//       "kode_p": "P53",
//       "program": "Peningkatan jumlah dosen dari perusahaan FORBES 2000"
//     },
//     {
//       "kode_ik": "IK13",
//       "kode_p": "P54",
//       "program": "Peningkatan jumlah dosen dari perusahaan/instansi internasional"
//     },
//     {
//       "kode_ik": "IK13",
//       "kode_p": "P55",
//       "program": "Peningkatan jumlah dosen dari perusahaan/instansi nasional"
//     },
//     {
//       "kode_ik": "IK13",
//       "kode_p": "P56",
//       "program": "Peningkatan jumlah dosen berasal dari alumni berpengaruh"
//     },
//     {
//       "kode_ik": "IK14",
//       "kode_p": "P57",
//       "program": "Peningkatan jumlah guru besar"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P58",
//       "program": "Peningkatan jumlah publikasi pada jurnal bereputasi nasional dan internasional"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P59",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Web of Science berfaktor dampak"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P60",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Scopus Kategori Q1"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P61",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Scopus Kategori Q2"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P62",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Scopus Kategori Q3"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P63",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Scopus Kategori Q4"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P64",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Scopus yang belum memiliki quartil"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P65",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada prosiding terindeks Scopus"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P66",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Sinta 1-2"
//     },
//     {
//       "kode_ik": "IK15",
//       "kode_p": "P67",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat setiap tahunnya pada jurnal terindeks Sinta 3-6"
//     },
//     {
//       "kode_ik": "IK16",
//       "kode_p": "P68",
//       "program": "Peningkatan jumlah total Sitasi per dosen"
//     },
//     {
//       "kode_ik": "IK16",
//       "kode_p": "P69",
//       "program": "Peningkatan jumlah total sitasi artikel ilmiah yang dipublikasikan pada jurnal terindeks Web of Science ber-impact factor"
//     },
//     {
//       "kode_ik": "IK16",
//       "kode_p": "P70",
//       "program": "Peningkatan jumlah total sitasi artikel ilmiah yang dipublikasikan pada jurnal terindeks Scopus"
//     },
//     {
//       "kode_ik": "IK16",
//       "kode_p": "P71",
//       "program": "Peningkatan jumlah total sitasi artikel ilmiah yang dipublikasikan pada jurnal terakreditas Sinta"
//     },
//     {
//       "kode_ik": "IK17",
//       "kode_p": "P72",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk buku oleh tenaga pendidik/kependidikan UNS"
//     },
//     {
//       "kode_ik": "IK17",
//       "kode_p": "P73",
//       "program": "Peningkatan jumlah buku/book chapter tingkat internasional terindeks Scopus"
//     },
//     {
//       "kode_ik": "IK17",
//       "kode_p": "P74",
//       "program": "Peningkatan jumlah buku/book chapter tingkat internasional tidak terindeks Scopus"
//     },
//     {
//       "kode_ik": "IK18",
//       "kode_p": "P76",
//       "program": "Peningkatan jumlah jurnal terbitan UNS yang terindeks lembaga bereputasi nasional dan global (SCOPUS, Web of Science, Microsoft Academic Research, DOAJ, CABI, Copernicus, Ebscho)"
//     },
//     {
//       "kode_ik": "IK18",
//       "kode_p": "P77",
//       "program": "Peningkatan jumlah jurnal terbitan UNS yang terindeks Scopus dari jurnal terkadreditasi SINTA"
//     },
//     {
//       "kode_ik": "IK18",
//       "kode_p": "P78",
//       "program": "Peningkatan jumlah jurnal terbitan UNS yang terindeks WOS dari jurnal terkadreditasi SINTA"
//     },
//     {
//       "kode_ik": "IK18",
//       "kode_p": "P79",
//       "program": "Peningkatan jumlah jurnal terbitan UNS yang terakdreditasi SINTA 1-2 dari jurnal terkadreditasi SINTA 3-6"
//     },
//     {
//       "kode_ik": "IK18",
//       "kode_p": "P80",
//       "program": "Peningkatan jumlah jurnal terbitan UNS yang terakdreditasi SINTA 3-4 dari jurnal terkadreditasi SINTA 5-6"
//     },
//     {
//       "kode_ik": "IK18",
//       "kode_p": "P81",
//       "program": "Peningkatan jumlah jurnal terbitan UNS yang terakdreditasi SINTA 5-6 dari jurnal tidak terakreditasi"
//     },
//     {
//       "kode_ik": "IK19",
//       "kode_p": "P82",
//       "program": "Peningkatan jumlah tulisan staff UNS pada media cetak maupun daring luar negeri yang bereputasi menerbitkan artikel ilmiah populer dan memiliki proses editorial"
//     },
//     {
//       "kode_ik": "IK19",
//       "kode_p": "P83",
//       "program": "Peningkatan jumlah publikasi artikel ilmiah populer oleh penulis berafiliasi UNS pada media tingkat nasional yang terdaftar di Dewan Pers Indonesia"
//     },
//     {
//       "kode_ik": "IK19",
//       "kode_p": "P84",
//       "program": "Peningkatan publikasi kegiatan civitas akademika UNS dalam bentuk berita pada media tingkat nasional yang terdaftar di Dewan Pers Indonesia"
//     },
//     {
//       "kode_ik": "IK19",
//       "kode_p": "P85",
//       "program": "Peningkatan jumlah publikasi artikel ilmiah populer oleh penulis berafiliasi UNS pada media tingkat internasional"
//     },
//     {
//       "kode_ik": "IK19",
//       "kode_p": "P86",
//       "program": "Peningkatan jumlah publikasi kegiatan civitas akademika UNS dalam bentuk berita pada media tingkat internasional"
//     },
//     {
//       "kode_ik": "IK20",
//       "kode_p": "P88",
//       "program": "Peningkatan jumlah konferensi nasional yang dilaksanakan di universitas pada tahun berjalan yang menghasilkan publikasi di jurnal nasional Sinta atau prosiding ber-ISSN"
//     },
//     {
//       "kode_ik": "IK20",
//       "kode_p": "P89",
//       "program": "Peningkatan jumlah konferensi internasional yang dilaksanakan di universitas pada tahun berjalan yang menghasilkan publikasi prosiding terindeks Scopus"
//     },
//     {
//       "kode_ik": "IK20",
//       "kode_p": "P90",
//       "program": "Peningkatan jumlah konferensi internasional yang menghasilkan publikasi artikel pada jurnal special issue terindeks Scopus"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P91",
//       "program": "Peningkatan jumlah produk inovasi yang dihasilkan"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P92",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk paten"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P93",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk paten sederhana"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P94",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk merek"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P95",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk desain industri"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P96",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk desain tata letak sirkuit terpadu"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P97",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk rahasia dagang"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P98",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk varietas tanaman"
//     },
//     {
//       "kode_ik": "IK21",
//       "kode_p": "P99",
//       "program": "Peningkatan jumlah luaran penelitian dan pengabdian masyarakat dalam bentuk hak cipta"
//     },
//     {
//       "kode_ik": "IK22",
//       "kode_p": "P100",
//       "program": "Peningkatan jumlah akademisi internasional yang menjadi peer list UNS dalam pemeringkatan QS WUR"
//     },
//     {
//       "kode_ik": "IK23",
//       "kode_p": "P101",
//       "program": "Peningkatan kualitas proposal penelitian tingkat nasional"
//     },
//     {
//       "kode_ik": "IK23",
//       "kode_p": "P102",
//       "program": "Peningkatan kualitas proposal penelitian tingkat internasional"
//     },
//     {
//       "kode_ik": "IK23",
//       "kode_p": "P103",
//       "program": "Peningkatan kualitas proposal pengabdian masyarakat tingkat nasional"
//     },
//     {
//       "kode_ik": "IK23",
//       "kode_p": "P104",
//       "program": "Peningkatan kualitas proposal pengabdian masyarakat tingkat internasional"
//     },
//     {
//       "kode_ik": "IK24",
//       "kode_p": "P105",
//       "program": "Peningkatan jumlah pemasukan dari biaya pendidikan"
//     },
//     {
//       "kode_ik": "IK24",
//       "kode_p": "P106",
//       "program": "Peningkatan jumlah pemasukan dari dana hibah"
//     },
//     {
//       "kode_ik": "IK24",
//       "kode_p": "P107",
//       "program": "Peningkatan jumlah pemasukan dari sponsorship kegiatan"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P108",
//       "program": "Peningkatan jumlah usulan hibah riset dari kemendikbudristek"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P109",
//       "program": "Peningkatan jumlah pemasukan hibah riset dari kemendikbudristek"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P110",
//       "program": "Peningkatan jumlah usulan hibah riset nasional non Kemendikbudristek"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P111",
//       "program": "Peningkatan jumlah pemasukan hibah riset nasional non Kemendikbudristek"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P112",
//       "program": "Peningkatan jumlah usulan hibah riset dari luar negeri"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P113",
//       "program": "Peningkatan jumlah pemasukan hibah riset dari luar negeri"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P114",
//       "program": "Peningkatan jumlah usulan hibah riset dari lembaga lain luar universitas"
//     },
//     {
//       "kode_ik": "IK25",
//       "kode_p": "P115",
//       "program": "Peningkatan jumlah pemasukan hibah riset dari lembaga lain luar universitas"
//     },
//     {
//       "kode_ik": "IK26",
//       "kode_p": "P116",
//       "program": "Peningkatan jumlah pemasukan dari kerjasama industri"
//     },
//     {
//       "kode_ik": "IK27",
//       "kode_p": "P117",
//       "program": "Pengembangan unit usaha"
//     },
//     {
//       "kode_ik": "IK27",
//       "kode_p": "P118",
//       "program": "Pengembangan unit usaha di tingkat universitas"
//     },
//     {
//       "kode_ik": "IK27",
//       "kode_p": "P119",
//       "program": "Pengembangan unit usaha di tingkat unit kerja"
//     },
//     {
//       "kode_ik": "IK28",
//       "kode_p": "P120",
//       "program": "Peningkatan jumlah dana abadi setiap tahun"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P121",
//       "program": "Peningkatan jumlah proposal penelitian hibah internasional yang diajukan oleh program studi"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P122",
//       "program": "Peningkatan jumlah mata kuliah team teaching dengan mitra luar negeri"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P123",
//       "program": "Peningkatan jumlah kurikulum bersama antara prodi dengan mitra luar negeri"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P124",
//       "program": "Peningkatan jumlah pembelajaran dengan dosen tamu dari institusi berkelas dunia"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P125",
//       "program": "Peningkatan jumlah program studi yang bekerjasama dengan mitra QS100 (WUR dan by subject)"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P126",
//       "program": "Peningkatan Indeks kepuasan mitra terhadap kerjasama yang dilakukan"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P127",
//       "program": "Peningkatan jumlah pengabdian masyarakat internasional"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P128",
//       "program": "Peningkatan jumlah program Studi Bekerjasama dengan perusahaan nasional berstandar tinggi yang memenuhi kriteria IKU DIKTI"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P129",
//       "program": "Peningkatan jumlah program Studi Bekerjasama dengan Perusahaan teknologi global yang memenuhi kriteria IKU DIKTI"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P130",
//       "program": "Peningkatan jumlah program Studi Bekerjasama dengan Organisasi nirlaba kelas dunia yang memenuhi kriteria IKU DIKTI"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P131",
//       "program": "Peningkatan jumlah kerjasama dengan perusahaan di dalam maupun luar negeri, nasional maupun multi-nasional yang memenuhi kriteria IKU DIKTI"
//     },
//     {
//       "kode_ik": "IK29",
//       "kode_p": "P132",
//       "program": "Peningkatan jumlah kerjasama dengan organisasi nirlaba dalam maupun luar negeri atau organisasi multilateral yang telah mempunyai izin pendirian dan diakui oleh Pemerintah Indonesia sesuai dengan kriteria IKU"
//     },
//     {
//       "kode_ik": "IK30",
//       "kode_p": "P133",
//       "program": "Peningkatan jumlah kerjasama dengan perusahaan di dalam maupun luar negeri, nasional maupun multi-nasional"
//     },
//     {
//       "kode_ik": "IK30",
//       "kode_p": "P134",
//       "program": "Peningkatan jumlah program Studi Bekerjasama dengan Rumah sakit yang memiliki Izin Rumah Sakit Kelas A dan B yang diberikan oleh Kementerian Kesehatan yang memenuhi kriteria IKU DIKTI"
//     },
//     {
//       "kode_ik": "IK30",
//       "kode_p": "P135",
//       "program": "Peningkatan jumlah kerjasama dengan individu, Komunitas akademik, Komunitas profesional dalam maupun luar negeri"
//     },
//     {
//       "kode_ik": "IK30",
//       "kode_p": "P136",
//       "program": "Pemeliharaan kerjasama luar negeri"
//     },
//     {
//       "kode_ik": "IK31",
//       "kode_p": "P137",
//       "program": "Diseminasi kegiatan prodi pada website mitra luar negeri"
//     },
//     {
//       "kode_ik": "IK31",
//       "kode_p": "P138",
//       "program": "Peningkatan jumlah pengunjung online website perpustakaan atau ruang baca fakultas dalam tahun berjalan"
//     },
//     {
//       "kode_ik": "IK31",
//       "kode_p": "P139",
//       "program": "Peningkatan jumlah konten website yang telah update dan berbahasa inggris"
//     },
//     {
//       "kode_ik": "IK32",
//       "kode_p": "P140",
//       "program": "Peningkatan kualitas input mahasiswa"
//     },
//     {
//       "kode_ik": "IK33",
//       "kode_p": "P141",
//       "program": "Peningkatan jumlah buku/modul berbasis kasus riil yang ditulis bersama mitra industri"
//     },
//     {
//       "kode_ik": "IK34",
//       "kode_p": "P142",
//       "program": "Pengembangan teaching industry di setiap unit"
//     },
//     {
//       "kode_ik": "IK35",
//       "kode_p": "P143",
//       "program": "Peningkatan jumlah mata kuliah yang menggunakan metode pemecahan kasus"
//     },
//     {
//       "kode_ik": "IK36",
//       "kode_p": "P144",
//       "program": "Peningkatan jumlah mata kuliah yang menggunakan metode project based learning"
//     },
//     {
//       "kode_ik": "IK37",
//       "kode_p": "P145",
//       "program": "Peningkatan jumlah mata kuliah yang menggunakan metode MOOC"
//     },
//     {
//       "kode_ik": "IK38",
//       "kode_p": "P146",
//       "program": "Peningkatan sarana dan prasarana laboratorium"
//     },
//     {
//       "kode_ik": "IK39",
//       "kode_p": "P147",
//       "program": "Peningkatan fasilitas berbasis ICT"
//     },
//     {
//       "kode_ik": "IK40",
//       "kode_p": "P148",
//       "program": "Peningkatan kualitas program studi berstandar internasional"
//     },
//     {
//       "kode_ik": "IK41",
//       "kode_p": "P149",
//       "program": "Peningkatan kualitas program studi sesuai standar unggul nasional dan peningkatan Jumlah prodi yang melakukan reakreditasi dari \'A\' ke \'Unggul\' pada tahun berjalan oleh BAN PT (A ke Unggul)"
//     },
//     {
//       "kode_ik": "IK41",
//       "kode_p": "P150",
//       "program": "Peningkatan kualitas program studi dan peningkatan jumlah prodi yang terakreditasi \'A\' (baru) pada tahun berjalan oleh BAN PT (B ke A)"
//     },
//     {
//       "kode_ik": "IK41",
//       "kode_p": "P151",
//       "program": "Peningkatan kualitas program studi dan peningkatan jumlah prodi baru yang akan diakreditasikan pada tahun berjalan oleh BAN-PT (Belum terakreditasi/ C ke B)"
//     },
//     {
//       "kode_ik": "IK41",
//       "kode_p": "P152",
//       "program": "Peningkatan kualitas program studi sesuai standar unggul nasional dan peningkatan Jumlah prodi yang melakukan reakreditasi dari \'A\' ke \'Unggul\' pada tahun berjalan oleh LAM PT (A ke Unggul)"
//     },
//     {
//       "kode_ik": "IK41",
//       "kode_p": "P153",
//       "program": "Peningkatan kualitas program studi dan peningkatan jumlah prodi yang terakreditasi \'A\' (baru) pada tahun berjalan oleh LAM PT (B ke A)"
//     },
//     {
//       "kode_ik": "IK41",
//       "kode_p": "P154",
//       "program": "Peningkatan kualitas program studi dan peningkatan jumlah prodi baru yang akan diakreditasikan pada tahun berjalan oleh LAM-PT (Belum terakreditasi/ C ke B)"
//     },
//     {
//       "kode_ik": "IK42",
//       "kode_p": "P155",
//       "program": "Rekruitmen dosen"
//     },
//     {
//       "kode_ik": "IK43",
//       "kode_p": "P156",
//       "program": "Peningkatan jumlah mahasiswa doktor"
//     },
//     {
//       "kode_ik": "IK44",
//       "kode_p": "P157",
//       "program": "Peningkatan kualitas mahasiswa program doktor"
//     },
//     {
//       "kode_ik": "IK45",
//       "kode_p": "P158",
//       "program": "Peningkatan jumlah mahasiswa asing baru"
//     },
//     {
//       "kode_ik": "IK45",
//       "kode_p": "P159",
//       "program": "Peningkatan jumlah international summer courses"
//     },
//     {
//       "kode_ik": "IK45",
//       "kode_p": "P160",
//       "program": "Peningkatan jumlah kelas online yang ditawarkan dalam platform global"
//     },
//     {
//       "kode_ik": "IK46",
//       "kode_p": "P161",
//       "program": "Peningkatan jumlah dosen berkewarganegaraan asing"
//     },
//     {
//       "kode_ik": "IK46",
//       "kode_p": "P162",
//       "program": "Peningkatan jumlah dosen dari institusi luar negeri yang berkegiatan pengajaran/ penelitian/ pengabdian di UNS"
//     },
//     {
//       "kode_ik": "IK47",
//       "kode_p": "P163",
//       "program": "Pengembangan double/joint degree program/kelas internasional diploma"
//     },
//     {
//       "kode_ik": "IK47",
//       "kode_p": "P164",
//       "program": "Pengembangan double/joint degree/kelas internasional program sarjana"
//     },
//     {
//       "kode_ik": "IK47",
//       "kode_p": "P165",
//       "program": "Pengembangan double/joint degree/kelas internasional program pascasarjana (S2/S3)"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P166",
//       "program": "Peningkatan jumlah kebijakan terkait 16 SDG"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P167",
//       "program": "Peningkatan website yang memuat kebijakan UNS terkait 16 SDG"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P168",
//       "program": "Peningkatan jumlah publikasi internasional bereputasi bertema salah satu dari 16 SDG"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P169",
//       "program": "Peningkatan jumlah publikasi di jurnal terindeks Sinta bertema salah satu dari 16 SDG"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P170",
//       "program": "Peningkatan jumlah pengabdian masyarakat bertema salah satu dari 16 SDG"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P171",
//       "program": "Peningkatan kolaborasi bersama petani dan UMKM"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P172",
//       "program": "Peningkatan jumlah Stasiun Pengisian Kendaraan Listrik Umum (SPKLU) di UNS"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P173",
//       "program": "Peningkatan jumlah mobil dinas listrik"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P174",
//       "program": "Peningkatan jumlah mobil dan motor listrik mahasiswa dan dosen"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P175",
//       "program": "Penurunan emisi karbon"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P176",
//       "program": "Penghematan penggunaan listrik"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P177",
//       "program": "Penghematan penggunaan air"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P178",
//       "program": "Peningkatan jumlah barang yang dapat didaur ulang"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P179",
//       "program": "Peningkatan jumlah fasilitas kesehatan umum, kesehatan mental, kesehatan reproduksi"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P180",
//       "program": "Peningkatan jumlah alumni yang bekerja di instansi pemerintahan dan NGO"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P181",
//       "program": "Peningkatan jumlah matakuliah yang bertema salah satu dari 16 SDG"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P182",
//       "program": "Peningkatan jumlah kebijakan terkait etik"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P183",
//       "program": "Peningkatan website yang memuat kebijakan UNS terkait etik"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P184",
//       "program": "Peningkatan jumlah dosen yang mengikuti organisasi sustainable group (u7, ISCN, HESI, IARU, International Universities Climate Alliance)"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P185",
//       "program": "Peningkatan program kepedulian sosial dan lingkungan UNS"
//     },
//     {
//       "kode_ik": "IK48",
//       "kode_p": "P186",
//       "program": "Peningkatan jumlah unit, staff, UKM yang mengurusi satu dari 16 SDG"
//     },
//     {
//       "kode_ik": "IK49",
//       "kode_p": "P187",
//       "program": "Peningkatan jumlah unit kerja yang mempunyai tim untuk melakukan pembangunan Zona Integritas, dokumen rencana kerja pembangunan Zona Integritas menuju WBK/WBBM dan media untuk mensosialisasikan pembangunan WBK/WBBM"
//     },
//     {
//       "kode_ik": "IK50",
//       "kode_p": "P188",
//       "program": "Jumlah unit kerja yang telah memiliki SOP lengkap, Sistem Pemerintahan Berbasis Elektronik (SPBE), kebijakan tentang keterbukaan informasi publik"
//     },
//     {
//       "kode_ik": "IK51",
//       "kode_p": "P189",
//       "program": "Peningkatan kualitas analisis jabatan dan training need analysis"
//     },
//     {
//       "kode_ik": "IK52",
//       "kode_p": "P190",
//       "program": "Peningkatan kualitas dokumen perencanaan dan laporan kinerja"
//     },
//     {
//       "kode_ik": "IK52",
//       "kode_p": "P191",
//       "program": "Peningkatan kualitas dokumen perencanaan"
//     },
//     {
//       "kode_ik": "IK52",
//       "kode_p": "P192",
//       "program": "Peningkatan kualitas dokumen laporan kinerja"
//     },
//     {
//       "kode_ik": "IK52",
//       "kode_p": "P193",
//       "program": "Peningkatan Evaluasi Akuntabilitas Kinerja Internal"
//     },
//     {
//       "kode_ik": "IK53",
//       "kode_p": "P194",
//       "program": "Peningkatan jumlah unit kerja yang telah melakukan pengendalian gratifikasi, whistle blowing system, penanganan benturan kepentingan dan sistem pengaduan masyarakat"
//     },
//     {
//       "kode_ik": "IK54",
//       "kode_p": "P195",
//       "program": "Peningkatan Jumlah unit kerja yang telah standar pelayanan dan telah dimaklumatkan, mempunyai pengelola pengaduan dan konsultasi layanan dan mempunyai laporan survei kepuasan layanan"
//     },
//     {
//       "kode_ik": "IK55",
//       "kode_p": "P196",
//       "program": "Peningkatan Kualitas Tata Kelola Perencanaan dan Keuangan"
//     },
//     {
//       "kode_ik": "IK56",
//       "kode_p": "P197",
//       "program": "Peningkatan Kesejahteraan Pegawai"
//     },
//     {
//       "kode_ik": "IK57",
//       "kode_p": "P198",
//       "program": "Peningkatan Efektivitas Manajemen Operasional Lembaga"
//     },
//     {
//       "kode_ik": "IK57",
//       "kode_p": "P199",
//       "program": "Peningkatan Kualitas Tata Kelola Aset"
//     }
//   ]
// }';
//     foreach(json_decode($json, true)['distinct_data'] as $val){
//         $ik=IkModel::where("kode_ik", $val['kode_ik'])->first();
//         PModel::create([
//             'ik_id'    =>$ik['id'],
//             'kode_p'   =>$val['kode_p'],
//             'deskripsi_p'=>$val['program']
//         ]);
//     }
// });


Route::get('/', function () {
    return view('landing');
})->name('landing');

//AUTH ROUTE
Route::middleware(['guest'])->group(function () {
    Route::get("/sso", [AuthController::class, 'sso'])->name('auth.sso');
    Route::get("/sso/login", [AuthController::class, 'login'])->name('auth.sso_login');
    Route::get("/cosco/login", [AuthController::class, 'login'])->name('auth.cosco_login');
    Route::get("/cosco/sso", [AuthController::class, 'sso'])->name('auth.cosco_sso');
    Route::match(['get', 'post'], "/sso/authorize", [AuthController::class, 'oauth_authorize'])->name('auth.sso_authorize');
    Route::get("/oauth/authorize", [AuthController::class, 'oauth_authorize'])->name('auth.oauth_authorize');
    Route::post("/oauth/authorize", [AuthController::class, 'oauth_authorize_submit'])->name('auth.oauth_authorize_submit');
    Route::get("/sso/callback", [AuthController::class, 'sso_callback'])->name('auth.sso_callback');
    Route::get("/sso/expired", [AuthController::class, 'sso_expired'])->name('auth.sso_expired');
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::middleware(["throttle:100,1"])->post('/login_userpass', [AuthController::class, 'login_userpass'])->name("login_userpass");
    Route::middleware(["throttle:100,1"])->post('/login', [AuthController::class, 'login_auth'])->name("login.submit");
});

Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

Route::prefix("/data")->group(function(){
    Route::get('/maks', [DataController::class, 'mak']);
    Route::get('/satuans', [DataController::class, 'satuan']);
});

//DASHBOARD ROUTE
Route::middleware(["auth"])->prefix("/dashboard")->group(base_path('routes/dashboard.php'));

//API ROUTE
Route::middleware(["auth", "api", "check_user_status"])->prefix("/api")->group(base_path('routes/api.php'));

// SERVE STORAGE & DOCUMENTS DIRECTLY (Mencegah 404 Nginx pada semua berkas PDF / Upload)
Route::get('/dashboard/files/view/{filename}', [\App\Http\Controllers\Api\FileController::class, 'view_file'])->where('filename', '.*');
Route::get('/files/view/{filename}', [\App\Http\Controllers\Api\FileController::class, 'view_file'])->where('filename', '.*');
Route::get('/storage/{filename}', [\App\Http\Controllers\Api\FileController::class, 'view_file'])->where('filename', '.*');

// SERVE EXCEL TEMPLATE DIRECTLY
Route::get('/templates/Format_SPJ_Hibah.xlsx', [\App\Http\Controllers\DashboardController::class, 'spj_template']);
