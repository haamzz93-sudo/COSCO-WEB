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
        Schema::table('spjs', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\User::class, "kuasa_pengguna_anggaran_id")->after("penerima_id")->nullable()->constrained()->onDelete("cascade");
            $table->foreignIdFor(\App\Models\User::class, "bendahara_id")->after("kuasa_pengguna_anggaran_id")->nullable()->constrained()->onDelete("cascade");
            $table->foreignIdFor(\App\Models\User::class, "pic_id")->after("bendahara_id")->nullable()->constrained()->onDelete("cascade");
            $table->text("file_spj")->after("lampiran");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spjs', function (Blueprint $table) {
            $table->dropForeign('spjs_bendahara_id_foreign');
            $table->dropForeign('spjs_kuasa_pengguna_anggaran_id_foreign');
            $table->dropForeign('spjs_pic_id_foreign');

            $table->dropColumn(['bendahara_id', 'kuasa_pengguna_anggaran_id', "pic_id", "file_spj"]);
        });
    }
};
