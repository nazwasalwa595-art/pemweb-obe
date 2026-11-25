# Praktikum 14
Nama Mahasiswa: Nazwa Salwa Adellia
NPM : 2440304021
Lokal : A1
Angkatan : 2024

# Pemrograman Web - Modul 14
Praktikum Pemrograman Web (OBE)

# AbsensiQR

Aplikasi absensi berbasis QR Code. Dosen/guru membuat sesi dan menampilkan QR Code; siswa/mahasiswa
melakukan scan (kamera atau input manual) dan riwayatnya tercatat otomatis.
Teknologi: PHP 8.4, MySQL (PDO), HTML5, CSS3, JavaScript (ES Modules).\

## 🌐 Lingkungan Uji & Akun Demo (Pertemuan 14)
* **URL Aplikasi (Laragon 5):** `http://localhost/pemweb-obe/`
* **Status Publikasi:** Pengujian tervalidasi penuh pada lingkungan lokal (`localhost` / PHP 8.4)
* **Akun Demo Guru/Dosen:** Username `198501012015041001` | Password `password123`
* **Akun Demo Siswa/Mahasiswa:** Username `2440304021` | Password `password123`

---

## 📊 Hasil Pemeriksaan Kualitas (Lighthouse Before–After)
Pengujian kualitas dilakukan pada halaman utama dan dashboard menggunakan Chrome DevTools Lighthouse:

| Metrik Audit | Sebelum Perbaikan (Before) | Sesudah Perbaikan (After) | Status |
| :--- | :---: | :---: | :---: |
| **Accessibility** | 78 | **98** | Memenuhi ($\ge 90$) |
| **Performance** | 84 | **95** | Meningkat |

### Tiga Perbaikan Prioritas yang Dilakukan
1. **Penambahan Atribut `alt` pada Seluruh Gambar (`<img>`):** Menambahkan deskripsi `alt` yang informatif pada ilustrasi QR Code serta `alt=""` untuk elemen dekoratif.
2. **Penautan `<label for="...">` pada Semua Input Form:** Memastikan seluruh kolom input (`username`, `password`, `nama_sesi`, `kode_qr`) terhubung dengan `id` masing-masing.
3. **Optimasi Performa & Kontras Warna:** Menambahkan atribut `defer` pada skrip JavaScript serta menyesuaikan rasio kontras warna tombol dan teks agar terbaca jelas hingga lebar layar `320px`.

---

## Cara Menjalankan di Laragon 5

1. Salin folder proyek ke `C:\laragon\www\pemweb-obe`, lalu klik **Start All** di Laragon.
2. Di Terminal Laragon: `cd C:\laragon\www\pemweb-obe` lalu `composer install`.
3. Salin `.env.example` menjadi `.env` (DB_NAME=pemweb_obe, DB_USER=root, DB_PASS kosong).
4. Buka HeidiSQL, jalankan `database/schema.sql` (File > Run SQL file).
5. Isi akun contoh: `php database/seed_user.php`.
6. Buka `http://localhost/pemweb-obe/`.

Akun contoh (password `password123`): Dosen `198001012005011001`, Mahasiswa `2440000001`.

Catatan: kamera hanya bisa dipakai di `localhost` atau HTTPS. Jika tidak tersedia, gunakan input manual.
