# 🤖 Agent Guidelines & Coding Instructions — Cosco UNS Madiun
> **Panduan Ketat untuk AI Assistant / Vibe Coding Agent dalam Mengembangkan Sistem Cosco**

---

## 1. 🛡️ Prinsip Utama Agent (*Core Principles*)
1. **Preserve Database Integrity:** Jangan pernah mengubah struktur tabel keuangan (`kegiatans`, `kegiatan_details`, `memo_cairs`, `spjs`, `maks`, `kelompok_belanjas`) tanpa validasi relasi foreign key.
2. **Single Source of Truth:** Seluruh aturan warna, tipografi, dan token UI wajib mengacu pada `DESIGN_SYSTEM_GUIDE.md` (Standar Eksekutif UNS).
3. **Safe Hosting Deployments:** Sistem dideploy pada environment hosting aaPanel Linux (PHP 8.3 & Nginx). Pastikan asset bundling Vite menghasilkan path relatif yang aman.

---

## 2. 🎨 Strict Anti-AI Slop & Visual Rules
Saat membuat atau merevisi halaman / komponen UI Cosco:
- ❌ **DILARANG MENGGUNAKAN BADGE KAPSUL OVERLOAD (`rounded-full`):**
  Gunakan sudut membulat modern yang berwibawa (`rounded-xl` atau `rounded-2xl`). Kapsul hanya untuk tombol navigasi khusus.
- ❌ **DILARANG MENGGUNAKAN FONT MONOSPACE UNTUK TEKS BIASA:**
  Gunakan font proporsional resmi: **Montserrat** untuk Judul & Header Tabel, **Inter** untuk Teks Isi/Paragraf.
- ❌ **HINDARI KARTU BERTUMPUK TANPA STRUKTUR (*Card-in-Card Clutter*):**
  Gunakan hierarki *Single-Layer Card* dengan border tipis `border-slate-200` dan shadow halus `shadow-2xs`.
- ❌ **DEFAULT THEME DASHBOARD WAJIB LIGHT THEME:**
  Inisialisasi tema wajib selalu `'light'`. Jangan biarkan aplikasi otomatis mengikuti OS Dark Mode.

---

## 3. 📂 Aturan Struktur Folder & Penempatan File
- **Inertia React Pages:** `laravel/resources/js/pages/dashboard/**/*.tsx`.
- **Inertia Layouts & Views:** `laravel/resources/views/app.blade.php`.
- **Global Shared Props:** Wajib dibagikan via `laravel/app/Http/Middleware/HandleInertiaRequests.php`.
- **Controllers:** `laravel/app/Http/Controllers/` (Kegiatan, MemoCair, Spj, Dashboard, Auth).

---

## 4. ⌨️ Standar Eksekusi Perintah Terminal
Setelah melakukan perubahan kode:
```bash
# Selalu bersihkan cache Laravel setelah update view/config
php artisan view:clear
php artisan optimize:clear

# Jika ada perubahan file TypeScript/React di frontend
npm run build
```
