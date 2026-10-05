<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('memo_cairs', function (Blueprint $table) {
            if (!Schema::hasColumn('memo_cairs', 'bukti_bayar')) {
                $table->string('bukti_bayar')->nullable()->after('catatan_keuangan_spj');
            }
            if (!Schema::hasColumn('memo_cairs', 'tgl_bayar')) {
                $table->timestamp('tgl_bayar')->nullable()->after('bukti_bayar');
            }
            if (!Schema::hasColumn('memo_cairs', 'catatan_pembayaran')) {
                $table->text('catatan_pembayaran')->nullable()->after('tgl_bayar');
            }
        });
    }

    public function down(): void
    {
        Schema::table('memo_cairs', function (Blueprint $table) {
            if (Schema::hasColumn('memo_cairs', 'bukti_bayar')) {
                $table->dropColumn('bukti_bayar');
            }
            if (Schema::hasColumn('memo_cairs', 'tgl_bayar')) {
                $table->dropColumn('tgl_bayar');
            }
            if (Schema::hasColumn('memo_cairs', 'catatan_pembayaran')) {
                $table->dropColumn('catatan_pembayaran');
            }
        });
    }
};
