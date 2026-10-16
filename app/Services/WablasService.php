<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Repositories\PengaturanRepo;
use App\Helpers\GeneralHelper;
use Carbon\Carbon;
use App\Models\User;
use App\Models\TorModel;
use App\Models\MemoCairModel;
use App\Jobs\SendWablasJob;

class WablasService
{
    /**
     * Format nomor telepon ke format 628xxx (tanpa + dan tanpa 0 di depan)
     *
     * @param string $phone
     * @return string
     */
    private static function formatPhoneNumber(string $phone): string
    {
        // Hilangkan spasi, strip, karakter aneh
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // Jika diawali +62, hilangkan +
        if (strpos($phone, '+62') === 0) {
            $phone = substr($phone, 1); // hilangkan +
        }

        // Jika diawali 0, ganti dengan 62 (kecuali sudah 62)
        if (strpos($phone, '0') === 0 && strpos($phone, '62') !== 0) {
            $phone = '62' . substr($phone, 1);
        }

        // Jika tidak diawali 62, dan tidak diawali +62 (sudah terproses), tambahkan 62
        if (strpos($phone, '62') !== 0 && strpos($phone, '+') !== 0) {
            // Asumsi nomor Indonesia, tambahkan 62
            $phone = '62' . $phone;
        }

        // Pastikan hanya angka
        $phone = preg_replace('/[^0-9]/', '', $phone);

        return $phone;
    }

