# 🎨 Panduan Lengkap Design System & Standar UI/UX Cosco UNS
> **Dokumen Spesifikasi Visual, Warna, Tipografi, Komponen UI, dan Aturan Desain Eksekutif untuk Super App Cost Control (Cosco)**

---

## 1. 🌈 Palet Warna Resmi (*Color Palette & Tokens*)

Design system ini menggunakan kombinasi warna **UNS Executive Navy Blue**, **Warm Gold/Amber**, dan **Emerald Green** dengan latar belakang **Clean White & Slate Dark Canvas**.

### A. Palet Warna Utama (*Primary & Brand Colors*)

| Nama Token | Kode HEX | Nilai Tailwind CSS | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **UNS Midnight Blue** | `#020617` / `#0F172A` | `bg-slate-950` / `bg-slate-900` | Latar Header Navbar Dark, Sidebar Eksekutif |
| **UNS Deep Navy** | `#172554` / `#1E3A8A` | `bg-blue-950` / `bg-blue-900` | Header Tabel Anggaran, Aksen Kontainer |
| **UNS Royal Blue** | `#1E40AF` / `#2563EB` | `bg-blue-800` / `bg-blue-600` | Tombol Utama (*Primary Button*), Link Aktif |
| **UNS Soft Blue Tint**| `#EFF6FF` / `#DBEAFE` | `bg-blue-50` / `border-blue-200` | Kartu Summary Anggaran, Badge Info |

### B. Palet Warna Aksen & Status Verifikasi

| Status / Peruntukan | Kode HEX | Nilai Tailwind CSS | Contoh Komponen & Arti Status |
| :--- | :--- | :--- | :--- |
| 🟢 **Disetujui / Selesai / Cair** | `#059669` / `#10B981` | `bg-emerald-600` / `text-emerald-400` | Status Memo Cair Disetujui, SPJ Valid |
| 🟠 **Menunggu Verifikasi (Pending)** | `#D97706` / `#F59E0B` | `bg-amber-600` / `bg-amber-500` | Status Usulan Kegiatan / SPJ Menunggu Review |
| 🔵 **Draft / Proses Pengusulan** | `#2563EB` / `#1D4ED8` | `bg-blue-50` / `border-blue-300` | Usulan Kegiatan sedang dalam penyusunan |
| 🔴 **Ditolak / Perlu Revisi** | `#DC2626` / `#EF4444` | `bg-red-600` / `text-red-400` | Berkas TOR / SPJ perlu perbaikan |

---

## 2. 🔤 Standar Tipografi (*Typography System*)

```html
<!-- Link font resmi di <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
```

- **Judul Halaman & Header Tabel:** `Montserrat` (Bold 700 / ExtraBold 800)
- **Teks Isi, Form Input & Angka Nominal:** `Inter` / `Plus Jakarta Sans` (Regular 400 / Medium 500 / Bold 700)

---

## 3. 🚫 Aturan Desain Anti-AI Slop (*Design Constraints*)
1. ❌ **HILANGKAN BENTUK KAPSUL (`rounded-full`) PADA TABEL & FORM:**
   Gunakan sudut tegas membulat modern: `rounded-lg` (8px) atau `rounded-xl` (12px).
2. ❌ **DILARANG MENGGUNAKAN FONT MONOSPACE UNTUK TEKS BIASA:**
   Gunakan font proporsional (`Montserrat` / `Inter`).
3. ❌ **HINDARI KARTU BERTUMPUK (*Card-in-Card Clutter*):**
   Gunakan hierarki *Single-Layer Card* berbatas `border border-slate-200`.
4. ❌ **DILARANG MENGGUNAKAN EMOJI PADA UI/NAVIGASI (ANTI-AI SLOP):**
   Dilarang keras memakai karakter emoji sistem (📋, 🔄, 🛡️, 🚀, dll.) pada menu, tombol, badge, atau tabel UI. Seluruh ikon **WAJIB menggunakan Custom SVG Vector Icons** (Lucide / Tailwind Heroicons) dengan styling container yang proporsional dan elegan.
