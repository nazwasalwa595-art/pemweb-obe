# Praktikum 1
Nama Mahasiswa: Nazwa Salwa Adellia
NPM : 2440304021
Lokal : A1
Angkatan : 2024

# Pemrograman Web - Modul 1
Praktikum Pemrograman Web (OBE)

# AbsensiQR - Landing Page System

Proyek ini merupakan implementasi halaman landing page untuk sistem absensi berbasis QR Code (**AbsensiQR**). Proyek dibuat menggunakan struktur HTML5 murni yang mematuhi standar aksesibilitas web dan hirarki dokumen yang baik.

---
## Pertemuan 7 - Web API, Fetch, JSON, dan REST API

### 1. Dokumentasi Endpoint API
- **Endpoint Utama (Public REST API):** `https://jsonplaceholder.typicode.com/users`
- **Fallback Lokal (Offline Mode):** `./data/users.json`
- **HTTP Method:** `GET`
- **Status Response Success:** `200 OK`
- **Format Data:** `JSON` (Array of Objects)

### 2. Fitur Handling & UI State
- **Async/Await & Fetch API:** Mengambil data publik/lokal secara asinkron tanpa reload halaman.
- **Error Handling:** Pengecekan atribut `response.ok` dan pelemparan error HTTP status.
- **Loading State:** Menampilkan indikator teks *"Memuat data dari API..."* saat proses fetch berlangsung.
- **Error State:** Menampilkan pesan bantuan ramah berwarna merah jika jaringan terputus atau endpoint gagal diakses.

### Jawaban Latihan 3: Contoh POST Resource Baru & Header Content-Type
#### A. Contoh Kode JavaScript (POST Request ke API):
```javascript
async function tambahAlatBaru(dataAlat) {
  try {
    const response = await fetch('[https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(dataAlat)
    });

    if (!response.ok) {
      throw new Error(`Gagal mengirim data (HTTP ${response.status})`);
    }

    const hasil = await response.json();
    console.log('Resource berhasil dibuat di server:', hasil);
  } catch (error) {
    console.error('POST Error:', error);
  }
}

// Contoh Pemanggilan Fungsi:
tambahAlatBaru({
  nama: 'Barcode Scanner Wireless',
  kategori: 'Perangkat',
  jumlah: 3,
  kondisi: 'Baik'
});

## Cara Menjalankan Melalui Laragon 5

1. Pastikan aplikasi **Laragon 5** sudah terpasang di komputer Anda.
2. Salin/kloning folder proyek ini ke dalam direktori `www` Laragon:
   ```text
   C:\laragon\www\pemweb-obe
