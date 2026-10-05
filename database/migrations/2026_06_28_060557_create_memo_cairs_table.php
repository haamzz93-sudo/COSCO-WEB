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
        Schema::create('memo_cairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("tor_id")->constrained()->onDelete("cascade");
            $table->string("status_ajuan");
            $table->string("status_spj");
            $table->text("catatan_keuangan");
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
        Schema::dropIfExists('memo_cairs');
    }
};
