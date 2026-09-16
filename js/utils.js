/**
 * js/utils.js
 * Fungsi pembantu untuk rekap statistik absensi
 */
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

