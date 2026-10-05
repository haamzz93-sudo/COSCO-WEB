# COSCO — Cost Control System (PSDKU UNS Kampus Madiun)

> **Sistem Informasi Manajemen Pengendalian Biaya, TOR, RAB, Memo Cair, dan Pertanggungjawaban (SPJ) PSDKU Universitas Sebelas Maret Kampus Madiun.**

---

## 📌 Ringkasan Proyek
COSCO (Cost Control System) adalah aplikasi terintegrasi untuk pengelolaan anggaran kegiatan tridharma perguruan tinggi di lingkungan PSDKU UNS Kampus Madiun. Sistem ini mencakup alur lengkap:
1. **Perencanaan & Pengajuan:** Penyusunan Dokumen KAK (Kerangka Acuan Kerja), Jadwal Pelaksanaan, dan Rincian Anggaran Belanja (RAB).
2. **Verifikasi & Persetujuan:** Validasi berjenjang oleh Koordinator Program Studi, Sub Bagian Keuangan, dan Wakil Dekan.
3. **Pencairan Anggaran (Memo Cair):** Pengajuan pencairan termin dana kegiatan dan klaim perjalanan dinas.
4. **Pertanggungjawaban Keuangan (SPJ):** Unggah bukti kuitansi, verifikasi perpajakan, dan pelaporan SPJ riil.

---

## 🛠️ Tech Stack
- **Backend:** Laravel 11 (PHP 8.2 / 8.1)
- **Frontend:** React 18 + TypeScript + Inertia.js
- **Build Engine & Bundler:** Vite 6 + TailwindCSS + Flowbite React
- **Database:** MySQL 8.0
- **Integrasi Eksternal:** SSO UNS Madiun & WhatsApp Gateway Wablas

---

## 🚀 Panduan Setup Lingkungan Lokal (Local Development)

### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- PHP >= 8.1 dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `bcmath`, `curl`, `xml`
- Composer (v2.x)
- Node.js (v18.x atau v20.x) & npm
- MySQL Server

### 2. Kloning Repositori
```bash
git clone https://github.com/haamzz93-sudo/COSCO-.git
cd COSCO-
```

### 3. Instalasi Dependensi Backend & Frontend
```bash
# Instal dependensi PHP
composer install

# Instal dependensi Node.js / React
npm install
```

### 4. Konfigurasi Environment (`.env`)
Salin berkas contoh environment dan sesuaikan konfigurasi database lokal Anda:
```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan baris database pada berkas `.env`:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_cosco_local
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Migrasi Database
```bash
php artisan migrate
```
*(Catatan: Skrip tambahan migrasi dan struktur khusus perjalanan dinas tersedia pada folder `docs/create_tables_perjalanan_dinas.sql`).*

### 6. Menjalankan Server Development
Buka 2 tab terminal terpisah:

**Terminal 1 (Backend API & Inertia Server):**
```bash
php artisan serve
```

**Terminal 2 (Vite Frontend Hot-Reload):**
```bash
npm run dev
```

Akses aplikasi di browser melalui: `http://127.0.0.1:8000`

---

## 👥 Alur Kerja Kolaborasi Git (Git Workflow)

Untuk menjaga stabilitas kode bersama tim (Ilham & Mas Kahfi):
1. **Branch Utama (`main`):** Hanya berisi kode yang sudah stabil dan siap deploy ke VPS produksi.
2. **Branch Fitur / Perbaikan:** Selalu buat branch baru untuk setiap fitur atau perbaikan bug:
   ```bash
   git checkout -b fitur/nama-fitur
   # Lakukan perubahan kode
   git add .
   git commit -m "feat: deskripsi perubahan"
   git push origin fitur/nama-fitur
   ```
3. **Pull Request (PR):** Buka Pull Request ke branch `main` agar rekan tim dapat mereview kode sebelum digabungkan.
4. **Update Kode Terbaru:** Sebelum mulai bekerja, selalu sinkronkan kode dari remote:
   ```bash
   git checkout main
   git pull origin main
   ```

---

## 📂 Struktur Direktori Utama
```
├── app/                  # Controller, Models, Repositories, Middleware
│   ├── Http/Controllers/Api/  # REST API Controllers (TorController, MemoCairController, dll)
│   └── Models/          # Eloquent Database Models
├── config/               # Konfigurasi sistem Laravel
├── database/             # Migrasi & Seeder Database
├── docs/                 # Panduan sistem, alur workflow, dan skrip SQL
├── public/               # Public assets & hasil build Vite (public/build)
├── resources/            # Frontend Source Code
│   ├── css/              # Tailwind CSS styling
│   └── js/               # Inertia React Components & Pages
│       ├── components/   # Komponen UI (Buttons, Modals, Tables, Forms)
│       └── pages/        # Halaman Aplikasi (Dashboard, TOR, RAB, SPJ)
├── routes/               # Definisi Route Web, API, dan Dashboard
└── vite.config.ts        # Konfigurasi bundler Vite + React
```

---

## 📄 Lisensi & Hak Cipta
© 2026 PSDKU Universitas Sebelas Maret (UNS) Kampus Madiun. Seluruh hak cipta dilindungi undang-undang.
