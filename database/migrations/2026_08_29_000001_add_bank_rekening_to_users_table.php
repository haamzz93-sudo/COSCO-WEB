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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'nama_bank')) {
                $table->string('nama_bank', 100)->nullable()->after('status');
            }
            if (!Schema::hasColumn('users', 'nomor_rekening')) {
                $table->string('nomor_rekening', 100)->nullable()->after('nama_bank');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'nomor_rekening')) {
                $table->dropColumn('nomor_rekening');
            }
            if (Schema::hasColumn('users', 'nama_bank')) {
                $table->dropColumn('nama_bank');
            }
        });
    }
};
