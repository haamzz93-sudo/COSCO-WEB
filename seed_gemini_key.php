<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PengaturanModel;

echo "Menyiapkan sinkronisasi template WhatsApp resmi Cosco UNS Madiun...\n";

$waTemplatesResmi = [
    // -------------------------------------------------------------
    // 1. INSIASI & PENUGASAN PIC
    // -------------------------------------------------------------
    'assign_pic' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nDiberitahukan bahwa Anda telah ditugaskan sebagai PIC Pelaksana Kegiatan:\n*{DETAIL_KEGIATAN}*\n\nMohon segera menyusun dan mengajukan rincian usulan Term of Reference (TOR) & RAB melalui Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas dedikasi dan kerja samanya.",
    
    'remind_pic_tor' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPengingat ({DAY}): Usulan TOR & RAB untuk kegiatan *{DETAIL_KEGIATAN}* saat ini masih berstatus Draf dan belum diajukan.\nMohon segera melengkapi rincian belanja dan mengajukan dokumen melalui Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian Bapak/Ibu.",

    // -------------------------------------------------------------
    // 2. TAHAP 1 KOORDINATOR KAMPUS MADIUN
    // -------------------------------------------------------------
    'submit_tor_koordinator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Bapak/Ibu Koordinator Kampus Madiun*\n\nPIC *{PIC_KEGIATAN}* telah mengajukan dokumen usulan TOR & RAB untuk kegiatan:\n*{DETAIL_KEGIATAN}*\n\nMohon berkenan untuk meninjau dan melakukan validasi usulan tersebut melalui Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.",
    
    'approve_tor_koordinator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah DISETUJUI oleh Koordinator Kampus Madiun ({KOORDINATOR}).\nSaat ini usulan telah diteruskan langsung ke Wakil Dekan untuk proses telaah dan pengesahan pimpinan.\n\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja sama Bapak/Ibu.",
    
    'revisi_tor_koordinator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* memerlukan REVISI dari Koordinator Kampus Madiun ({KOORDINATOR}).\nCatatan Revisi: {CATATAN_REVISI}\n\nMohon segera memeriksa dan memperbarui usulan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan kerja sama Bapak/Ibu.",

    // -------------------------------------------------------------
    // 3. TAHAP 2 WAKIL DEKAN SV UNS (PENGESAHAN AKHIR TOR)
    // -------------------------------------------------------------
    'submit_tor_wd' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{WAKIL_DEKAN}*\n\nDiberitahukan bahwa usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* oleh *{PIC_KEGIATAN}* telah disetujui Koordinator dan saat ini menunggu telaah serta pengesahan Bapak/Ibu Wakil Dekan.\n\nTautan verifikasi:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.",
    
    'approve_tor_wd' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nSelamat, usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah DISETUJUI & DIESAHKAN oleh Wakil Dekan ({WAKIL_DEKAN}).\nTahap pengesahan TOR telah tuntas. Anda dapat melanjutkan ke proses pengajuan Memo Cair saat kegiatan siap dilaksanakan.\n\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas dedikasi dan kerja sama Bapak/Ibu.",
    
    'revisi_tor_wd' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* memerlukan REVISI dari Wakil Dekan ({WAKIL_DEKAN}).\nCatatan Revisi: {CATATAN_REVISI}\n\nMohon segera memeriksa dan menyelesaikan perbaikan usulan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan kerja sama Bapak/Ibu.",

    // -------------------------------------------------------------
    // 4. PENGAJUAN & VERIFIKASI MEMO CAIR (KEUANGAN / SUB KOR)
    // -------------------------------------------------------------
    'remind_memo_cair' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPengingat: TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah disahkan. Apabila kegiatan akan segera dilaksanakan, silakan mengajukan permohonan Memo Cair melalui Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",
    
    'submit_memo_cair' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Sub Koordinator Non-Akademik / Perencanaan*\n\nPIC *{PIC_KEGIATAN}* telah mengajukan permohonan Memo Cair untuk kegiatan:\n*{DETAIL_KEGIATAN}*\nPagu Anggaran: Rp {NOMINAL}\n\nMohon untuk meninjau dan memproses verifikasi pencairan dana di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja samanya.",
    
    'approve_memo_cair_keuangan' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Pengajuan Memo Cair kegiatan *{DETAIL_KEGIATAN}* telah DISETUJUI oleh Sub Koordinator Non-Akademik / Keuangan.\nSaat ini berkas telah diteruskan ke Bendahara Pengeluaran untuk proses transfer dana.\n\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",
    
    'reject_memo_cair_keuangan' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Pengajuan Memo Cair kegiatan *{DETAIL_KEGIATAN}* memerlukan REVISI / PERBAIKAN dari Sub Koordinator Non-Akademik.\nCatatan: {CATATAN_REVISI}\n\nMohon untuk memeriksa dan melengkapi kembali berkas ajuan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    // -------------------------------------------------------------
    // 5. PELAPORAN & AUDIT VERIFIKASI SPJ
    // -------------------------------------------------------------
    'remind_lapor_spj' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPengingat Pelaporan SPJ: Kegiatan *{DETAIL_KEGIATAN}* yang telah dicairkan dananya saat ini belum mengunggah laporan pertanggungjawaban (SPJ).\nMohon untuk segera mengunggah bukti pengeluaran, nota/faktur, dan kuitansi resmi di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja sama Bapak/Ibu.",
    
    'submit_spj_verifikator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Verifikator SPJ*\n\nPIC *{PIC_KEGIATAN}* telah mengunggah dan mengajukan berkas pertanggungjawaban (SPJ) beserta bukti transaksi untuk kegiatan:\n*{DETAIL_KEGIATAN}*\n\nMohon berkenan untuk melakukan audit dan verifikasi kelayakan bukti SPJ di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja samanya.",
    
    'approve_spj_valid' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Laporan pertanggungjawaban (SPJ) kegiatan *{DETAIL_KEGIATAN}* telah DIVERIFIKASI & DINYATAKAN VALID oleh Verifikator SPJ.\nSeluruh kewajiban pelaporan administrasi keuangan untuk kegiatan ini telah selesai tuntas.\n\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas integritas dan ketertiban administrasi Bapak/Ibu.",
    
    'revisi_spj_verifikator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Berkas laporan pertanggungjawaban (SPJ) kegiatan *{DETAIL_KEGIATAN}* memerlukan REVISI / KELENGKAPAN BUKTI dari Verifikator SPJ.\nCatatan: {CATATAN_REVISI}\n\nMohon segera melengkapi bukti transaksi yang diperlukan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan kerja sama Bapak/Ibu.",

    // -------------------------------------------------------------
    // 6. EKSEKUSI PEMBAYARAN BENDAHARA
    // -------------------------------------------------------------
    'bayar_memo_cair_bendahara' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Bendahara Pengeluaran*\n\nInstruksi Pencairan Dana ({JENIS_TRANSFER}):\nKegiatan: *{DETAIL_KEGIATAN}*\nPIC: *{PIC_KEGIATAN}*\nNominal: Rp {NOMINAL}\nRekening Tujuan: {INFO_REKENING}\n\nBerkas telah disetujui lengkap. Mohon segera melakukan proses transfer dana dan mengunggah bukti bayar di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",
    
    'remind_bayar_bendahara' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Bendahara Pengeluaran*\n\nPengingat: Terdapat pengajuan dana kegiatan yang telah disetujui dan saat ini menunggu proses transfer dari Bendahara:\n\n{DAFTAR_KEGIATAN}\n\nMohon segera memproses transfer ke rekening PIC masing-masing dan memperbarui status pembayaran di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'notify_dana_cair_pic' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Dana kegiatan *{DETAIL_KEGIATAN}* ({JENIS_TRANSFER}) sebesar Rp {NOMINAL} telah DITRANSFER / DILUNASI oleh Bendahara ke rekening terdaftar Anda.\nMohon segera memeriksa mutasi rekening dan mempersiapkan kelengkapan bukti transaksi untuk pelaporan SPJ.\n\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    // -------------------------------------------------------------
    // 7. PENGINGAT JADWAL PIMPINAN (SCHEDULER)
    // -------------------------------------------------------------
    'remind_koordinator_tor' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Bapak/Ibu Koordinator Kampus Madiun*\n\nMohon izin mengingatkan, terdapat pengajuan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* yang saat ini sedang menunggu review dan persetujuan dari Bapak/Ibu Koordinator.\n\nTautan verifikasi:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.",
    
    'remind_wd_tor' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Bapak/Ibu Wakil Dekan*\n\nMohon izin mengingatkan, terdapat pengajuan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* yang telah disetujui Koordinator dan saat ini menunggu pengesahan dari Bapak/Ibu Wakil Dekan.\n\nTautan verifikasi:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.",
    
    'remind_keuangan_memo_cair' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Sub Koordinator Non-Akademik / Perencanaan*\n\nMohon izin mengingatkan, permohonan Memo Cair untuk kegiatan *{DETAIL_KEGIATAN}* saat ini sedang menunggu proses validasi dari Tim Keuangan / Sub Koordinator Non-Akademik.\n\nTautan verifikasi:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja samanya.",

    // -------------------------------------------------------------
    // 8. ALUR BARU 7-TAHAPAN HPS (BHP & INVENTARIS)
    // -------------------------------------------------------------
    'hps_submit_pic' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Koordinator Kampus Madiun*\n\nUsulan HPS {KATEGORI} baru telah diajukan oleh *{PIC_KEGIATAN}*:\nKegiatan: *{DETAIL_KEGIATAN}*\nPagu Anggaran: Rp {NOMINAL}\n\nMohon untuk meninjau dan melakukan validasi kelayakan spesifikasi teknis dan rincian belanja melalui Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_approve_koordinator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Pejabat Pengadaan (PP)*\n\nUsulan HPS {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* (PIC: {PIC_KEGIATAN}, Pagu: Rp {NOMINAL}) telah DISETUJUI oleh Koordinator Kampus Madiun.\n\nBerkas saat ini dilimpahkan ke Pejabat Pengadaan untuk proses telaah HPS dan spesifikasi teknis pengadaan:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_revisi_koordinator' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nUsulan HPS {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* memerlukan REVISI dari Koordinator Kampus Madiun.\nCatatan Revisi: {CATATAN_REVISI}\n\nMohon segera melengkapi spesifikasi barang atau harga satuan yang diminta di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_approve_pp' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Wakil Dekan II*\n\nUsulan HPS {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* (PIC: {PIC_KEGIATAN}, Pagu: Rp {NOMINAL}) telah SELESAI DITELAAH & DISETUJUI oleh Pejabat Pengadaan.\n\nMohon berkenan untuk memberikan persetujuan dan pengesahan pimpinan melalui Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_revisi_pp' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nUsulan HPS {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* memerlukan REVISI dari Pejabat Pengadaan.\nCatatan Koreksi: {CATATAN_REVISI}\n\nMohon segera perbaiki spesifikasi dan harga perkiraan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_approve_wd' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Pejabat Pengadaan & PIC Kegiatan*\n\nKabar Baik: Pengadaan {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* sebesar Rp {NOMINAL} telah DISETUJUI & DISAHKAN oleh Wakil Dekan II.\n\nPejabat Pengadaan saat ini berwenang untuk melanjutkan ke Tahap Eksekusi Pemesanan / E-Purchasing:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja samanya.",

    'hps_revisi_wd' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Pejabat Pengadaan & PIC Kegiatan*\n\nPengadaan {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* mendapatkan CATATAN PERBAIKAN dari Wakil Dekan II.\nCatatan: {CATATAN_REVISI}\n\nMohon memeriksa rincian pengadaan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_proses_pengadaan' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Usulan {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* saat ini SEDANG DALAM PROSES PEMESANAN oleh Pejabat Pengadaan (PP) ke pihak penyedia/vendor.\n\nMohon mempersiapkan lokasi penerimaan dan koordinasi teknis kedatangan barang:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_upload_bast_pp' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *{PIC_KEGIATAN} & Tim Satpam / Sarpras*\n\nDokumen Berita Acara Serah Terima (BAST), Surat Pesanan, dan Faktur Belanja untuk kegiatan *{DETAIL_KEGIATAN}* telah BERHASIL DIUNGGAH oleh Pejabat Pengadaan.\n\nSilakan memeriksa kelengkapan dokumen pengadaan di Sistem Cosco:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih.",

    'hps_selesai_final' => "Cosco Super APPS - UNS Kampus Madiun\nKpd Yth. *Bapak/Ibu Pimpinan & PIC Pelaksana*\n\nPemberitahuan: Seluruh rangkaian proses pengadaan {KATEGORI} untuk kegiatan *{DETAIL_KEGIATAN}* (Pagu: Rp {NOMINAL}) telah SELESAI TUNTAS 100% dan terarsip resmi di sistem Cosco.\n\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja sama dan integritas seluruh tim."
];

$count = 0;
foreach ($waTemplatesResmi as $type => $content) {
    PengaturanModel::updateOrCreate(
        ['type' => $type],
        ['content' => $content]
    );
    $count++;
}

// Hapus atau kosongkan template alur lama yang sudah ditutup (Review TOR Perencanaan SV)
$obsoleteKeys = ['submit_tor_keuangan', 'approve_tor_keuangan', 'revisi_tor_keuangan'];
foreach ($obsoleteKeys as $oldKey) {
    PengaturanModel::where('type', $oldKey)->delete();
}

echo "Berhasil memperbarui {$count} template WhatsApp resmi UNS Madiun!\n";
echo "Alur lama Review TOR Perencanaan SV (submit_tor_keuangan, approve_tor_keuangan, revisi_tor_keuangan) telah ditutup dan dihapus.\n";
