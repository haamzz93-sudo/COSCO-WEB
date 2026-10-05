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
        Schema::create('ps', function (Blueprint $table) {
            $table->id();
            $table->foreignId("ik_id");
            $table->string("kode_p")->unique();
            $table->text("deskripsi_p");
            $table->timestamps();
            
            //fk
            $table->foreign('ik_id')->references('id')->on("iks")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ps');
    }
};
