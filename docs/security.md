# 🛡️ Panduan Keamanan Sistem & Hardening Server — Cosco UNS
> **Standar Keamanan Aplikasi (Anti-Hack) & Optimasi Infrastruktur Anti-Down Server untuk Super App Cost Control**

---

## 1. 🛑 Perlindungan Terhadap Serangan Siber (Anti-Hack)

### A. Pencegahan SQL Injection & Integritas Transaksi Keuangan
- Seluruh mutasi anggaran dan pencatatan kegiatan wajib menggunakan **Eloquent ORM** dengan transaksi database (`DB::transaction()`) untuk mencegah *race condition* pada pemotongan pagu anggaran:
  ```php
  DB::transaction(function () use ($request) {
      $kegiatan = Kegiatan::create($validatedData);
      // Simpan rincian belanja
  });
  ```

### B. Validasi Berkas Bukti SPJ & TOR (Anti-Malware)
- Validasi berkas upload kwitansi, nota, dan dokumen TOR:
  ```php
  $request->validate([
      'file_tor' => 'required|file|mimes:pdf,docx|max:10240', // Maks 10 MB
      'bukti_spj' => 'required|file|mimes:pdf,jpg,png|max:10240',
  ]);
  ```
- Simpan berkas dengan nama hash acak (`$file->hashName()`) di direktori `storage/app/public/dokumen/`.

### C. Rate Limiting & Proteksi Brute Force
- Pasang rate limiter pada route login dan route mutasi anggaran:
  ```php
  RateLimiter::for('login', function (Request $request) {
      return Limit::perMinute(5)->by($request->ip() . $request->input('username'));
  });
  ```

---

## 2. ⚡ Pencegahan Server Down & Optimasi Trafik (Anti-Crash)
- **Nginx Rate Limiting:** Pasang `limit_req zone=one burst=20 nodelay;` untuk menahan spam request.
- **PHP-FPM Tuning:** Sesuaikan `pm.max_children = 50` dan `pm.max_requests = 1000`.
- **Cache Produksi:** Jalankan `php artisan config:cache`, `route:cache`, dan `view:cache`.
- **MySQL Buffer Pool:** Set `innodb_buffer_pool_size` ke 50%-60% kapasitas RAM server.

---

## 3. 🔒 Izin Berkas (*File Permissions*)
```bash
chown -R www:www /www/wwwroot/cosco.unsmadiun.id
find /www/wwwroot/cosco.unsmadiun.id -type d -exec chmod 755 {} \;
find /www/wwwroot/cosco.unsmadiun.id -type f -exec chmod 644 {} \;
chmod -R 775 /www/wwwroot/cosco.unsmadiun.id/laravel/storage
chmod 600 /www/wwwroot/cosco.unsmadiun.id/laravel/.env
```
