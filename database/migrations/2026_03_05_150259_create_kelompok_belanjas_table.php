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
        Schema::create('kelompok_belanjas', function (Blueprint $table) {
            $table->id();
            $table->foreignId("mak_id");
            $table->string("nama_kelompok_belanja");
            $table->text("lampiran");
            $table->decimal("kwitansi_pajak", 5, 2);
            $table->timestamps();
            
            //fk
            $table->foreign('mak_id')->references('id')->on("maks")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelompok_belanjas');
    }
};
