<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use App\Models\PengaturanModel;
use App\Repositories\PengaturanRepo;
use App\Services\WablasService;
use Carbon\Carbon;


class PengaturanController extends Controller
{
    
    public function update(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(Gate::denies('pengaturan', $login_data) && (!$login_data || !$login_data->checkIsAdmin())) {
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'data'          =>"required|array|min:1",
            'data.*.type'   =>"required|distinct",
            'data.*.content'=>"present"
            
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            foreach($req['data'] as $list){
                PengaturanModel::updateOrCreate(
                    ["type" => $list['type']],
                    ["content" => $list['content']]
                );

                // Auto-sync ke file .env jika ada update GEMINI_API_KEY dari frontend web
                if (in_array($list['type'], ['gemini_api_key', 'GEMINI_API_KEY']) && !empty($list['content'])) {
                    try {
                        $envPath = base_path('.env');
                        if (file_exists($envPath) && is_writable($envPath)) {
                            $envContent = file_get_contents($envPath);
                            $keyVal = trim($list['content']);
                            if (preg_match('/^GEMINI_API_KEY=.*/m', $envContent)) {
                                $envContent = preg_replace('/^GEMINI_API_KEY=.*/m', 'GEMINI_API_KEY="' . $keyVal . '"', $envContent);
                            } else {
                                $envContent .= "\nGEMINI_API_KEY=\"" . $keyVal . "\"\n";
                            }
                            file_put_contents($envPath, $envContent);
                        }
                    } catch (\Throwable $e) {
                        // Abaikan jika permission .env terbatas di server hosting
                    }
                }
            }
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //ROLE AUTHENTICATION

        //SUCCESS
        $data=PengaturanRepo::gets();

        return response()->json([
            'data'  =>$data
        ]);
    }

    public function test_gemini(Request $request)
    {
        $key = $request->input('key');
        if (empty($key)) {
            $pengaturan = PengaturanRepo::gets();
            $key = $pengaturan['gemini_api_key'] ?? ($pengaturan['GEMINI_API_KEY'] ?? env('GEMINI_API_KEY'));
        }

        if (empty($key)) {
            return response()->json([
                'status' => 'error',
                'message' => 'API Key Gemini belum diisi atau kosong.'
            ], 400);
        }

        $models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'];
        $success = false;
        $activeModel = '';
        $sampleResponse = '';
        $lastError = '';

        foreach ($models as $m) {
            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key=" . trim($key);
                $res = \Illuminate\Support\Facades\Http::withHeaders(['Content-Type' => 'application/json'])
                    ->timeout(12)
                    ->post($url, [
                        'contents' => [
                            ['parts' => [['text' => 'Tes koneksi sistem Cosco UNS Madiun. Jawab singkat: OK Sistem Siap.']]]
                        ]
                    ]);

                if ($res->successful()) {
                    $raw = $res->json('candidates.0.content.parts.0.text');
                    $success = true;
                    $activeModel = $m;
                    $sampleResponse = trim($raw);
                    break;
                } else {
                    $errObj = $res->json('error');
                    $lastError = $errObj['message'] ?? $res->body();
                }
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
            }
        }

        if ($success) {
            return response()->json([
                'status' => 'ok',
                'message' => "Koneksi Google Gemini API Berhasil! Model aktif: {$activeModel}",
                'model' => $activeModel,
                'sample' => $sampleResponse
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal terhubung ke Gemini API: ' . $lastError
        ], 400);
    }

    public function test_wablas(Request $request)
    {
        $login_data = $request->user();
        $targetPhone = $request->input('phone');
        
        if (empty($targetPhone)) {
            $targetPhone = $login_data->no_wa ?? null;
        }

        if (empty($targetPhone)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nomor WhatsApp tujuan belum diisi. Masukkan nomor WhatsApp aktif (contoh: 081234567890).'
            ], 400);
        }

        $nowStr = Carbon::now()->isoFormat('D MMMM Y, HH:mm:ss') . ' WIB';
        $userName = $login_data->name ?? 'Administrator';
        $testMsg = "*Tes Koneksi WhatsApp Gateway (Wablas API) - Cosco UNS Madiun*\n\n"
                 . "Halo {$userName},\n"
                 . "Konfigurasi WhatsApp Gateway Wablas berhasil terhubung dengan sistem Cosco!\n\n"
                 . "Waktu Uji Coba: {$nowStr}\n"
                 . "Status: *AKTIF & SIAP MENGIRIM NOTIFIKASI*\n\n"
                 . "_Pesan otomatis dari Sistem Cosco UNS Madiun_";

        $res = WablasService::sendMessage($targetPhone, $testMsg);

        if (!empty($res['success'])) {
            return response()->json([
                'status' => 'ok',
                'message' => "Pesan uji coba WhatsApp berhasil dikirim ke nomor {$targetPhone}!"
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $res['message'] ?? 'Gagal mengirim pesan uji coba WhatsApp.'
        ], 400);
    }
}