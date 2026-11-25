import { $, request, pesan, tampil, muatUser } from './common.js';

let scanner = null;

async function muatRiwayat() {
  const r = await request('presensi.php');
  const tbody = $('#riwayat-body');
  tbody.replaceChildren();
  if (!r.ok) { tampil($('#riwayat-message'), pesan(r)); return; }
  $('#riwayat-message').textContent = r.data.count ? '' : 'Belum ada riwayat kehadiran.';
  r.data.data.forEach((row) => {
    const tr = document.createElement('tr');
    [row.nama_sesi, row.kode_qr, row.waktu_absen, row.status].forEach((v) => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.append(td);
    });
    tbody.append(tr);
  });
}

async function kirimPresensi(kode) {
  const summary = $('#scan-summary');
  const r = await request('presensi.php', {
    method: 'POST',
    body: { kode_qr: kode.trim(), status: $('#status').value },
  });
  tampil(summary, pesan(r), r.ok);
  if (r.ok) { $('#form-manual').reset(); muatRiwayat(); }
}

async function hentikanScan() {
  if (scanner) {
    try { await scanner.stop(); scanner.clear(); } catch { /* abaikan */ }
    scanner = null;
  }
  $('#btn-scan').hidden = false;
  $('#btn-stop').hidden = true;
}

async function mulaiScan() {
  const summary = $('#scan-summary');
  if (typeof Html5Qrcode === 'undefined') {
    tampil(summary, 'Library scanner gagal dimuat. Gunakan input manual di bawah.');
    return;
  }
  scanner = new Html5Qrcode('reader');
  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      async (teks) => { await hentikanScan(); await kirimPresensi(teks); },
      () => {},
    );
    $('#btn-scan').hidden = true;
    $('#btn-stop').hidden = false;
    summary.textContent = '';
  } catch {
    scanner = null;
    tampil(summary, 'Kamera tidak bisa diakses. Gunakan input manual di bawah.');
  }
}

async function init() {
  const user = await muatUser('Siswa/Mahasiswa');
  if (!user) return;
  muatRiwayat();

  $('#btn-scan').addEventListener('click', mulaiScan);
  $('#btn-stop').addEventListener('click', hentikanScan);
  $('#form-manual').addEventListener('submit', (e) => {
    e.preventDefault();
    const kode = $('#kode-manual').value.trim();
    if (!kode) { tampil($('#scan-summary'), 'Kode QR wajib diisi.'); return; }
    kirimPresensi(kode);
  });
}

init();