    /**
     * Kirim pesan WhatsApp melalui Wablas API V2.
     *
     * @param string $phone  Nomor tujuan (akan diformat otomatis)
     * @param string $message Isi pesan
     * @return array ['success' => bool, 'message' => string]
     */
    public static function sendMessage(string $phone, string $message): array
    {
        // Format nomor telepon terlebih dahulu
        $phone = self::formatPhoneNumber($phone);

        // Validasi nomor telepon
        if (empty($phone) || !preg_match('/^62[0-9]{9,15}$/', $phone)) {
            return [
                'success' => false,
                'message' => 'Nomor telepon tidak valid (harus format 628xxx).'
            ];
        }

        // Ambil konfigurasi dari pengaturan
        $pengaturan = PengaturanRepo::gets();
        $token = $pengaturan['wablas_api_token'] ?? null;
        $secretKey = $pengaturan['wablas_api_secret'] ?? null;
        $url = $pengaturan['wablas_url'].'/api/v2/send-message';

        // Pastikan konfigurasi tersedia
        if (empty($token) || empty($secretKey)) {
            Log::error('Wablas configuration missing', [
                'token_set' => !empty($token),
                'secret_key_set' => !empty($secretKey)
            ]);
            return [
                'success' => false,
                'message' => 'Konfigurasi Wablas tidak lengkap. Periksa Token dan Secret Key.'
            ];
        }

        try {
            // Format payload sesuai V2
            $payload = [
                'data' => [
                    [
                        'phone' => $phone,
                        'message' => $message,
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => $token . '.' . $secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($url, $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                // Cek status dari response Wablas
                if (isset($responseData['status']) && $responseData['status'] === true) {
                    return [
                        'success' => true,
                        'message' => 'Pesan berhasil dikirim.'
                    ];
                }
                return [
                    'success' => false,
                    'message' => $responseData['message'] ?? 'Gagal mengirim pesan.'
                ];
            }

            Log::error('Wablas send failed', [
                'phone' => $phone,
                'response' => $response->body(),
                'status' => $response->status()
            ]);

            return [
                'success' => false,
                'message' => 'Gagal mengirim pesan: ' . $response->body()
            ];
        } catch (\Exception $e) {
            Log::error('Wablas exception', [
                'error' => $e->getMessage(),
                'phone' => $phone
            ]);

            return [
                'success' => false,
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Kirim multiple pesan sekaligus (opsional).
     *
     * @param array $messages [['phone' => '...', 'message' => '...'], ...]
     * @return array ['success' => bool, 'message' => string, 'data' => array]
     */
    public static function sendMultipleMessages(array $messages): array
    {
        if (empty($messages)) {
            return [
                'success' => false,
                'message' => 'Tidak ada pesan yang dikirim.'
            ];
        }

        // Format setiap nomor telepon
        foreach ($messages as &$item) {
            if (isset($item['phone'])) {
                $item['phone'] = self::formatPhoneNumber($item['phone']);
            }
        }
        unset($item);

        $pengaturan = PengaturanRepo::gets();
        $token = $pengaturan['wablas_api_token'] ?? null;
        $secretKey = $pengaturan['wablas_api_secret'] ?? null;
        $url = $pengaturan['wablas_url'].'/api/v2/send-message';

        if (empty($token) || empty($secretKey)) {
            return [
                'success' => false,
                'message' => 'Konfigurasi Wablas tidak lengkap.'
            ];
        }

        try {
            $payload = ['data' => $messages];

            $response = Http::withHeaders([
                'Authorization' => $token . '.' . $secretKey,
                'Content-Type' => 'application/json',
            ])->post($url, $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'message' => 'Pesan berhasil dikirim.',
                    'data' => $responseData
                ];
            }

            Log::error('Wablas multiple send failed', [
                'response' => $response->body(),
                'status' => $response->status()
            ]);

            return [
                'success' => false,
                'message' => 'Gagal mengirim pesan: ' . $response->body()
            ];
        } catch (\Exception $e) {
            Log::error('Wablas exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Ganti placeholder pada template pesan (sesuai fungsinya).
     * (Tidak diubah, hanya contoh)
     */
    public static function prepareMessage(array $replacements, string $template)
    {
        $link = 'https://cosco.unsmadiun.id';
        $expanded = [];
        foreach ($replacements as $k => $v) {
            $expanded[$k] = $v;
            $expanded[strtoupper($k)] = $v;
            $expanded[strtolower($k)] = $v;
        }
        $expanded['{AKSES_CEPAT_COSCO}'] = $link;
        $expanded['{link_sistem}'] = $link;
        $expanded['{LINK_SISTEM}'] = $link;
        $expanded['{akses_cepat_cosco}'] = $link;

        return str_replace(array_keys($expanded), array_values($expanded), $template);
    }
    

    // -------------------------------------------------------------------------
    // 1. Assign PIC (notifikasi pertama)
    // -------------------------------------------------------------------------
    public function send_assign_pic($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['assign_pic'];
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail']
        ];

        $message = self::prepareMessage($replacements, $template);
        $messages=[
            [
                'phone'     =>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'],
                'message'   =>$message
            ]
        ];
        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // --------------------------------------sd-----------------------------------
    // 2. Remind PIC TOR RAB (dengan Day)
    // -------------------------------------------------------------------------
    public function send_remind_pic_tor()
    {
        // TOR DRAFT
        $tors = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->where("status_ajuan", "draft")->get();

        foreach ($tors as $tor) {
            if (!$tor->kegiatan_detail || !$tor->kegiatan_detail->pic_kegiatan) {
                return response()->json([
                    'error'   => "NOT_FOUND",
                    'message' => "PIC Kegiatan tidak ditemukan."
                ], 404);
            }
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['remind_pic_tor'];
        $messages=[];
        $now=Carbon::now()->startOfDay();
        foreach($tors as $val){
            $replacements=[
                '{PIC_KEGIATAN}'    => $val['kegiatan_detail']['user_pic_kegiatan']['name'],
                '{DAY}'             => GeneralHelper::countDayFromDate($val['created_at'], $now)." hari",
                '{DETAIL_KEGIATAN}' => $val['kegiatan_detail']['nama_kegiatan_detail']
            ];

            if(!empty($val['kegiatan_detail']['user_pic_kegiatan']['no_wa'])){
                $messages[]=[
                    'phone'     =>$val['kegiatan_detail']['user_pic_kegiatan']['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }
        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 3. Submit TOR – notifikasi ke Koordinator
    // -------------------------------------------------------------------------
    public function send_submit_tor_to_koordinator($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // KOORDINATOR
        $koor=User::get();
        $koor=$koor->filter(fn($user)=>$user->hasPermission("specific_is_user_koordinator"));

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['submit_tor_koordinator'];
        $messages=[];
        $now=Carbon::now()->startOfDay();
        foreach($koor as $val){
            $replacements=[
                '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
                '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
                '{KOORDINATOR}'     => $val['name']
            ];

            if(!empty($val['no_wa'])){
                $messages[]=[
                    'phone'     =>$val['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }
        
        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 4. Submit TOR ke Wakil Dekan (notif ke WD)
    // -------------------------------------------------------------------------
    public function send_submit_tor_to_wd($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // WAKIL DEKAN
        $wd = null;
        if (!empty($tor['wakil_dekan_id'])) {
            $wd = User::find($tor['wakil_dekan_id']);
        }
        if (!$wd) {
            $wd = User::whereHas('data_role', function($q){
                $q->whereJsonContains('permissions', 'specific_is_user_wakil_dekan')
                  ->orWhereJsonContains('permissions', 'specific_wakil_dekan')
                  ->orWhereJsonContains('permissions', 'tor_wakil_dekan_validasi');
            })->first();
        }
        if (!$wd) {
            $wd = User::whereIn('role', ['wakil_dekan', 'pimpinan', 'admin'])->first();
        }

        if (!$wd || empty($wd['no_wa'])) {
            return;
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['submit_tor_wd'] ?? "Pemberitahuan: Pengajuan TOR RAB '{DETAIL_KEGIATAN}' oleh {PIC_KEGIATAN} telah disetujui Koordinator dan menunggu telaah serta pengesahan Bapak/Ibu {WAKIL_DEKAN}.";
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan',
            '{WAKIL_DEKAN}'     => $wd['name'] ?? 'Wakil Dekan'
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$wd['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($wd['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 5. TOR disetujui oleh Koordinator (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_approve_tor_koordinator($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['approve_tor_koordinator'] ?? "Cosco Super APPS\nKpd Yth. *{PIC_KEGIATAN}*\n\nPemberitahuan: Usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah DISETUJUI oleh Koordinator Kampus Madiun ({KOORDINATOR}).\nSaat ini usulan telah diteruskan ke Wakil Dekan untuk proses telaah dan pengesahan pimpinan.\n\n*Link {AKSES_CEPAT_COSCO}*";
        $catatan = $req['catatan_koordinator'] ?? ($tor['catatan_koordinator'] ?? '-');
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{nama_pic}'        => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{detail_kegiatan}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{KOORDINATOR}'     => $login_data['name'] ?? 'Koordinator Kampus Madiun',
            '{CATATAN_REVISI}'  => $catatan,
            '{catatan_revisi}'  => $catatan
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 6. TOR direvisi oleh koordinator (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_revisi_tor_koordinator($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['revisi_tor_koordinator'];
        $catatan = $req['catatan_koordinator'] ?? ($tor['catatan_koordinator'] ?? '-');
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{nama_pic}'        => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{detail_kegiatan}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{KOORDINATOR}'     => $login_data['name'] ?? 'Koordinator Kampus Madiun',
            '{CATATAN_REVISI}'  => $catatan,
            '{catatan_revisi}'  => $catatan
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 7. TOR disetujui oleh Wakil Dekan (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_approve_tor_wd($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['approve_tor_wd'];
        $catatan = $req['catatan_wakil_dekan'] ?? ($tor['catatan_wakil_dekan'] ?? '-');
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{nama_pic}'        => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{detail_kegiatan}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{WAKIL_DEKAN}'     => $login_data['name'] ?? 'Wakil Dekan',
            '{CATATAN_REVISI}'  => $catatan,
            '{catatan_revisi}'  => $catatan
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 8. TOR direvisi oleh wakil dekan (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_revisi_tor_wd($request, $tor_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['revisi_tor_wd'];
        $catatan = $req['catatan_wakil_dekan'] ?? ($tor['catatan_wakil_dekan'] ?? '-');
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{nama_pic}'        => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{detail_kegiatan}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
            '{WAKIL_DEKAN}'     => $login_data['name'] ?? 'Wakil Dekan',
            '{CATATAN_REVISI}'  => $catatan,
            '{catatan_revisi}'  => $catatan
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 9. Reminder Memo Cair (kelipatan 3 hari)
    // -------------------------------------------------------------------------
    public function send_remind_pic_memo_cair()
    {
        $now=Carbon::now()->startOfDay();

        // TOR WAKIL DEKAN APPLIED
        $tors = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->where("status_ajuan", "wakil_dekan_applied")->get();
        $tors=$tors->filter(function ($tor) use ($now) {
            $day=GeneralHelper::countDayFromDate($tor['updated_at'], $now);
            
            // Harus lebih dari 0 hari (bukan hari yang sama) DAN sisa bagi 3 adalah 0
            return $day > 0 && $day % 3 == 0;
        });

        foreach ($tors as $tor) {
            if (!$tor->kegiatan_detail || !$tor->kegiatan_detail->pic_kegiatan) {
                return response()->json([
                    'error'   => "NOT_FOUND",
                    'message' => "PIC Kegiatan tidak ditemukan."
                ], 404);
            }
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['remind_memo_cair'];
        $messages=[];
        foreach($tors as $val){
            $replacements=[
                '{PIC_KEGIATAN}'    => $val['kegiatan_detail']['user_pic_kegiatan']['name'],
                '{DAY}'             => GeneralHelper::countDayFromDate($val['updated_at'], $now)." hari",
                '{DETAIL_KEGIATAN}' => $val['kegiatan_detail']['nama_kegiatan_detail']
            ];

            if(!empty($val['kegiatan_detail']['user_pic_kegiatan']['no_wa'])){
                $messages[]=[
                    'phone'     =>$val['kegiatan_detail']['user_pic_kegiatan']['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }
        
        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 10. Submit Memo Cair (notif ke Sub Kor Non Akademik)
    // permissions : specific_is_user_subkor, memo_cair_keuangan_validasi
    // -------------------------------------------------------------------------
    public function send_submit_memo_cair($request, $memo_cair_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // MEMO CAIR, TOR PIC
        $memo_cair=MemoCairModel::find($memo_cair_id);
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($memo_cair['tor_id']);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // KEUANGAN/PERENCANAAN
        $keuangan=User::get();
        $keuangan = $keuangan->filter(fn($user) => 
            $user->hasPermission("specific_is_user_subkor") && 
            $user->hasPermission("memo_cair_keuangan_validasi")
        );

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['submit_memo_cair'];
        $messages=[];
        $now=Carbon::now()->startOfDay();
        foreach($keuangan as $val){
            $replacements=[
                '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
                '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
                '{KEUANGAN}'     => $val['name']
            ];

            if(!empty($val['no_wa'])){
                $messages[]=[
                    'phone'     =>$val['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }
        
        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 11. Memo Cair disetujui oleh Sub Kor (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_approve_memo_cair_keuangan($request, $memo_cair_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $memo_cair=MemoCairModel::find($memo_cair_id);
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($memo_cair['tor_id']);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['approve_memo_cair_keuangan'];
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{KEUANGAN}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        $messages = [
            [
                'phone' => $tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 
                'message'   => $message
            ]
        ];

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 12. Memo Cair ditolak oleh Sub Kor (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_reject_memo_cair_keuangan($request, $memo_cair_id)
    {
        $login_data = $request->user();
        $req = $request->all();

        // TOR PIC
        $memo_cair=MemoCairModel::find($memo_cair_id);
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($memo_cair['tor_id']);
        if(is_null($tor['kegiatan_detail']['pic_kegiatan'])){
            return response()->json([
                'error'   => "NOT_FOUND",
                'message' => "PIC Kegiatan tidak ditemukan."
            ], 404);
        }

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['reject_memo_cair_keuangan'];
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{KEUANGAN}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        $messages = [
            [
                'phone' => $tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 
                'message'   => $message
            ]
        ];

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 16. Pengingat TOR ke Koordinator Madiun (Remind Koordinator)
    // status_ajuan=sent, permissions=specific_is_user_koordinator, tor_koordinator_validasi
    // -------------------------------------------------------------------------
    public function send_remind_koordinator_tor()
    {
        // TOR SENT
        $tors = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->where("status_ajuan", "sent")->get();

        $text_kegiatan=$tors->isEmpty()?"":$tors->pluck('kegiatan_detail.nama_kegiatan_detail')->filter()->implode(', ');

        //PERMISSION
        $koor = User::get()->filter(fn($user)=>
            $user->hasPermission("specific_is_user_koordinator") &&
            $user->hasPermission("tor_koordinator_validasi")
        );
        $pengaturan = PengaturanRepo::gets();

        // SUCCESS
        $template = $pengaturan['remind_koordinator_tor'] ?? "Cosco Super APPS\nKpd Yth. *{KOORDINATOR}*\n\nMohon izin mengingatkan, terdapat pengajuan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* yang saat ini sedang menunggu review dan persetujuan dari Bapak/Ibu Koordinator.\n\nTautan verifikasi:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.";
        $messages=[];
        $now=Carbon::now()->startOfDay();
        foreach($koor as $val){
            $replacements = [
                '{DETAIL_KEGIATAN}' => $text_kegiatan,
                '{KOORDINATOR}'     => $val['name']
            ];

            if($text_kegiatan!=""){
                $messages[]=[
                    'phone'     =>$val['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }
        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 17. Pengingat TOR ke Wakil Dekan SV UNS (Remind Wakil Dekan)
    // status_ajuan=koordinator_applied, permissions=specific_is_user_wakil_dekan, tor_wakil_dekan_validasi
    // -------------------------------------------------------------------------
    public function send_remind_wd_tor()
    {
        // TOR KOORDINATOR_APPLIED
        $tors = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->where("status_ajuan", "koordinator_applied")->get();

        $text_kegiatan=$tors->isEmpty()?"":$tors->pluck('kegiatan_detail.nama_kegiatan_detail')->filter()->implode(', ');

        //PERMISSION
        $wd = User::get()->filter(fn($user)=>
            $user->hasPermission("specific_is_user_wakil_dekan") &&
            $user->hasPermission("tor_wakil_dekan_validasi")
        );
        $pengaturan = PengaturanRepo::gets();

        // SUCCESS
        $template = $pengaturan['remind_wd_tor'] ?? "Cosco Super APPS\nKpd Yth. *{WAKIL_DEKAN}*\n\nMohon izin melaporkan, usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah disetujui oleh Koordinator Kampus Madiun dan saat ini menunggu pengesahan akhir dari Bapak/Ibu Wakil Dekan.\n\nTautan persetujuan:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas perkenan dan arahan Bapak/Ibu.";
        $messages=[];
        $now=Carbon::now()->startOfDay();
        foreach($wd as $val){
            $replacements = [
                '{DETAIL_KEGIATAN}' => $text_kegiatan,
                '{WAKIL_DEKAN}'     => $val['name']
            ];

            if($text_kegiatan!=""){
                $messages[]=[
                    'phone'     =>$val['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }

        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 18. Pengingat Memo Cair ke Sub Kor Non Akademik (Remind Keuangan)
    // status_ajuan=sent, permissions=specific_is_user_subkor, memo_cair_keuangan_validasi
    // -------------------------------------------------------------------------
    public function send_remind_keuangan_memo_cair()
    {
        $memos = MemoCairModel::with(["tor", "tor.kegiatan_detail", "tor.kegiatan_detail.user_pic_kegiatan"])->where("status_ajuan", "sent")->get();

        // Menggunakan ternary operator untuk kondisi kosong
        $text_kegiatan = $memos->isEmpty()
            ? ''
            : $memos->pluck('tor.kegiatan_detail.nama_kegiatan_detail')->filter()->implode(', ');

        $keuangan = User::get()->filter(fn($user)=>
            $user->hasPermission("specific_is_user_subkor") && 
            $user->hasPermission("memo_cair_keuangan_validasi")
        );
        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['remind_keuangan_memo_cair'] ?? "Cosco Super APPS\nKpd Yth. *{KEUANGAN}*\n\nMohon izin mengingatkan, pengajuan Memo Cair untuk kegiatan *{DETAIL_KEGIATAN}* saat ini sedang menunggu proses validasi dari Tim Keuangan / Sub Kor Non-Akademik.\n\nTautan periksa:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja samanya.";

        $messages = [];
        foreach ($keuangan as $val) {
            $replacements = [
                '{DETAIL_KEGIATAN}' => $text_kegiatan,
                '{KEUANGAN}'        => $val['name']
            ];
            
            if($text_kegiatan!=""){
                $messages[]=[
                    'phone'     =>$val['no_wa'],
                    'message'   =>self::prepareMessage($replacements, $template)
                ];
            }
        }

        SendWablasJob::dispatch($messages);
        // $result = self::sendMultipleMessages($messages);
    }

    // -------------------------------------------------------------------------
    // 18. Notify Dana Cair ke PIC (Generik untuk PK & Normal)
    // Dipicu saat: status_ajuan = 'terbayar' di MemoCairController::validasi_keuangan()
    // -------------------------------------------------------------------------
    public function send_notify_dana_cair_pic($request, $memo_cair_id)
    {
        $memo_cair = MemoCairModel::find($memo_cair_id);
        if (!$memo_cair) return;

        $tor = TorModel::with([
            "kegiatan_detail",
            "kegiatan_detail.kegiatan",
            "kegiatan_detail.user_pic_kegiatan"
        ])->find($memo_cair['tor_id']);

        $pic = $tor['kegiatan_detail']['user_pic_kegiatan'] ?? null;
        if (!$pic || empty($pic['no_wa'])) {
            Log::warning('send_notify_dana_cair_pic: PIC tidak ditemukan atau no_wa kosong.', [
                'memo_cair_id' => $memo_cair_id
            ]);
            return;
        }

        // ==========================================================
        // FORMAT DATA
        // ==========================================================
        $tipe = $memo_cair['tipe_pencairan'] ?? 'normal';
        $jenisTransfer = ($tipe === 'pk') ? 'UANG MUKA (PK)' : 'REIMBURSEMENT';
        $nominal = number_format($memo_cair['total_rab'] ?? 0, 0, ',', '.');
        $namaPic = $pic['name'] ?? 'PIC Kegiatan';
        $detailKegiatan = $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan';
        $tglBayar = !empty($memo_cair['tgl_bayar'])
            ? \Carbon\Carbon::parse($memo_cair['tgl_bayar'])->isoFormat('D MMMM Y, HH:mm') . ' WIB'
            : \Carbon\Carbon::now()->isoFormat('D MMMM Y, HH:mm') . ' WIB';

        $pengaturan = PengaturanRepo::gets();

        // ==========================================================
        // TEMPLATE SAMA UNTUK PK & NORMAL
        // ==========================================================
        $template = $pengaturan['notify_dana_cair_pic']
            ?? "Cosco Super APPS
    Kpd Yth *{PIC_KEGIATAN}*

    💰 *Konfirmasi Transfer Dana {JENIS_TRANSFER} Berhasil*

    Dana untuk kegiatan *{DETAIL_KEGIATAN}* sebesar *Rp {NOMINAL}* telah berhasil ditransfer ke rekening Anda.

    📅 Tanggal Transfer: {TGL_BAYAR}

    Terima kasih atas dedikasi dan ketertiban administrasi Anda.

    {AKSES_CEPAT_COSCO}";

        $replacements = [
            '{PIC_KEGIATAN}'    => $namaPic,
            '{JENIS_TRANSFER}'  => $jenisTransfer,
            '{DETAIL_KEGIATAN}' => $detailKegiatan,
            '{NOMINAL}'         => $nominal,
            '{TGL_BAYAR}'       => $tglBayar,
        ];

        $message = self::prepareMessage($replacements, $template);

        $messages = [
            [
                'phone'   => $pic['no_wa'],
                'message' => $message
            ]
        ];

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 19. submit_spj_verifikator
    // to verifikator_spj, permissions=specific_is_user_verifikator_spj, spj_keuangan_validasi
    // -------------------------------------------------------------------------
    public function send_submit_spj_verifikator($request, $memo_cair_id)
    {
        $memo_cair=MemoCairModel::find($memo_cair_id);
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($memo_cair['tor_id']);

        $verif = User::get()->filter(fn($user)=>
            $user->hasPermission("specific_is_user_verifikator_spj") && 
            $user->hasPermission("spj_keuangan_validasi")
        );

        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['submit_spj_verifikator'] ?? "Cosco Super APPS
            Kpd Yth Verifikator SPJ
            {PIC_KEGIATAN} telah menyelesaikan dan mengunggah berkas pertanggungjawaban (SPJ) kegiatan {DETAIL_KEGIATAN}. Mohon segera melakukan audit verifikasi berkas bukti belanja di Cosco Super Apps.

            {AKSES_CEPAT_COSCO}";

        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail']
        ];

        $messages = [];
        foreach ($verif as $val) {
            $messages[]=[
                'phone'     =>$val['no_wa'],
                'message'   =>self::prepareMessage($replacements, $template)
            ];
        }

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 20. Reminder Lapor SPJ (Menggunakan satu template seragam)
    // -------------------------------------------------------------------------
    public function send_remind_lapor_spj()
    {
        // Ambil Memo Cair yang status SPJ-nya masih di PIC ('draft' atau 'keuangan_revisi')
        // - Normal: tgl_bayar boleh null
        // - PK: tgl_bayar harus sudah terisi
        $memos = MemoCairModel::with(["tor.kegiatan_detail.user_pic_kegiatan"])
            ->whereIn('status_spj', ['draft', 'keuangan_revisi'])
            ->where(function($query) {
                $query->where('tipe_pencairan', 'normal')
                      ->orWhere(function($q) {
                          $q->where('tipe_pencairan', 'pk')
                            ->whereNotNull('tgl_bayar');
                      });
            })
            ->get();

        if ($memos->isEmpty()) {
            return; 
        }

        $pengaturan = PengaturanRepo::gets();
        
        // Menggunakan hanya satu template tunggal 'remind_lapor_spj'
        $template = $pengaturan['remind_lapor_spj'] ?? "Cosco Super APPS\nKpd Yth {PIC_KEGIATAN}\n\nPengingat Laporan SPJ: Kegiatan {DETAIL_KEGIATAN} telah disetujui. Mohon segera melengkapi dan mengunggah berkas pertanggungjawaban (SPJ), kuitansi, faktur pajak, nota belanja, dan foto dokumentasi di Cosco Super Apps agar dapat diverifikasi dan diteruskan ke Bendahara.\n\n{AKSES_CEPAT_COSCO}";
        
        $messages = [];
        
        foreach ($memos as $val) {
            $pic = $val['tor']['kegiatan_detail']['user_pic_kegiatan'] ?? null;
            
            if ($pic && !empty($pic['no_wa'])) {
                $replacements = [
                    '{PIC_KEGIATAN}'    => $pic['name'],
                    '{DETAIL_KEGIATAN}' => $val['tor']['kegiatan_detail']['nama_kegiatan_detail']
                ];

                $messages[] = [
                    'phone'   => $pic['no_wa'],
                    'message' => self::prepareMessage($replacements, $template)
                ];
            }
        }

        if (!empty($messages)) {
            SendWablasJob::dispatch($messages);
        }
    }

    // -------------------------------------------------------------------------
    // 21. Reminder Verifikator SPJ (Remind Verifikator untuk cek SPJ berstatus 'sent')
    // -------------------------------------------------------------------------
    public function send_remind_verifikator_spj()
    {
        // Ambil semua Memo Cair yang SPJ-nya berstatus 'sent' (menunggu verifikasi)
        $memos = MemoCairModel::with(["tor.kegiatan_detail"])
            ->where("status_spj", "sent")
            ->get();

        $text_kegiatan = $memos->isEmpty()
            ? ''
            : $memos->pluck('tor.kegiatan_detail.nama_kegiatan_detail')->filter()->implode(', ');

        // Ambil user yang memiliki hak akses sebagai Verifikator SPJ
        $verif = User::get()->filter(fn($user) =>
            $user->hasPermission("specific_is_user_verifikator_spj") && 
            $user->hasPermission("spj_keuangan_validasi")
        );

        $pengaturan = PengaturanRepo::gets();
        
        // Template default (bisa diatur lewat menu pengaturan aplikasi)
        $template = $pengaturan['remind_verifikator_spj'] ?? "Cosco Super APPS\nKpd Yth. *{VERIFIKATOR}*\n\nMohon izin mengingatkan, terdapat berkas pertanggungjawaban (SPJ) untuk kegiatan *{DETAIL_KEGIATAN}* yang saat ini sedang menunggu proses verifikasi dan audit dari Tim Verifikator SPJ.\n\nTautan periksa:\n{AKSES_CEPAT_COSCO}\n\nTerima kasih atas kerja samanya.";

        $messages = [];
        
        foreach ($verif as $val) {
            $replacements = [
                '{DETAIL_KEGIATAN}' => $text_kegiatan,
                '{VERIFIKATOR}'     => $val['name']
            ];

            if ($text_kegiatan != "" && !empty($val['no_wa'])) {
                $messages[] = [
                    'phone'   => $val['no_wa'],
                    'message' => self::prepareMessage($replacements, $template)
                ];
            }
        }

        if (!empty($messages)) {
            SendWablasJob::dispatch($messages);
        }
    }

    // -------------------------------------------------------------------------
    // 22. Approve SPJ Valid (Notifikasi ke PIC bahwa SPJ lolos audit)
    // -------------------------------------------------------------------------
    public function send_approve_spj_valid($request, $memo_cair_id)
    {
        $memo_cair = MemoCairModel::find($memo_cair_id);
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.user_pic_kegiatan"])->find($memo_cair['tor_id']);
        
        $pic = $tor['kegiatan_detail']['user_pic_kegiatan'] ?? null;
        if (!$pic || empty($pic['no_wa'])) {
            return;
        }

        $pengaturan = PengaturanRepo::gets();
        
        // Template default
        $template = $pengaturan['approve_spj_valid'] ?? "Cosco Super APPS\nKpd Yth {PIC_KEGIATAN}\n\n✅ *Laporan SPJ Valid*\n\nSelamat! Berkas laporan pertanggungjawaban (SPJ) untuk kegiatan *{DETAIL_KEGIATAN}* telah diperiksa dan dinyatakan VALID (Lolos Audit) oleh Tim Verifikator. Terima kasih atas dedikasi dan tertib administrasinya.\n\n{AKSES_CEPAT_COSCO}";

        $replacements = [
            '{PIC_KEGIATAN}'    => $pic['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail']
        ];

        $messages = [
            [
                'phone'   => $pic['no_wa'],
                'message' => self::prepareMessage($replacements, $template)
            ]
        ];

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 23. Revisi SPJ Verifikator (Notifikasi ke PIC bahwa SPJ butuh revisi)
    // -------------------------------------------------------------------------
    public function send_revisi_spj_verifikator($request, $memo_cair_id)
    {
        $memo_cair = MemoCairModel::find($memo_cair_id);
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.user_pic_kegiatan"])->find($memo_cair['tor_id']);
        
        $pic = $tor['kegiatan_detail']['user_pic_kegiatan'] ?? null;
        if (!$pic || empty($pic['no_wa'])) {
            return;
        }

        $pengaturan = PengaturanRepo::gets();
        
        // Template default
        $template = $pengaturan['revisi_spj_verifikator'] ?? "Cosco Super APPS\nKpd Yth {PIC_KEGIATAN}\n\n⚠️ *Pemberitahuan Revisi SPJ*\n\nBerkas laporan pertanggungjawaban (SPJ) untuk kegiatan *{DETAIL_KEGIATAN}* telah diperiksa oleh Verifikator dan *MEMERLUKAN REVISI*.\n\n📝 *Catatan Revisi:*\n_{CATATAN_REVISI}_\n\nMohon segera melakukan perbaikan dan mengunggah ulang berkas yang sesuai melalui tautan berikut:\n{AKSES_CEPAT_COSCO}";

        // Ambil catatan revisi dari field catatan_keuangan_spj
        $catatan = 'Silakan cek detail revisi di dalam aplikasi.';

        $replacements = [
            '{PIC_KEGIATAN}'    => $pic['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{CATATAN_REVISI}'  => $catatan
        ];

        $messages = [
            [
                'phone'   => $pic['no_wa'],
                'message' => self::prepareMessage($replacements, $template)
            ]
        ];

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 24. Instruksi Bayar Memo Cair ke Bendahara
    // Dipicu saat:
    //   - Skema PK: validasi_keuangan() dengan status_ajuan = keuangan_applied
    //   - Skema Normal: validasi_keuangan_spj() dengan status_spj = keuangan_applied
    // Penerima: User dengan permission "specific_is_user_bendahara"
    // -------------------------------------------------------------------------
    public function send_bayar_memo_cair_bendahara($request, $memo_cair_id)
    {
        $memo_cair = MemoCairModel::find($memo_cair_id);
        if (!$memo_cair) return;

        $tor = TorModel::with([
            "kegiatan_detail",
            "kegiatan_detail.kegiatan",
            "kegiatan_detail.user_pic_kegiatan"
        ])->find($memo_cair['tor_id']);

        $pic = $tor['kegiatan_detail']['user_pic_kegiatan'] ?? null;
        if (!$pic) return;

        // ==========================================================
        // CARI BENDAHARA BERDASARKAN PERMISSION
        // ==========================================================
        $bendaharaList = User::get()->filter(fn($user) =>
            $user->hasPermission("specific_is_user_bendahara")
        );

        // Fallback terakhir: cari berdasarkan role
        if ($bendaharaList->isEmpty()) {
            $fallback = User::where('role', 'bendahara')->first();
            if ($fallback) {
                $bendaharaList = collect([$fallback]);
            }
        }

        // Filter hanya yang punya no_wa valid
        $bendaharaList = $bendaharaList->filter(fn($b) => !empty($b['no_wa']));

        if ($bendaharaList->isEmpty()) {
            Log::warning('send_bayar_memo_cair_bendahara: Tidak ada bendahara yang ditemukan (permission specific_is_user_bendahara).', [
                'memo_cair_id' => $memo_cair_id
            ]);
            return;
        }

        // ==========================================================
        // FORMAT DATA UNTUK TEMPLATE
        // ==========================================================
        $jenis_transfer = ($memo_cair['tipe_pencairan'] === 'pk')
            ? 'UANG MUKA (PRESEKOT KERJA / PK)'
            : 'REIMBURSEMENT (NORMAL)';

        $nominal = number_format($memo_cair['total_rab'] ?? 0, 0, ',', '.');
        $namaPic = $pic['name'] ?? 'PIC Kegiatan';
        $detailKegiatan = $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan';

        // Info rekening PIC (opsional, jika tersedia)
        $infoRekening = '';
        if (!empty($pic['nama_bank']) && !empty($pic['nomor_rekening'])) {
            $infoRekening = "\n🏦 *Rekening Tujuan:*\nBank: {$pic['nama_bank']}\nNo. Rek: {$pic['nomor_rekening']}\nA.n: {$namaPic}";
        }

        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['bayar_memo_cair_bendahara']
            ?? "Cosco Super APPS
    Kpd Yth. *{NAMA_BENDAHARA}*

    Terdapat instruksi eksekusi transfer dana untuk tipe pencairan *{JENIS_TRANSFER}*.

    📋 *Detail Kegiatan:*
    Nama: {DETAIL_KEGIATAN}
    PIC: {PIC_KEGIATAN}
    Nominal: Rp {NOMINAL}{INFO_REKENING}

    Dokumen telah divalidasi oleh Tim Keuangan/Verifikator. Mohon segera melakukan transfer ke rekening tujuan dan memperbarui status pembayaran (Terbayar) di dalam sistem.

    {AKSES_CEPAT_COSCO}";

        // ==========================================================
        // KIRIM KE SEMUA BENDAHARA YANG MEMILIKI PERMISSION
        // ==========================================================
        $messages = [];
        foreach ($bendaharaList as $bendahara) {
            $replacements = [
                '{NAMA_BENDAHARA}'  => $bendahara['name'] ?? 'Bendahara Pengeluaran',
                '{JENIS_TRANSFER}'  => $jenis_transfer,
                '{DETAIL_KEGIATAN}' => $detailKegiatan,
                '{PIC_KEGIATAN}'    => $namaPic,
                '{NOMINAL}'         => $nominal,
                '{INFO_REKENING}'   => $infoRekening,
            ];

            $messages[] = [
                'phone'   => $bendahara['no_wa'],
                'message' => self::prepareMessage($replacements, $template)
            ];
        }

        SendWablasJob::dispatch($messages);
    }

    // -------------------------------------------------------------------------
    // 25. Reminder Bendahara untuk Transfer Dana (PK & Normal)
    // Dipicu via Schedule: jam 08:00 dan 14:00 setiap hari
    // Kondisi:
    //   - PK: status_ajuan = keuangan_applied & tgl_cair_pk IS NULL
    //   - Normal: status_ajuan = keuangan_applied & status_spj = keuangan_applied & tgl_bayar IS NULL
    // Penerima: User dengan permission "specific_is_user_bendahara"
    // -------------------------------------------------------------------------
    public function send_remind_bayar_bendahara()
    {
        // ==========================================================
        // 1. QUERY MEMO CAIR YANG MENUNGGU TRANSFER
        // ==========================================================
        $memos = MemoCairModel::with([
            "tor.kegiatan_detail",
            "tor.kegiatan_detail.kegiatan",
            "tor.kegiatan_detail.user_pic_kegiatan"
        ])
        ->where(function($q) {
            // SKEMA PK: menunggu transfer setelah keuangan ACC
            $q->where(function($q2) {
                $q2->where('tipe_pencairan', 'pk')
                ->where('status_ajuan', 'keuangan_applied')
                ->whereNull('tgl_cair_pk');
            })
            // SKEMA NORMAL: menunggu transfer setelah SPJ ACC
            ->orWhere(function($q2) {
                $q2->where('tipe_pencairan', 'normal')
                ->where('status_ajuan', 'keuangan_applied')
                ->where('status_spj', 'keuangan_applied')
                ->whereNull('tgl_bayar');
            });
        })
        ->get();

        if ($memos->isEmpty()) {
            Log::info('send_remind_bayar_bendahara: Tidak ada memo cair yang menunggu transfer.');
            return;
        }

        // ==========================================================
        // 2. CARI BENDAHARA BERDASARKAN PERMISSION
        // ==========================================================
        $bendaharaList = User::get()->filter(fn($user) =>
            $user->hasPermission("specific_is_user_bendahara")
        );

        // Fallback: cari berdasarkan role
        if ($bendaharaList->isEmpty()) {
            $fallback = User::where('role', 'bendahara')->first();
            if ($fallback) {
                $bendaharaList = collect([$fallback]);
            }
        }

        // Filter hanya yang punya no_wa valid
        $bendaharaList = $bendaharaList->filter(fn($b) => !empty($b['no_wa']));

        if ($bendaharaList->isEmpty()) {
            Log::warning('send_remind_bayar_bendahara: Tidak ada bendahara yang ditemukan.', [
                'total_memo_menunggu' => $memos->count()
            ]);
            return;
        }

        // ==========================================================
        // 3. FORMAT DAFTAR KEGIATAN
        // ==========================================================
        $daftarKegiatan = [];
        foreach ($memos as $memo) {
            $pic = $memo['tor']['kegiatan_detail']['user_pic_kegiatan'] ?? null;
            $detailKegiatan = $memo['tor']['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan';
            $namaPic = $pic['name'] ?? 'PIC Belum Ditentukan';
            $nominal = number_format($memo['total_rab'] ?? 0, 0, ',', '.');
            $jenisTransfer = ($memo['tipe_pencairan'] === 'pk') ? 'UANG MUKA (PK)' : 'REIMBURSEMENT';

            $daftarKegiatan[] = "• *{$detailKegiatan}* - PIC: {$namaPic} (Rp {$nominal}) - {$jenisTransfer}";
        }

        $textDaftar = implode("\n", $daftarKegiatan);

        // ==========================================================
        // 4. TEMPLATE PESAN
        // ==========================================================
        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['remind_bayar_bendahara']
            ?? "Cosco Super APPS
    Kpd Yth. *{BENDAHARA}*

    ⏰ *Pengingat: Dana Kegiatan Menunggu Pencairan*

    Terdapat kegiatan yang telah disetujui dan menunggu transfer dana dari Bendahara:

    {DAFTAR_KEGIATAN}

    Mohon segera melaksanakan transfer ke rekening PIC masing-masing dan memperbarui status pembayaran (Terbayar) di dalam sistem.

    {AKSES_CEPAT_COSCO}";

        // ==========================================================
        // 5. KIRIM KE SEMUA BENDAHARA
        // ==========================================================
        $messages = [];
        foreach ($bendaharaList as $bendahara) {
            $replacements = [
                '{BENDAHARA}' => $bendahara['name'] ?? 'Bendahara Pengeluaran',
                '{DAFTAR_KEGIATAN}' => $textDaftar,
            ];

            $messages[] = [
                'phone'   => $bendahara['no_wa'],
                'message' => self::prepareMessage($replacements, $template)
            ];
        }

        SendWablasJob::dispatch($messages);

        Log::info('send_remind_bayar_bendahara: Reminder berhasil dikirim.', [
            'total_bendahara' => count($messages),
            'total_memo_menunggu' => $memos->count()
        ]);
    }

    // -------------------------------------------------------------------------
    // HPS / BHP & INVENTARIS: 7 TAHAPAN ALUR PENGADAAN (NOTIFIKASI RESMI WABLAS)
    // -------------------------------------------------------------------------
    public function send_hps_notification(string $triggerKey, $kegiatanDetailId, array $extra = [])
    {
        try {
            $pengaturan = PengaturanRepo::gets();
            $template = $pengaturan[$triggerKey] ?? null;
            if (empty($template)) {
                return;
            }

            $detail = \App\Models\KegiatanDetailModel::with(['kegiatan', 'user_pic_kegiatan'])->find($kegiatanDetailId);
            if (!$detail) {
                return;
            }

            $picName = $detail->user_pic_kegiatan->name ?? 'PIC Kegiatan';
            $picPhone = $detail->user_pic_kegiatan->no_wa ?? null;
            $namaKegiatan = $detail->nama_kegiatan_detail ?? ($detail->kegiatan->nama_kegiatan ?? 'Kegiatan Pengadaan');
            $nominal = number_format($detail->pagu ?? 0, 0, ',', '.');
            $link = url('/dashboard/tors/rab/' . $detail->id);

            $replacements = [
                '{PIC_KEGIATAN}'      => $picName,
                '{nama_pic}'          => $picName,
                '{DETAIL_KEGIATAN}'   => $namaKegiatan,
                '{detail_kegiatan}'   => $namaKegiatan,
                '{NOMINAL}'           => $nominal,
                '{nominal}'           => $nominal,
                '{CATATAN_REVISI}'    => $extra['catatan_revisi'] ?? '-',
                '{catatan_revisi}'    => $extra['catatan_revisi'] ?? '-',
                '{AKSES_CEPAT_COSCO}' => $link,
                '{link_sistem}'       => $link,
                '{KATEGORI}'          => $detail->kategori_pengadaan ?? 'Pengadaan',
            ];

            // Target phone based on stage
            $targetPhones = [];
            if (in_array($triggerKey, ['hps_submit_pic'])) {
                // To Koordinator Madiun
                $koors = User::get()->filter(fn($u) => $u->hasPermission("specific_is_user_koordinator") || $u->hasPermission("tor_koordinator_validasi") || stripos($u->role, 'koordinator') !== false);
                foreach ($koors as $k) {
                    if (!empty($k->no_wa)) $targetPhones[] = $k->no_wa;
                }
            } elseif (in_array($triggerKey, ['hps_approve_koordinator'])) {
                // To Pejabat Pengadaan (PP)
                $pps = User::get()->filter(fn($u) => $u->hasPermission("specific_is_user_pp") || $u->hasPermission("tor_pp_validasi") || stripos($u->role, 'pengadaan') !== false);
                foreach ($pps as $p) {
                    if (!empty($p->no_wa)) $targetPhones[] = $p->no_wa;
                }
            } elseif (in_array($triggerKey, ['hps_approve_pp'])) {
                // To Wakil Dekan II
                $wds = User::get()->filter(fn($u) => $u->hasPermission("specific_is_user_wakil_dekan") || $u->hasPermission("specific_wakil_dekan") || stripos($u->role, 'dekan') !== false);
                foreach ($wds as $w) {
                    if (!empty($w->no_wa)) $targetPhones[] = $w->no_wa;
                }
            } elseif (in_array($triggerKey, ['hps_approve_wd'])) {
                // To PP and PIC
                if (!empty($picPhone)) $targetPhones[] = $picPhone;
                $pps = User::get()->filter(fn($u) => $u->hasPermission("specific_is_user_pp") || $u->hasPermission("tor_pp_validasi") || stripos($u->role, 'pengadaan') !== false);
                foreach ($pps as $p) {
                    if (!empty($p->no_wa)) $targetPhones[] = $p->no_wa;
                }
            } elseif (in_array($triggerKey, ['hps_selesai_final'])) {
                // To PIC dan Koordinator Kampus Madiun (Manajemen)
                if (!empty($picPhone)) $targetPhones[] = $picPhone;
                $koors = User::get()->filter(fn($u) => $u->hasPermission("specific_is_user_koordinator") || $u->hasPermission("tor_koordinator_validasi") || stripos($u->role, 'koordinator') !== false);
                foreach ($koors as $k) {
                    if (!empty($k->no_wa)) $targetPhones[] = $k->no_wa;
                }
            } elseif (in_array($triggerKey, ['hps_upload_bast_pp'])) {
                // CATATAN SARPRAS: Tahap 9 sementara diskip menunggu code group WhatsApp Sarpras.
                // Disiapkan untuk integrasi group_id Wablas di masa mendatang saat kode grup diberikan.
                if (!empty($picPhone)) $targetPhones[] = $picPhone;
            } else {
                // To PIC
                if (!empty($picPhone)) $targetPhones[] = $picPhone;
            }

            if (empty($targetPhones)) {
                return;
            }

            $messageText = self::prepareMessage($replacements, $template);
            $messages = [];
            foreach (array_unique($targetPhones) as $phone) {
                $messages[] = [
                    'phone'   => $phone,
                    'message' => $messageText
                ];
            }

            SendWablasJob::dispatch($messages);
            Log::info("Wablas HPS [{$triggerKey}] dispatched to " . count($messages) . " recipients.");
        } catch (\Throwable $e) {
            Log::error("Failed to send Wablas HPS notification: " . $e->getMessage());
        }
    }
}
