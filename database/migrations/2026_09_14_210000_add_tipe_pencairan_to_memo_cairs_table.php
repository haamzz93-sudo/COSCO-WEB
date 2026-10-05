<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('memo_cairs', function (Blueprint $table) {
            if (!Schema::hasColumn('memo_cairs', 'tipe_pencairan')) {
                $table->string('tipe_pencairan', 20)->default('normal')->after('status_spj');
            }
            if (!Schema::hasColumn('memo_cairs', 'termin_ke')) {
                $table->integer('termin_ke')->default(1)->after('tipe_pencairan');
            }
            if (!Schema::hasColumn('memo_cairs', 'status_pembayaran_pk')) {
                $table->string('status_pembayaran_pk', 50)->nullable()->after('termin_ke');
            }
            if (!Schema::hasColumn('memo_cairs', 'tgl_cair_pk')) {
                $table->timestamp('tgl_cair_pk')->nullable()->after('status_pembayaran_pk');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memo_cairs', function (Blueprint $table) {
            if (Schema::hasColumn('memo_cairs', 'tipe_pencairan')) {
                $table->dropColumn('tipe_pencairan');
            }
            if (Schema::hasColumn('memo_cairs', 'termin_ke')) {
                $table->dropColumn('termin_ke');
            }
            if (Schema::hasColumn('memo_cairs', 'status_pembayaran_pk')) {
                $table->dropColumn('status_pembayaran_pk');
            }
            if (Schema::hasColumn('memo_cairs', 'tgl_cair_pk')) {
                $table->dropColumn('tgl_cair_pk');
            }
        });
    }
};
