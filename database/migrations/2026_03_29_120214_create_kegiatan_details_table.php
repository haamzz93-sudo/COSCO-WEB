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
        Schema::create('kegiatan_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("kegiatan_id");
            $table->string("nama_kegiatan_detail");
            $table->decimal("biaya", total:18, places:2)->nullable();
            $table->unsignedBigInteger("pic_kegiatan")->nullable()->comment("user pic kegiatan");
            $table->timestamps();

            //fk
            $table->foreign('kegiatan_id')->references('id')->on("kegiatans")->onDelete("cascade");
            $table->foreign('pic_kegiatan')->references('id')->on('users')->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kegiatan_details');
    }
};
