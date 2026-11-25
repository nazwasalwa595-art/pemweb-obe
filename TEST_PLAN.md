# Test Plan & Laporan Pengujian Aplikasi AbsensiQR

- **Nama Proyek:** AbsensiQR (Sistem Presensi Berbasis QR Code)
- **Lingkungan Uji Lokal (Baseline):** `http://localhost/pemweb-obe/` (Laragon 5, PHP 8.4, MySQL/MariaDB)
- **Lingkungan Uji Online (Staging/Production):** `<ISI_URL_HOSTING_ONLINE_KAMU>`
- **Direktori Bukti Screenshot:** `assets/screenshots/`

---

## 1. Daftar Skenario Pengujian (TC-01 s.d. TC-22)

| ID | Kategori | Skenario & Langkah Pengujian | Expected Result | Actual Result | Status & Bukti |
|:---:|:---|:---|:---|:---|:---:|
| **TC-01** | Authentication | Daftar akun baru lewat `register.html` (username angka 10 digit & password $\ge 8$) | `201`, muncul pesan sukses pendaftaran lalu diarahkan ke halaman login | `201 Created`, pesan sukses tampil dan otomatis diarahkan ke `login.html` | Pass ([SS-01](assets/screenshots/01-tc01-register-sukses.png)) |
| **TC-02** | Validation | Daftar lewat `register.html` dengan username berisi huruf (mis. `abc12345`) | `422`, pesan error validasi tampil, tidak ada data tersimpan | `422 Unprocessable Entity`, pesan validasi muncul dan data ditolak | Pass ([SS-02](assets/screenshots/02-tc02-register-huruf.png)) |
| **TC-03** | Validation | Daftar lewat `register.html` dengan username yang sudah terdaftar | `409` `Username atau email sudah terdaftar` | `409 Conflict`, muncul pesan `Username atau email sudah terdaftar` | Pass ([SS-03](assets/screenshots/03-tc03-register-duplikat.png)) |
| **TC-04** | Authentication | Login menggunakan akun **Dosen** dengan data benar | `200`, berhasil diarahkan ke `dashboard-guru.html` | `200 OK`, login berhasil dan diarahkan ke `dashboard-guru.html` | Pass ([SS-04](assets/screenshots/04-tc04-login-dosen.png)) |
| **TC-05** | Authentication | Login menggunakan akun **Mahasiswa** dengan data benar | `200`, berhasil diarahkan ke `dashboard-siswa.html` | `200 OK`, login berhasil dan diarahkan ke `dashboard-siswa.html` | Pass ([SS-05](assets/screenshots/05-tc05-login-mahasiswa.png)) |
| **TC-06** | Authentication | Login dengan password salah | `401` `Username atau password salah` | `401 Unauthorized`, muncul pesan generik `Username atau password salah` | Pass ([SS-06](assets/screenshots/06-tc06-login-password-salah.png)) |
| **TC-07** | Authentication | Mengakses `api/sesi.php` dalam kondisi belum login | `401 Unauthorized` | `401 Unauthorized`, akses endpoint ditolak sistem | Pass ([SS-07](assets/screenshots/07-tc07-api-tanpa-login.png)) |
| **TC-08** | Role | Login sebagai **Mahasiswa**, lalu memanggil `GET api/sesi.php` di DevTools/Thunder Client | `403` `Akses ditolak` | `403 Forbidden`, muncul respon `Akses ditolak` | Pass ([SS-08](assets/screenshots/08-tc08-role-mahasiswa-api-sesi.png)) |
| **TC-09** | Role | Login sebagai **Dosen**, lalu membuka URL `dashboard-siswa.html` di browser | Otomatis dialihkan kembali ke `dashboard-guru.html` | Halaman otomatis redirect kembali ke `dashboard-guru.html` | Pass ([SS-09](assets/screenshots/09-tc09-role-dosen-buka-siswa.png)) |
| **TC-10** | CRUD | Dosen membuat sesi `QR-PEMWEB-01` dengan batas waktu masa depan | `201`, sesi muncul di daftar dan gambar QR Code tampil | `201 Created`, sesi tersimpan di daftar dan gambar QR Code tampil | Pass ([SS-10](assets/screenshots/10-tc10-dosen-buat-sesi-qr.png)) |
| **TC-11** | Validation | Dosen membuat sesi dengan kode QR kosong atau kode QR duplikat | `422` (kosong) / `409` (duplikat) | `422` saat kode QR kosong dan `409` saat kode QR duplikat | Pass ([SS-11](assets/screenshots/11-tc11-sesi-kosong-duplikat.png)) |
| **TC-12** | CRUD | Dosen mengubah nama sesi (`PUT`), lalu menghapus sesi (`DELETE`) | `PUT 200` lalu `DELETE 200`, sesi hilang dari daftar | `PUT 200` & `DELETE 200`, sesi berhasil diperbarui lalu terhapus | Pass ([SS-12](assets/screenshots/12-tc12-dosen-edit-hapus-sesi.png)) |
| **TC-13** | CSRF | Dosen sudah login, mengirim `POST api/sesi.php` tanpa header `X-CSRF-Token` | `403` `Token CSRF tidak valid` | `403 Forbidden`, permintaan ditolak dengan pesan `Token CSRF tidak valid` | Pass ([SS-13](assets/screenshots/13-tc13-csrf-tanpa-token.png)) |
| **TC-14** | CRUD | Mahasiswa absen lewat input manual kode `QR-PEMWEB-01` status Hadir | `201`, riwayat mahasiswa bertambah dan tabel rekap Dosen menampilkan nama mahasiswa | `201 Created`, riwayat kehadiran bertambah dan rekap Dosen terisi | Pass ([SS-14](assets/screenshots/14-tc14-mahasiswa-absen-rekap.png)) |
| **TC-15** | Validation | Mahasiswa mencoba absen dua kali pada sesi yang sama | `409` `Anda sudah presensi pada sesi ini` | `409 Conflict`, presensi ganda ditolak dengan pesan sesuai | Pass ([SS-15](assets/screenshots/15-tc15-absen-dua-kali.png)) |
| **TC-16** | API Error | Mahasiswa mencoba absen dengan kode QR yang tidak terdaftar | `404` `Kode QR tidak ditemukan` | `404 Not Found`, muncul pesan `Kode QR tidak ditemukan` | Pass ([SS-16](assets/screenshots/16-tc16-kode-qr-tidak-ada.png)) |
| **TC-17** | API Error | Mahasiswa mencoba absen pada sesi yang batas waktunya sudah lewat | `422` `Sesi sudah berakhir` | `422 Unprocessable Entity`, muncul pesan `Sesi sudah berakhir` | Pass ([SS-17](assets/screenshots/17-tc17-sesi-kadaluarsa.png)) |
| **TC-18** | API Error | Memanggil `GET api/sesi.php?id=abc` sebagai Dosen | `400 Bad Request` | `400 Bad Request`, parameter ID tidak valid ditolak | Pass ([SS-18](assets/screenshots/18-tc18-parameter-id-invalid.png)) |
| **TC-19** | API Error | Matikan service MySQL di Laragon, lalu mencoba login | `500` dengan pesan error generik tanpa membocorkan detail host/DSN/password | `500 Internal Server Error`, hanya pesan generik aman yang tampil | Pass ([SS-19](assets/screenshots/19-tc19-mysql-mati-error-500.png)) |
| **TC-20** | Authentication | Klik tombol **Keluar**, lalu mencoba membuka halaman dashboard kembali | Otomatis dialihkan ke `login.html` | Session terhapus dan akses dashboard dialihkan ke `login.html` | Pass ([SS-20](assets/screenshots/20-tc20-logout-redirect.png)) |
| **TC-21** | Responsive | Membuka halaman aplikasi pada DevTools Device Toolbar lebar `320px` | Teks terbaca jelas dan tidak ada *horizontal scroll* | Layout responsif 1 kolom, teks terbaca jelas, bebas *horizontal scroll* | Pass ([SS-21](assets/screenshots/21-tc21-responsive-320px.png)) |
| **TC-22** | Accessibility | Hasil audit Lighthouse Accessibility setelah perbaikan di semua halaman | Skor $\ge 90$, semua gambar ber-`alt`, semua input ber-`label` | Skor Lighthouse Accessibility $\ge 90$, seluruh aturan terpenuhi | Pass ([SS-22](assets/screenshots/22-tc22-lighthouse-accessibility.png)) |

---

## 2. Ringkasan Hasil Pengujian

- **Total Skenario Diuji:** 22 Test Case (`TC-01` – `TC-22`)
- **Lulus (Pass):** 22 (100%)
- **Gagal (Fail):** 0 (0%)
- **Kesimpulan:** Seluruh fungsi autentikasi (username angka NIM/NIP), otorisasi peran (Dosen/Guru & Mahasiswa/Siswa), CRUD sesi & presensi QR, proteksi CSRF, penanganan error API aman, tampilan responsif `320px`, serta audit aksesibilitas Lighthouse telah berjalan sesuai kebutuhan sistem.