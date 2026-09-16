/* js/utils.js Modul fungsi pembantu (utility) untuk pengolahan & pencarian data AbsensiQR */

// Fungsi ringkasan dari praktikum sebelumnya
export function ringkasAbsensi(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data harus berupa array');
  }

  return {
    totalPeserta: data.length,
    totalHadir: data.reduce((sum, item) => sum + item.hadir, 0),
    perluEvaluasi: data.filter(item => item.status !== 'Hadir').length
  };
}

// Soal 1: Fungsi filter peserta absensi berdasarkan lokasi (ruangan/lab)
export function cariAbsensiSesuaiLokasi(data, lokasiCari) {
  return data.filter(item => item.lokasi === lokasiCari);
}

// Soal 2: Fungsi find peserta absensi berdasarkan ID
export function cariPesertaDenganId(data, idCari) {
  return data.find(item => item.id === idCari);
}

// Soal 3: Fungsi destructuring & template literal untuk ringkasan string
export function buatStringRingkasan(item) {
  // Destructuring properti objek peserta absensi
  const { nama, peran, hadir, status, lokasi } = item;
  
  // Mengembalikan string menggunakan template literal (`...`)
  return `Peserta [${nama}] (${peran}) telah hadir ${hadir} sesi dengan status ${status}, berlokasi di ${lokasi}.`;
}