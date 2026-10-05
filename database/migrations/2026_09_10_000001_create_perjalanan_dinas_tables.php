<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pagu_perjalanan_dinas')) {
            Schema::create('pagu_perjalanan_dinas', function (Blueprint $table) {
                $table->id();
                $table->integer('tahun_anggaran')->default(date('Y'));
                $table->string('nama_pagu');
                $table->unsignedBigInteger('kegiatan_detail_id')->nullable();
                $table->bigInteger('total_pagu')->default(0);
                $table->text('keterangan')->nullable();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('perjalanan_dinas')) {
            Schema::create('perjalanan_dinas', function (Blueprint $table) {
                $table->id();
                $table->string('nomor_surat_tugas');
                $table->string('nama_kegiatan');
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('pagu_id')->nullable();
                $table->unsignedBigInteger('kegiatan_detail_id')->nullable();
                $table->date('tgl_berangkat')->nullable();
                $table->date('tgl_kembali')->nullable();
                $table->integer('durasi_hari')->default(1);
                $table->json('lokasi_tujuan')->nullable();
                $table->string('jenis_transportasi')->default('Kereta Api');
                $table->longText('foto_kegiatan')->nullable();
                $table->longText('berkas_bukti')->nullable();
                $table->bigInteger('nominal_klaim')->default(0);
                $table->bigInteger('nominal_disetujui')->default(0);
                $table->string('status')->default('draft');
                $table->text('catatan_verifikator')->nullable();
                $table->unsignedBigInteger('verifikator_id')->nullable();
                $table->timestamp('tgl_verifikasi')->nullable();
                $table->string('bukti_bayar')->nullable();
                $table->text('catatan_pembayaran')->nullable();
                $table->timestamp('tgl_bayar')->nullable();
                $table->unsignedBigInteger('bendahara_id')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('perjalanan_dinas');
        Schema::dropIfExists('pagu_perjalanan_dinas');
    }
};
