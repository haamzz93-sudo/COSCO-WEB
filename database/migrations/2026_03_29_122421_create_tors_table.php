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
        Schema::create('tors', function (Blueprint $table) {
            $table->id();
            $table->foreignId("kegiatan_detail_id")->unique()->constrained()->onDelete("cascade");
            $table->foreignId("program_studi_id")->constrained()->onDelete("cascade");
            $table->foreignId("iku_id")->constrained()->onDelete("cascade");
            $table->foreignId("ik_id")->constrained()->onDelete("cascade");
            $table->foreignId("p_id")->constrained()->onDelete("cascade");
            $table->text("latar_belakang");
            $table->text("rasionalisasi");
            $table->text("tujuan");
            $table->text("mekanisme_dan_rancangan");
            $table->text("jadwal_pelaksanaan");
            $table->text("iku_detail");
            $table->text("ik_detail");
            $table->text("keberlanjutan");
            $table->mediumText("penanggung_jawab");
            $table->string("status_ajuan")->default("draft");
            $table->text("catatan_koordinator");
            $table->text("catatan_wakil_dekan");
            $table->text("catatan_keuangan");
            $table->foreignIdFor(App\Models\User::class, "wakil_dekan_id")->nullable()->constrained()->onDelete("cascade");
            $table->longText("rab");
            $table->decimal("total_rab", 18, 0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tors');
    }
};
