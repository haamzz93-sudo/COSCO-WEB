<?php

namespace App\Jobs;

use App\Services\WablasService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWablasJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Array pesan yang akan dikirim.
     * Format: [['phone' => '628xxx', 'message' => '...'], ...]
     */
    protected array $messages;

    /**
     * Jumlah percobaan ulang jika gagal.
     */
    public int $tries = 10;

    /**
     * Batas waktu eksekusi job (detik).
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(array $messages)
    {
        $this->messages = $messages;
    }

    /**
     * Execute the job.
     */
    public function handle(WablasService $wablas): void
    {
        if (empty($this->messages)) {
            Log::info('SendWablasJob: Tidak ada pesan yang dikirim.');
            return;
        }

        Log::info('SendWablasJob diproses', [
            'total' => count($this->messages),
            'phones' => array_column($this->messages, 'phone')
        ]);

        $result = $wablas->sendMultipleMessages($this->messages);

        if (!$result['success']) {
            // Jika gagal, lemparkan exception agar job di-retry
            throw new \Exception($result['message']);
        }

        Log::info('SendWablasJob berhasil', [
            'total' => count($this->messages)
        ]);
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendWablasJob gagal setelah percobaan maksimal', [
            'error' => $exception->getMessage(),
            'total' => count($this->messages)
        ]);

        // Opsional: kirim notifikasi ke admin
    }
}