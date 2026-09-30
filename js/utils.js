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

/* ==========================================================================
   FUNGSI VALIDASI FORM (MODUL 6 - LATIHAN E)
   ========================================================================== */

/**
 * Validasi data form alat inventaris dengan aturan spesifik
 * @param {Object} data - Object data ter-normalize
 * @returns {Object} errors - Object berisi pesan error spesifik per field
 */
export function validateForm(data) {
  const errors = {};

  // 1. Validasi Nama Alat (Pesan kosong vs Pesan format/panjang salah)
  if (!data.namaAlat) {
    errors.namaAlat = 'Nama alat wajib diisi, tidak boleh kosong.'; // Field Kosong
  } else if (data.namaAlat.length < 3) {
    errors.namaAlat = 'Format nama alat salah: minimal harus 3 karakter.'; // Format Salah
  }

  // 2. Latihan Soal 2: Validasi Kategori (Hanya boleh dari pilihan yang tersedia)
  const opsiKategoriValid = ['Perangkat', 'Kamera', 'Jaringan', 'Aksesori'];
  if (!data.kategori) {
    errors.kategori = 'Kategori alat wajib dipilih.'; // Field Kosong
  } else if (!opsiKategoriValid.includes(data.kategori)) {
    errors.kategori = 'Pilihan kategori tidak valid / tidak sesuai sistem.'; // Pilihan Tidak Valid
  }

  // 3. Validasi Jumlah Unit (Pesan kosong vs Pesan nilai salah)
  if (isNaN(data.jumlah) || data.jumlah === 0) {
    errors.jumlah = 'Jumlah unit wajib diisi.'; // Field Kosong
  } else if (data.jumlah < 1) {
    errors.jumlah = 'Nilai jumlah unit tidak valid: minimal harus 1 item.'; // Nilai Salah
  }

  // 4. Validasi Kondisi
  if (!data.kondisi) {
    errors.kondisi = 'Kondisi barang wajib dipilih.'; // Field Kosong
  }

  // 5. Latihan Soal 1 & 3: Validasi Tanggal Perolehan (Tidak boleh melebihi hari ini)
  if (!data.tanggalPerolehan) {
    errors.tanggalPerolehan = 'Tanggal perolehan wajib diisi.'; // Field Kosong
  } else {
    // Ambil tanggal hari ini (Format YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Cek apakah tanggal perolehan melebihi hari ini
    if (data.tanggalPerolehan > today) {
      errors.tanggalPerolehan = 'Format tanggal tidak valid: tanggal perolehan tidak boleh melebihi tanggal hari ini.'; // Nilai Salah
    }
  }

  return errors;
}