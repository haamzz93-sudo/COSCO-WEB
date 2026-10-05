# 🧭 Product Requirements Document (PRD) — Super App Cost Control (Cosco)
> **Bintang Utara (North Star) & Spesifikasi Kebutuhan Produk Sistem Cosco UNS Madiun**

---

## 1. 🎯 Visi & Tujuan Produk
**Super App Cost Control (Cosco)** adalah sistem informasi tata kelola anggaran dan pengendalian biaya operasional terpadu yang memfasilitasi civitas akademika **Universitas Sebelas Maret (UNS) Kampus Madiun** dalam merencanakan kegiatan akademik, menyusun Rincian Anggaran Biaya (RAB/TOR), memproses pencairan dana (Memo Cair), dan melaporkan pertanggungjawaban (SPJ) secara transparan, akuntabel, dan terukur berbasis IKU (Indikator Kinerja Utama).

### 🌟 Masalah yang Diselesaikan:
1. **Pencatatan Anggaran Tersebar:** Sulitnya memantau sisa pagu anggaran per Program Studi / Unit.
2. **Keterlambatan SPJ:** Pelaporan pertanggungjawaban sering terlambat karena alur verifikasi berkas yang tidak terdigitalisasi.
3. **Ketidaksesuaian MAK (Mata Anggaran Kegiatan):** Pengusulan sering keliru dalam mengalokasikan akun belanja dan kelompok belanja.

---

## 2. ⚡ Fitur Utama Sistem (*Core Features*)

### A. Modul Perencanaan & Usulan Kegiatan (`kegiatans`, `kegiatan_details`)
- Pengusulan kegiatan berbasis Program Studi / Unit.
- Penentuan target IKU (*Indikator Kinerja Utama*), IKS, dan PS (*Program Strategis*).
- Penyusunan rincian belanja item per item dengan referensi satuan standar biaya.

### B. Modul Term of Reference (TOR) (`tors`)
- Upload dan preview dokumen TOR secara langsung.
- Verifikasi administratif kelayakan acara dan alokasi anggaran.

### C. Modul Memo Cair (`memo_cairs`)
- Penerbitan surat rekomendasi pencairan dana resmi bertanda tangan digital/verifikasi.
- Pelacakan riwayat nominal dana yang telah dicairkan vs sisa pagu.

### D. Modul Pertanggungjawaban Keuangan (SPJ) (`spjs`)
- Upload berkas kwitansi, nota belanja, dan bukti transfer.
- Checklist verifikasi kelengkapan SPJ oleh tim keuangan.

### E. Dashboard Eksekutif & Monitoring Anggaran
- Matriks serapan anggaran per Program Studi (D3 TI, D3 Akuntansi, D3 THP, dsb).
- Grafik persentase realisasi anggaran vs pagu tahun berjalan.
- Standarisasi UI: **Light Mode Default** dengan gaya *Executive Navy & Gold*.

---

## 3. 📈 Metrik Keberhasilan (*Success Metrics*)
- **Waktu Verifikasi Memo Cair < 24 Jam.**
- **Akurasi Serapan Anggaran 100% Sesuai Pagu MAK.**
- **Transparansi Dokumen SPJ Lengkap & Bebas Redundansi.**
