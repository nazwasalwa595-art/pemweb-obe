# Praktikum 12
Nama Mahasiswa: Nazwa Salwa Adellia
NPM : 2440304021
Lokal : A1
Angkatan : 2024

# Pemrograman Web - Modul 12
Praktikum Pemrograman Web (OBE)

# AbsensiQR - Landing Page System

Proyek ini merupakan implementasi halaman landing page untuk sistem absensi berbasis QR Code (**AbsensiQR**). Proyek dibuat menggunakan struktur HTML5 murni yang mematuhi standar aksesibilitas web dan hirarki dokumen yang baik.

---
## Modul 12: Autentikasi & Otorisasi

### 1. Alur Login Berbasis Session
[Client] --(POST email/password)--> [Server PHP]
                                          | Verify password_hash()
                                          v
[Client] <-- (Cookie: PHPSESSID) --- [Simpan Session ID di Server/Memory]

### 2. Alur Hipotetis Berbasis JWT (JSON Web Token)
[Client] --(POST email/password)--> [Server PHP]
                                          | Verify & Generate Signed JWT
                                          v
[Client] <-- (Bearer Token JWT) ---- [Server Stateless (Tanpa simpan Session)]

### 3. Perbedaan Utama Session vs JWT
- **State:** Session bersifat *Stateful* (server menyimpan state pengguna di memori/server), sedangkan JWT bersifat *Stateless* (state tersimpan penuh dalam payload token terenkripsi/signed).
- **Penyimpanan Token:** Session ID disimpan di Cookie browser (`HttpOnly`), sedangkan JWT biasanya disimpan di `localStorage` / `sessionStorage` / HTTP-Only Cookie.
- **Logout / Revocation:** Session cukup dihapus dari server (`session_destroy()`), sedangkan JWT membutuhkan mekanisme *Token Blacklist* / *Refresh Token*.

## Cara Menjalankan Melalui Laragon 5

1. Pastikan aplikasi **Laragon 5** sudah terpasang di komputer Anda.
2. Salin/kloning folder proyek ini ke dalam direktori `www` Laragon:
   ```text
   C:\laragon\www\pemweb-obe
