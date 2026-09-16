/* js/app.js pengolahan data AbsensiQR */

import { 
  ringkasAbsensi, 
  cariAbsensiSesuaiLokasi, 
  cariPesertaDenganId, 
  buatStringRingkasan 
} from './utils.js';

// Soal 1: Menambahkan properti lokasi pada array objek dataAbsensi
const dataAbsensi = [
  { id: 1, nama: 'Budi Santoso', peran: 'Siswa', hadir: 14, status: 'Hadir', lokasi: 'Lab Komputer 1' },
  { id: 2, nama: 'Siti Aminah', peran: 'Mahasiswa', hadir: 15, status: 'Hadir', lokasi: 'Ruang Kelas 3A' },
  { id: 3, nama: 'Ahmad Dahlan', peran: 'Siswa', hadir: 8, status: 'Perlu Cek', lokasi: 'Lab Komputer 1' }
];

// Soal 1: Filter semua peserta pada lokasi tertentu ("Lab Komputer 1")
const pesertaLabKomputer1 = cariAbsensiSesuaiLokasi(dataAbsensi, 'Lab Komputer 1');
console.log('=== LATIHAN 1: PESERTA DI LAB KOMPUTER 1 (FILTER) ===');
console.table(pesertaLabKomputer1);

// Soal 2: Mencari peserta berdasarkan id (contoh id = 2) menggunakan find
const pesertaDitemukan = cariPesertaDenganId(dataAbsensi, 2);
console.log('=== LATIHAN 2: CARI PESERTA DENGAN ID 2 (FIND) ===');
console.log(pesertaDitemukan);

// Soal 3: Destructuring & template literal untuk menghasilkan string ringkasan
console.log('=== LATIHAN 3: STRING RINGKASAN SETIAP PESERTA ===');
dataAbsensi.forEach(item => {
  const ringkasanText = buatStringRingkasan(item);
  console.log(ringkasanText);
});

// Ringkasan Statistik Keseluruhan
console.log('=== RINGKASAN STATISTIK ABSENSI ===');
console.log(ringkasAbsensi(dataAbsensi));

