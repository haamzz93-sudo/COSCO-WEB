<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\RoleModel;
use App\Models\User;

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

        // 2. Suntik Role Pejabat Pengadaan (PP)
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

        // 3. Suntik Akun Pejabat Pengadaan (PP)
        $user = User::where('username', 'pejabat_pengadaan')
            ->orWhere('email', 'pengadaan.madiun@staff.uns.ac.id')
            ->first();

        $userData = [
            'name' => 'Pejabat Pengadaan PSDKU UNS Madiun',
            'username' => 'pejabat_pengadaan',
            'email' => 'pengadaan.madiun@staff.uns.ac.id',
            'password' => '$2y$12$Q4oP7QfZJ5z7u48uE70NKe9nCq64V2Q7K24a7N64kG2c3q4r8b5ty',
            'role' => 'pejabat_pengadaan',
            'status' => 'aktif',
            'tipe_user' => 'staff',
            'nip' => '198805122019031005',
            'no_wa' => '081234567890',
            'avatar_url' => '',
        ];

        if ($user) {
            $user->update($userData);
        } else {
            User::create($userData);
        }
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
