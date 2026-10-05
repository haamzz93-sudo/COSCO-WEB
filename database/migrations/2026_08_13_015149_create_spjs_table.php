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
        Schema::create('spjs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("memo_cair_id")->constrained()->onDelete("cascade");
            $table->foreignId("kelompok_belanja_id")->constrained()->onDelete("cascade");
            $table->string("no_kwitansi");
            $table->text("sudah_diterima_dari");
            $table->decimal("jumlah_uang", 18, 2);
            $table->text("untuk_pembayaran");
            $table->foreignIdFor(\App\Models\User::class, "penerima_id")->nullable()->constrained()->onDelete("cascade");
            $table->longText("rab");
            $table->longText("lampiran");
            $table->longText("data");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spjs');
    }
};
