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
        Schema::table('kelompok_belanjas', function (Blueprint $table) {
            $table->string('kwitansi_tipe')->after("kwitansi_pajak")->default("rab");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kelompok_belanjas', function (Blueprint $table) {
            $table->dropColumn('kwitansi_tipe'); 
        });
    }
};
