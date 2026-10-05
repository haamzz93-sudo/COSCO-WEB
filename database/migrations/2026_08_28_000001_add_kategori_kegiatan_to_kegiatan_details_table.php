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
        Schema::table('kegiatan_details', function (Blueprint $table) {
            if (!Schema::hasColumn('kegiatan_details', 'kategori_kegiatan')) {
                $table->string('kategori_kegiatan', 50)->default('kegiatan')->after('nama_kegiatan_detail')->comment('kegiatan, inventaris, bhp');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kegiatan_details', function (Blueprint $table) {
            if (Schema::hasColumn('kegiatan_details', 'kategori_kegiatan')) {
                $table->dropColumn('kategori_kegiatan');
            }
        });
    }
};
