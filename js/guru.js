import { $, request, pesan, tampil, muatUser } from './common.js';

let editId = null;
let sesiAktif = null;
let qrTerakhir = '';

function tombol(label, kelas, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = kelas;
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function resetForm() {
  editId = null;
  $('#form-sesi').reset();
  $('#judul-form').textContent = 'Buat Sesi Absensi';
  $('#btn-simpan').textContent = 'Buat Sesi';
  $('#btn-batal').hidden = true;
}

function isiForm(s) {
  editId = s.id;
  $('#nama-sesi').value = s.nama_sesi;
  $('#kode-qr').value = s.kode_qr;
  $('#berlaku-sampai').value = s.berlaku_sampai.replace(' ', 'T').slice(0, 16);
  $('#judul-form').textContent = 'Edit Sesi Absensi';
  $('#btn-simpan').textContent = 'Simpan Perubahan';
  $('#btn-batal').hidden = false;
  $('#nama-sesi').focus();
}

function tampilkanQR(kode) {
  if (kode === qrTerakhir) return;
  qrTerakhir = kode;
  const box = $('#qr-box');
  box.replaceChildren();
  new QRCode(box, { text: kode, width: 200, height: 200 }); // library qrcodejs (CDN)
  $('#qr-kode').textContent = kode;
  setTimeout(() => box.querySelector('img')?.setAttribute('alt', `QR Code untuk kode ${kode}`), 100);
}

async function muatDetail(id) {
  const r = await request(`sesi.php?id=${id}`);
  if (!r.ok) { tampil($('#list-message'), pesan(r)); return; }

  const { sesi, rekap } = r.data.data;
  $('#panel-detail').hidden = false;
  $('#detail-judul').textContent = `QR Code: ${sesi.nama_sesi}`;
  tampilkanQR(sesi.kode_qr);

  const tbody = $('#rekap-body');
  tbody.replaceChildren();
  $('#rekap-kosong').hidden = rekap.length > 0;
  rekap.forEach((row) => {
    const tr = document.createElement('tr');
    [row.nama, row.username, row.status, row.waktu_absen].forEach((v) => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.append(td);
    });
    tbody.append(tr);
  });
}

function lihat(id) {
  sesiAktif = id;
  qrTerakhir = '';
  muatDetail(id);
  $('#panel-detail').scrollIntoView({ behavior: 'smooth' });
}

async function hapus(id) {
  if (!confirm('Yakin ingin menghapus sesi ini beserta rekap presensinya?')) return;
  const r = await request(`sesi.php?id=${id}`, { method: 'DELETE' });
  if (!r.ok) { tampil($('#list-message'), pesan(r)); return; }
  if (sesiAktif === id) { sesiAktif = null; qrTerakhir = ''; $('#panel-detail').hidden = true; }
  muatDaftar();
}

function buatItem(s) {
  const el = document.createElement('article');
  el.className = 'sesi-item';
  const h = document.createElement('h3');
  h.textContent = s.nama_sesi;
  const p1 = document.createElement('p');
  p1.textContent = `Kode QR: ${s.kode_qr}`;
  const p2 = document.createElement('p');
  p2.textContent = `Berlaku sampai: ${s.berlaku_sampai} | Sudah presensi: ${s.jumlah_presensi}`;
  const aksi = document.createElement('div');
  aksi.className = 'aksi';
  aksi.append(
    tombol('QR & Rekap', '', () => lihat(s.id)),
    tombol('Edit', '', () => isiForm(s)),
    tombol('Hapus', 'hapus', () => hapus(s.id)),
  );
  el.append(h, p1, p2, aksi);
  return el;
}

async function muatDaftar() {
  const r = await request('sesi.php');
  const box = $('#daftar-sesi');
  if (!r.ok) { tampil($('#list-message'), pesan(r)); return; }
  $('#list-message').textContent = r.data.count ? '' : 'Belum ada sesi. Buat sesi pertama Anda di atas.';
  box.replaceChildren(...r.data.data.map(buatItem));
}

async function init() {
  const user = await muatUser('Guru/Dosen');
  if (!user) return;
  muatDaftar();

  $('#form-sesi').addEventListener('submit', async (e) => {
    e.preventDefault();
    const summary = $('#form-summary');
    const body = {
      nama_sesi: $('#nama-sesi').value.trim(),
      kode_qr: $('#kode-qr').value.trim(),
      berlaku_sampai: $('#berlaku-sampai').value,
    };
    if (!body.nama_sesi || !body.kode_qr || !body.berlaku_sampai) {
      tampil(summary, 'Semua kolom wajib diisi.');
      return;
    }
    const r = editId
      ? await request(`sesi.php?id=${editId}`, { method: 'PUT', body })
      : await request('sesi.php', { method: 'POST', body });

    if (r.ok) {
      const idSebelumnya = editId;
      tampil(summary, editId ? 'Sesi diperbarui.' : 'Sesi dibuat.', true);
      resetForm();
      await muatDaftar();
      if (idSebelumnya && idSebelumnya === sesiAktif) { qrTerakhir = ''; muatDetail(sesiAktif); }
    } else {
      tampil(summary, pesan(r));
    }
  });

  $('#btn-batal').addEventListener('click', resetForm);
  $('#btn-refresh').addEventListener('click', () => { if (sesiAktif) muatDetail(sesiAktif); muatDaftar(); });

  // Rekap otomatis diperbarui tiap 10 detik
  setInterval(() => { if (sesiAktif) muatDetail(sesiAktif); }, 10000);
}

init();