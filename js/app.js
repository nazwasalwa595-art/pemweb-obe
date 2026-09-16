/**
 * js/app.js
 * Pengolahan data absensi kelas untuk AbsensiQR
 */
import { ringkasAbsensi } from './utils.js';

// Array objek data absensi pengguna AbsensiQR
const dataAbsensi = [
  { id: 1, nama: 'Budi Santoso', peran: 'Siswa', hadir: 14, status: 'Hadir' },
  { id: 2, nama: 'Siti Aminah', peran: 'Mahasiswa', hadir: 15, status: 'Hadir' },
  { id: 3, nama: 'Ahmad Dahlan', peran: 'Siswa', hadir: 8, status: 'Perlu Cek' }
];

// 1. Filter: Mengambil pengguna dengan status "Hadir"
const pesertaHadir = dataAbsensi.filter(item => item.status === 'Hadir');

// 2. Map: Mengambil daftar nama pengguna
const daftarNama = dataAbsensi.map(({ nama }) => nama);

// 3. Reduce: Menghitung total sesi kehadiran
const totalKehadiran = dataAbsensi.reduce((total, item) => total + item.hadir, 0);

// Tampilkan di Console
console.log('=== DATA PESERTA HADIR ===');
console.table(pesertaHadir);

console.log('=== DAFTAR NAMA ===');
console.log(daftarNama);

console.log('=== TOTAL SESI KEHADIRAN ===');
console.log(totalKehadiran);

console.log('=== RINGKASAN STATISTIK ABSENSI ===');
console.log(ringkasAbsensi(dataAbsensi));
