-- ==============================================================================
-- STRUKTUR TABEL FITUR KLAIM PERJALANAN DINAS (SPPD) & PAGU ANGGARAN
-- COSCO SUPER APPS - PSDKU UNIVERSITAS SEBELAS MARET (UNS) KAMPUS MADIUN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `pagu_perjalanan_dinas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tahun_anggaran` int(11) NOT NULL DEFAULT 2026,
  `nama_pagu` varchar(255) NOT NULL,
  `kegiatan_detail_id` bigint(20) unsigned DEFAULT NULL,
  `total_pagu` bigint(20) NOT NULL DEFAULT 0,
  `keterangan` text DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `perjalanan_dinas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nomor_surat_tugas` varchar(255) NOT NULL,
  `nama_kegiatan` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `pagu_id` bigint(20) unsigned DEFAULT NULL,
  `kegiatan_detail_id` bigint(20) unsigned DEFAULT NULL,
  `tgl_berangkat` date DEFAULT NULL,
  `tgl_kembali` date DEFAULT NULL,
  `durasi_hari` int(11) NOT NULL DEFAULT 1,
  `lokasi_tujuan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `jenis_transportasi` varchar(255) NOT NULL DEFAULT 'Kereta Api',
  `foto_kegiatan` longtext DEFAULT NULL,
  `berkas_bukti` longtext DEFAULT NULL,
  `nominal_klaim` bigint(20) NOT NULL DEFAULT 0,
  `nominal_disetujui` bigint(20) NOT NULL DEFAULT 0,
  `status` varchar(50) NOT NULL DEFAULT 'draft',
  `catatan_verifikator` text DEFAULT NULL,
  `verifikator_id` bigint(20) unsigned DEFAULT NULL,
  `tgl_verifikasi` timestamp NULL DEFAULT NULL,
  `bukti_bayar` varchar(255) DEFAULT NULL,
  `catatan_pembayaran` text DEFAULT NULL,
  `tgl_bayar` timestamp NULL DEFAULT NULL,
  `bendahara_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `perjalanan_dinas_user_id_index` (`user_id`),
  KEY `perjalanan_dinas_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Default Pagu Anggaran TA 2026
INSERT INTO `pagu_perjalanan_dinas` (`tahun_anggaran`, `nama_pagu`, `total_pagu`, `keterangan`, `created_at`, `updated_at`)
VALUES (2026, 'Pagu Perjalanan Dinas Civitas UNS Madiun TA 2026', 100000000, 'Alokasi pagu operasional perjalanan dinas resmi civitas PSDKU UNS Kampus Madiun', NOW(), NOW())
ON DUPLICATE KEY UPDATE `total_pagu` = `total_pagu`;
