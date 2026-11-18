# Praktikum 13
Nama Mahasiswa: Nazwa Salwa Adellia
NPM : 2440304021
Lokal : A1
Angkatan : 2024

# Pemrograman Web - Modul 13
Praktikum Pemrograman Web (OBE)

# AbsensiQR - Landing Page System

Proyek ini merupakan implementasi halaman landing page untuk sistem absensi berbasis QR Code (**AbsensiQR**). Proyek dibuat menggunakan struktur HTML5 murni yang mematuhi standar aksesibilitas web dan hirarki dokumen yang baik.

---
## Security Review & Remediation (Modul 13)

### Tabel Temuan Keamanan
| ID | Risiko | Bukti | Severity | Perbaikan | Retest Status | Residual Risk |
|---|---|---|---|---|---|---|
| SEC-01 | **A01 - Broken Access Control (CSRF)**: Endpoint mutasi berbasis session (`POST`/`PUT`/`DELETE /api/alats.php`) belum memverifikasi token anti-CSRF. | Request `POST /api/alats.php` dengan cookie sesi aktif dapat dieksekusi tanpa validasi token tambahan. | Medium | Menambahkan helper `getCsrfToken()` (`random_bytes(32)`) saat login dan `verifyCsrfToken()` menggunakan `hash_equals()` di `helpers/auth.php` serta `api/alats.php`. | **FIXED** (Request tanpa `X-CSRF-Token` ditolak `403 Forbidden`; dengan token valid sukses `201 Created`) | Token disimpan pada session server; protokol HTTPS belum diaktifkan pada server lokal Laragon. |
| SEC-02 | **A02 - Security Misconfiguration & Input Validation**: Potensi kebocoran detail koneksi database saat gagal terhubung dan belum adanya batas panjang karakter input (`nama`/`kategori`). | `config/database.php` belum menonaktifkan `display_errors` dan panjang string input belum dibatasi. | Medium | Menambahkan `ini_set('display_errors', '0')`, blok `try-catch` dengan pesan error generik di `config/database.php`, serta validasi `mb_strlen()` di `api/alats.php`. | **FIXED** (Input melebihi batas ditolak `422` dan kegagalan koneksi mengembalikan error generik `500`) | Pembatasan jumlah request (*rate limiting*) pada endpoint login/API belum diterapkan. |

### Hasil Dependency Audit
- **Perintah:** `composer audit`
- **Hasil:** `No security vulnerability advisories found.` (Tidak ditemukan kerentanan yang diketahui pada dependensi `vlucas/phpdotenv`).

## Jawaban Latihan Security Review (Modul 13)

### 1. Identifikasi Tiga Titik Input & Tiga Titik Output
**Titik Input:**
1. **Payload JSON Login (`api/login.php`):** Input `email` dan `password` divalidasi dengan `filter_var(..., FILTER_VALIDATE_EMAIL)` dan diproses lewat PDO *Prepared Statement*.
2. **Parameter Query URL (`api/alats.php`):** Parameter `$_GET['id']`, `kategori`, `page`, dan `limit` divalidasi dengan `FILTER_VALIDATE_INT` serta *parameter binding* (`bindValue`).
3. **Payload JSON & Header CSRF (`api/alats.php`):** Input `nama`, `kategori`, `jumlah`, `kondisi` divalidasi panjangnya (`mb_strlen`) dan diverifikasi token anti-CSRF-nya (`hash_equals`).

**Titik Output:**
1. **Respons JSON API (`api/alats.php` & `api/login.php`):** Mengirim header eksplisit `Content-Type: application/json; charset=utf-8` sehingga output tidak dieksekusi sebagai HTML.
2. **Rendering DOM (`dashboard.html`):** Menggunakan `.textContent` (bukan `.innerHTML`) saat menampilkan nama dan peran pengguna ke halaman web untuk mencegah XSS.
3. **Pesan Error Server (`config/database.php`):** Menonaktifkan `display_errors` (`0`) dan hanya mengirim pesan error generik (`500`) tanpa membocorkan detail DSN/database.

### 2. Pengujian Access Control `DELETE` sebagai `viewer`
- **Skenario:** Login sebagai `viewer@pemweb.test`, lalu mengirim request manual `DELETE /api/alats.php?id=1` di Thunder Client.
- **Hasil:** Server menolak request dengan status **`403 Forbidden`** (`{"error": "Akses ditolak"}`) dan data di database tetap utuh.

### 3. Identifikasi Secret & Strategi Penyimpanan
- **Secret:** File `.env` yang berisi konfigurasi kredensial database (`DB_USER`, `DB_PASS`, `DB_NAME`).
- **Strategi Penyimpanan:** Menyimpan kredensial di `.env` yang dibaca via `phpdotenv`, mendaftarkan `.env` ke `.gitignore` agar tidak ter-commit ke GitHub, serta menyediakan `.env.example` tanpa nilai password asli sebagai templat.

## Cara Menjalankan Melalui Laragon 5

1. Pastikan aplikasi **Laragon 5** sudah terpasang di komputer Anda.
2. Salin/kloning folder proyek ini ke dalam direktori `www` Laragon:
   ```text
   C:\laragon\www\pemweb-obe
