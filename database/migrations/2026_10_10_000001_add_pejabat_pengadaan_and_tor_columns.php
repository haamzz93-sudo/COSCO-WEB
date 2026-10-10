<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\RoleModel;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah kolom pada tabel tors jika belum ada
        Schema::table('tors', function (Blueprint $table) {
            if (!Schema::hasColumn('tors', 'catatan_pp')) {
                $table->text('catatan_pp')->nullable()->after('catatan_koordinator');
            }
            if (!Schema::hasColumn('tors', 'file_dokumen_pengadaan')) {
                $table->text('file_dokumen_pengadaan')->nullable()->after('catatan_pp');
            }
            if (!Schema::hasColumn('tors', 'status_pengadaan')) {
                $table->string('status_pengadaan', 50)->nullable()->after('file_dokumen_pengadaan');
            }
        });

        // 2. Suntik Data Role Pejabat Pengadaan (PP) ke tabel roles
        RoleModel::updateOrCreate(
            ['role' => 'pejabat_pengadaan'],
            [
                'nama_role' => 'Pejabat Pengadaan (PP)',
                'permissions' => [
                    "specific_is_user_pp",
                    "tor_pp_validasi",
                    "pengadaan_pp_execute",
                    "pengadaan_pp_upload",
                    "satuan_add",
                    "satuan_update",
                    "kegiatan_detail_update"
                ],
                'keterangan' => 'Role Pejabat Pengadaan (PP): Verifikasi HPS BHP & Inventaris, Eksekusi Pengadaan, dan Unggah BAST Dokumen Belanja'
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tors', function (Blueprint $table) {
            if (Schema::hasColumn('tors', 'catatan_pp')) {
                $table->dropColumn('catatan_pp');
            }
            if (Schema::hasColumn('tors', 'file_dokumen_pengadaan')) {
                $table->dropColumn('file_dokumen_pengadaan');
            }
            if (Schema::hasColumn('tors', 'status_pengadaan')) {
                $table->dropColumn('status_pengadaan');
            }
        });
    }
};
