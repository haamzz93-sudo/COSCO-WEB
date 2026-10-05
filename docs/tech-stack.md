# 🛠️ Technology Stack Specification — Super App Cost Control (Cosco)
> **Daftar Pustaka, Versi Bahasa, Framework, dan Infrastruktur Database Resmi**

---

## 1. ⚙️ Backend Core (Laravel Ecosystem)

| Komponen | Spesifikasi & Versi | Deskripsi & Peran |
| :--- | :--- | :--- |
| **Bahasa Pemrograman** | PHP >= 8.3 | Engine backend utama dengan fitur Typed Properties & Match Expressions |
| **Framework Backend** | Laravel 13.x | Monolithic robust framework dengan Eloquent ORM & Middleware Gates |
| **Adapter SPA** | Inertia.js v2 (PHP Adapter) | Penghubung seamless antara Controller Laravel dan React |
| **Database Engine** | MySQL 8.0 / 8.4 (InnoDB) | Database: `unsmadiun_id_03` dengan foreign key cascading rules |
| **Web Server** | Nginx 1.24+ via aaPanel | Reverse proxy, SSL Termination, & Static Asset Handler |

---

## 2. 💻 Frontend Core (Modern React Ecosystem)

| Komponen | Spesifikasi & Versi | Deskripsi & Peran |
| :--- | :--- | :--- |
| **Framework UI** | React 19.x | Library antarmuka berbasis komponen |
| **Type System** | TypeScript 5.x | Static typing untuk menjamin keamanan tipe data anggaran & kegiatan |
| **CSS Framework** | Tailwind CSS v4 | Utility-first styling dengan custom design tokens UNS |
| **Bundler & Build Tool** | Vite 8.x | Lightning-fast HMR and optimized production asset compiler |
| **Iconography** | Lucide Icons & Custom SVG | Ikon vektor modern yang tajam dan responsif |
| **Client State / Async**| TanStack Query v5 & Formik | Manajemen formulir RAB, validasi input anggaran, dan server caching |

---

## 3. 🔗 Integrasi & Single Sign-On (SSO)
- **SSO Provider:** OAuth2 Provider via UNS Master Data (`unsmadiun.id`).
- **Master Data Synchronization:** Mengonsumsi data program studi, daftar dosen pengampu, dan data akun keuangan terpusat.
- **Session Management:** File-based session driver (24 jam) terproteksi CSRF & HttpOnly cookies.
