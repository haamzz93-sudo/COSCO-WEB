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
        $new_replacements = array_merge($replacements, [
            '{AKSES_CEPAT_COSCO}' => 'https://cosco.unsmadiun.id'
        ]);

        return str_replace(array_keys($new_replacements), array_values($new_replacements), $template);
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
    // 4. Submit TOR – notifikasi ke Perencanaan
    // -------------------------------------------------------------------------
    public function send_submit_tor_to_keuangan($request, $tor_id)
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

        // KEUANGAN/PERENCANAAN
        $keuangan=User::get();
        $keuangan=$keuangan->filter(fn($user)=>$user->hasPermission("specific_is_user_keuangan"));

        // SUCCESS
        $pengaturan=PengaturanRepo::gets();

        $template = $pengaturan['submit_tor_keuangan'];
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
    // 8. Submit TOR ke Wakil Dekan (notif ke WD)
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

        $template = $pengaturan['approve_tor_koordinator'];
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{KOORDINATOR}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 7. TOR direvisi oleh koordinator (notif ke PIC)
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
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{KOORDINATOR}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 6. TOR disetujui oleh Perencanaan (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_approve_tor_keuangan($request, $tor_id)
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

        $template = $pengaturan['approve_tor_keuangan'];
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{KEUANGAN}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 7. TOR direvisi oleh Perencanaan (notif ke PIC)
    // -------------------------------------------------------------------------
    public function send_revisi_tor_keuangan($request, $tor_id)
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

        $template = $pengaturan['revisi_tor_keuangan'];
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{KEUANGAN}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 9. TOR disetujui oleh Wakil Dekan (notif ke PIC)
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
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{WAKIL_DEKAN}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 7. TOR direvisi oleh wakil dekan (notif ke PIC)
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
        $replacements=[
            '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'],
            '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'],
            '{WAKIL_DEKAN}'     => $login_data['name']
        ];

        $message = self::prepareMessage($replacements, $template);
        
        SendWablasJob::dispatch([['phone'=>$tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], 'message'=>$message]]);
        // $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 11. Reminder Memo Cair (kelipatan 3 hari)
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
    // 12. Submit Memo Cair (notif ke Sub Kor Non Akademik)
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
        $keuangan=$keuangan->filter(fn($user)=>$user->hasPermission("specific_is_user_keuangan"));

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
    // 13. Memo Cair disetujui oleh Sub Kor (notif ke PIC)
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
        $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 13. Memo Cair ditolak oleh Sub Kor (notif ke PIC)
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
        $result = self::sendMessage($tor['kegiatan_detail']['user_pic_kegiatan']['no_wa'], $message);
    }

    // -------------------------------------------------------------------------
    // 16. Pengingat TOR ke Koordinator Madiun (Remind Koordinator)
    // -------------------------------------------------------------------------
    public function send_remind_koordinator_tor($request, $tor_id)
    {
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if (!$tor || !$tor['kegiatan_detail']) {
            return false;
        }

        $koor = User::get()->filter(fn($user)=>$user->hasPermission("specific_is_user_koordinator"));
        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['remind_koordinator_tor'] ?? "Cosco Super APPS\nKpd Yth. *{KOORDINATOR}*\n\nMohon izin mengingatkan, terdapat pengajuan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* oleh *{PIC_KEGIATAN}* yang saat ini sedang menunggu review dan persetujuan dari Bapak/Ibu Koordinator.\n\nTautan verifikasi:\n{link_sistem}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.";

        $messages = [];
        foreach ($koor as $val) {
            $replacements = [
                '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
                '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
                '{KOORDINATOR}'     => $val['name']
            ];
            if (!empty($val['no_wa'])) {
                $messages[] = [
                    'phone'   => $val['no_wa'],
                    'message' => self::prepareMessage($replacements, $template)
                ];
            }
        }
        if (!empty($messages)) {
            SendWablasJob::dispatch($messages);
        }
        return true;
    }

    // -------------------------------------------------------------------------
    // 17. Pengingat TOR ke Wakil Dekan SV UNS (Remind Wakil Dekan)
    // -------------------------------------------------------------------------
    public function send_remind_wd_tor($request, $tor_id)
    {
        $tor = TorModel::with(["kegiatan_detail", "kegiatan_detail.kegiatan", "kegiatan_detail.user_pic_kegiatan"])->find($tor_id);
        if (!$tor || !$tor['kegiatan_detail']) {
            return false;
        }

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

        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['remind_wd_tor'] ?? "Cosco Super APPS\nKpd Yth. *{WAKIL_DEKAN}*\n\nMohon izin melaporkan, usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah disetujui oleh Koordinator Kampus Madiun dan saat ini menunggu pengesahan akhir dari Bapak/Ibu Wakil Dekan.\n\nTautan persetujuan:\n{link_sistem}\n\nTerima kasih atas perkenan dan arahan Bapak/Ibu.";

        $messages = [];
        if ($wd && !empty($wd->no_wa)) {
            $replacements = [
                '{PIC_KEGIATAN}'    => $tor['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
                '{DETAIL_KEGIATAN}' => $tor['kegiatan_detail']['nama_kegiatan_detail'] ?? ($tor['judul_kegiatan'] ?? 'Kegiatan'),
                '{WAKIL_DEKAN}'     => $wd->name
            ];
            $messages[] = [
                'phone'   => $wd->no_wa,
                'message' => self::prepareMessage($replacements, $template)
            ];
            SendWablasJob::dispatch($messages);
        }
        return true;
    }

    // -------------------------------------------------------------------------
    // 18. Pengingat Memo Cair ke Sub Kor Non Akademik (Remind Keuangan)
    // -------------------------------------------------------------------------
    public function send_remind_keuangan_memo_cair($request, $memo_cair_id)
    {
        $memo = MemoCairModel::with(["tor", "tor.kegiatan_detail", "tor.kegiatan_detail.user_pic_kegiatan"])->find($memo_cair_id);
        if (!$memo) {
            return false;
        }

        $keuangan = User::get()->filter(fn($user)=>$user->hasPermission("specific_is_user_keuangan"));
        $pengaturan = PengaturanRepo::gets();
        $template = $pengaturan['remind_keuangan_memo_cair'] ?? "Cosco Super APPS\nKpd Yth. *{KEUANGAN}*\n\nMohon izin mengingatkan, pengajuan Memo Cair untuk kegiatan *{DETAIL_KEGIATAN}* oleh *{PIC_KEGIATAN}* saat ini sedang menunggu proses validasi dari Tim Keuangan / Sub Kor Non-Akademik.\n\nTautan periksa:\n{link_sistem}\n\nTerima kasih atas kerja samanya.";

        $messages = [];
        foreach ($keuangan as $val) {
            $replacements = [
                '{PIC_KEGIATAN}'    => $memo['tor']['kegiatan_detail']['user_pic_kegiatan']['name'] ?? 'PIC Kegiatan',
                '{DETAIL_KEGIATAN}' => $memo['tor']['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan',
                '{KEUANGAN}'        => $val['name']
            ];
            if (!empty($val['no_wa'])) {
                $messages[] = [
                    'phone'   => $val['no_wa'],
                    'message' => self::prepareMessage($replacements, $template)
                ];
            }
        }
        if (!empty($messages)) {
            SendWablasJob::dispatch($messages);
        }
        return true;
    }
}
