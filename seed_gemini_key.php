<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PengaturanModel;

$key = env('GEMINI_API_KEY', '');

PengaturanModel::updateOrCreate(['type' => 'gemini_api_key'], ['content' => $key]);
PengaturanModel::updateOrCreate(['type' => 'GEMINI_API_KEY'], ['content' => $key]);

$waTemplates = [
    // 1. INSIASI & PENUGASAN PIC
    'assign_pic' => "Cosco Super APPS\nKpd Yth {nama_pic}\nAnda telah ditunjuk dan mendapatkan amanah dari Dekan Sekolah Vokasi UNS untuk menjalankan kegiatan {detail_kegiatan} yang bersumber dari dana hibah. untuk itu mohon segera mengajukan TOR RAB di Cosco Super Apps.\nSelamat berkontribusi dan berinovasi.\n{link_sistem}",
    'remind_pic_tor' => "Cosco Super APPS\nKpd Yth {nama_pic}\nDay 1 TOR RAB belum diajukan. Anda telah ditunjuk dan mendapatkan amanah dari Dekan Sekolah Vokasi UNS untuk menjalankan kegiatan {detail_kegiatan} yang bersumber dari dana hibah. untuk itu mohon segera mengajukan TOR RAB di Cosco Super Apps.\nSelamat berkontribusi dan berinovasi.\n{link_sistem}",
    
    // 2. TAHAP 1 KOORDINATOR MADIUN
    'submit_tor_koordinator' => "Cosco Super APPS\nKpd Yth Koordinator UNS Kampus Madiun\n{nama_pic} telah menyelesaikan dan mengajukan TOR RAB kegiatan {detail_kegiatan} yang bersumber dari dana hibah. Untuk itu mohon segera menyetujui TOR RAB di Cosco Super Apps.\n{link_sistem}",
    'approve_tor_koordinator' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan kegiatan {detail_kegiatan} anda telah di setujui oleh Koordinator UNS Kampus Madiun. Harap bersabar saat ini sedang proses review oleh Perencanaan SV.\n\n{link_sistem}",
    'revisi_tor_koordinator' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan TOR RAB dengan kegiatan {detail_kegiatan} ada revisi dari Koordinator UNS Kampus Madiun.\nCatatan: {catatan_revisi}\nMohon segera cek dan selesaikan revisi ajuan anda. tetap semangat ya kak.\n\n{link_sistem}",
    
    // 3. TAHAP 2 PERENCANAAN SV UNS
    'submit_tor_keuangan' => "Cosco Super APPS\nKpd Yth Perencanaan SV\n{nama_pic} telah menyelesaikan dan mengajukan TOR RAB kegiatan {detail_kegiatan} yang bersumber dari dana hibah.\nUntuk itu mohon segera mereview ajuan TOR RAB tersebut di Cosco Super Apps.\n\n{link_sistem}",
    'approve_tor_keuangan' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan kegiatan {detail_kegiatan} anda telah di setujui oleh Perencanaan SV. Harap bersabar saat ini sedang proses review oleh Wakil Dekan SV UNS.\n\n{link_sistem}",
    'revisi_tor_keuangan' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan TOR RAB dengan kegiatan {detail_kegiatan} ada revisi dari Perencanaan SV UNS.\nCatatan: {catatan_revisi}\nMohon segera cek dan selesaikan revisi ajuan anda. tetap semangat ya kak.\n\n{link_sistem}",
    
    // 4. TAHAP 3 WAKIL DEKAN SV UNS
    'approve_tor_wd' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan kegiatan {detail_kegiatan} anda telah di setujui oleh Wakil Dekan SV UNS. Segera ajukan memo cair dan mulai berkegiatan kak. Semangat terus ya kak.\n\n{link_sistem}",
    'revisi_tor_wd' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan TOR RAB dengan kegiatan {detail_kegiatan} ada revisi dari Wakil Dekan SV UNS.\nCatatan: {catatan_revisi}\nMohon segera cek dan selesaikan revisi ajuan anda. tetap semangat ya kak.\n\n{link_sistem}",
    
    // 5. PENGAJUAN & APPROVAL MEMO CAIR
    'remind_memo_cair' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\n[Day 3] setelah TOR RAB disetujui namun Memo Cair Belum diajukan. Segera ajukan memo cair kegiatan {detail_kegiatan} supaya kakak bisa segera memulai kegiatan. Semangat kaka\n\n{link_sistem}",
    'submit_memo_cair' => "Cosco Super APPS\nKpd Yth Sub Kor Non Akademik\n\n{nama_pic} telah mengajukan memo cair untuk kegiatan {detail_kegiatan} yang bersumber dari dana hibah.\nTOR RAB Kegiatan tersebut telah disetujui oleh Wakil Dekan Non Akademik. Untuk itu mohon segera mereview ajuan memo cair tersebut di Cosco Super Apps.\n\n{link_sistem}",
    'approve_memo_cair_keuangan' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan memo cair {detail_kegiatan} anda telah di setujui oleh Sub Kor Non Akademik. Silakan laksanakan kegiatan dan siapkan bukti belanja kuitansi/faktur untuk pelaporan SPJ. tetap sehat dan semangat terus ya kak.\n\n{link_sistem}",
    'reject_memo_cair_keuangan' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan memo cair kegiatan {detail_kegiatan} ada revisi/penolakan dari Sub Kor Non Akademik.\nCatatan: {catatan_revisi}\nMohon segera cek dan perbaiki ajuan memo cair anda di Cosco Super Apps. Tetap semangat ya kak.\n\n{link_sistem}",
    
    // 6. PELAPORAN & AUDIT VERIFIKASI SPJ
    'remind_lapor_spj' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nPengingat Laporan SPJ: Kegiatan {detail_kegiatan} telah disetujui. Mohon segera melengkapi dan mengunggah berkas pertanggungjawaban (SPJ), kuitansi, faktur pajak, nota belanja, dan foto dokumentasi di Cosco Super Apps agar dapat diverifikasi dan diteruskan ke Bendahara.\n\n{link_sistem}",
    'submit_spj_verifikator' => "Cosco Super APPS\nKpd Yth Verifikator SPJ\n{nama_pic} telah menyelesaikan dan mengunggah berkas pertanggungjawaban (SPJ) kegiatan {detail_kegiatan}. Mohon segera melakukan audit verifikasi berkas bukti belanja di Cosco Super Apps.\n\n{link_sistem}",
    'approve_spj_valid' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nSelamat! Berkas pertanggungjawaban (SPJ) kegiatan {detail_kegiatan} telah diperiksa dan dinyatakan VALID & LOLOS AUDIT oleh Verifikator SPJ. Ajuan telah diteruskan ke Bendahara Pembayaran untuk proses transfer dana/pelunasan.\n\n{link_sistem}",
    'revisi_spj_verifikator' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, berkas pertanggungjawaban (SPJ) kegiatan {detail_kegiatan} memerlukan revisi/kelengkapan bukti dari Verifikator SPJ.\nCatatan: {catatan_revisi}\nMohon segera lengkapi kekurangan berkas kuitansi/faktur di Cosco Super Apps. Tetap semangat ya kak.\n\n{link_sistem}",
    
    // 7. EKSEKUSI PEMBAYARAN BENDAHARA (BPP)
    'bayar_memo_cair_bendahara' => "Cosco Super APPS\nKpd Yth Bendahara Pengeluaran Pembantu\nBerkas SPJ kegiatan {detail_kegiatan} oleh {nama_pic} telah diperiksa dan dinyatakan VALID oleh Verifikator SPJ. Mohon segera melakukan eksekusi pembayaran/transfer dana sebesar Rp {nominal} ke rekening {link_sistem} an. {nama_pic} dan upload bukti transfer di Cosco Super Apps.\n\n{link_sistem}",
    'notify_dana_cair_pic' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Kabar Baik! Dana pembayaran kegiatan {detail_kegiatan} sebesar Rp {nominal} telah BERHASIL DITRANSFER oleh Bendahara ke rekening terdaftar anda (Bukti transfer telah terlampir di sistem). Seluruh rangkaian kegiatan dan pertanggungjawaban telah SELESAI PENUH (LUNAS / CLOSED). Terima kasih atas dedikasi dan kinerjanya!\n\n{link_sistem}",
    'reject_bayar_bendahara' => "Cosco Super APPS\nKpd Yth {nama_pic}\n\nPerhatian, proses transfer pencairan dana kegiatan {detail_kegiatan} mengalami kendala / revisi nomor rekening dari Bendahara.\nCatatan: {catatan_revisi}\nMohon segera periksa dan perbarui data rekening anda di Cosco Super Apps.\n\n{link_sistem}",
    
    // 8. TUTUP BUKU & SELESAI
    'close_kegiatan_final' => "Cosco Super APPS\nPemberitahuan: Seluruh alur perencanaan TOR, pelaksanaan kegiatan, verifikasi SPJ, dan transfer pembayaran Bendahara untuk kegiatan {detail_kegiatan} telah SELESAI TUNTAS 100%.\n\n{link_sistem}"
];

foreach ($waTemplates as $type => $content) {
    PengaturanModel::updateOrCreate(['type' => $type], ['content' => $content]);
}
PengaturanModel::updateOrCreate(['type' => 'template_wa'], ['content' => json_encode($waTemplates)]);

echo "Updated gemini_api_key, GEMINI_API_KEY, and all 22 WhatsApp templates in database successfully!\n";
