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
        Schema::create('iks', function (Blueprint $table) {
            $table->id();
            $table->foreignId("iku_id");
            $table->string("kode_ik")->unique();
            $table->text("deskripsi_ik");
            $table->timestamps();
            
            //fk
            $table->foreign('iku_id')->references('id')->on("ikus")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iks');
    }
};
