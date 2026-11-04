/* js/app.js - Integrasi Full-Stack CRUD API Modul 11 */

import { validateForm } from './utils.js';

const API_URL = 'http://localhost/pemweb-obe/api/alats.php';

// Selection DOM
const daftar = document.querySelector('#daftar-alat');
const apiMessage = document.querySelector('#api-message');
const formAlat = document.querySelector('#form-alat');
const formSummary = document.querySelector('#form-summary');

// Modal Edit DOM
const dialogEdit = document.querySelector('#dialog-edit');
const formEditAlat = document.querySelector('#form-edit-alat');
const btnCancelEdit = document.querySelector('#btn-cancel-edit');

let dataInventaris = [];

// ==========================================
// 1. READ (LOAD DATA DARI API GET)
// ==========================================
async function loadInventarisData() {
  if (apiMessage) {
    apiMessage.textContent = 'Memuat data dari database MySQL...';
    apiMessage.style.color = '#1e293b';
  }

  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Gagal memuat data dari server');
    }

    dataInventaris = result.data;

    if (apiMessage) {
      apiMessage.textContent = `Berhasil memuat ${dataInventaris.length} data alat dari database.`;
      apiMessage.style.color = '#166534';
    }

    renderItems(dataInventaris);

  } catch (error) {
    console.error('Fetch Error:', error);
    if (apiMessage) {
      apiMessage.textContent = 'Gagal terhubung ke API backend.';
      apiMessage.style.color = '#dc2626';
    }
  }
}

// ==========================================
// RENDER DOM & TOMBOL ACTION (EDIT & DELETE)
// ==========================================
function renderItems(items) {
  if (!daftar) return;
  daftar.replaceChildren();

  if (!items || items.length === 0) {
    const pesanKosong = document.createElement('p');
    pesanKosong.textContent = 'Tidak ada data inventaris yang ditemukan.';
    daftar.append(pesanKosong);
    return;
  }

  items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
      <h3>${item.nama}</h3>
      <p>Kategori: <strong>${item.kategori}</strong> | Jumlah: <strong>${item.jumlah} unit</strong> | Kondisi: <strong>${item.kondisi}</strong></p>
      <div class="card-actions" style="margin-top: 10px; display: flex; gap: 8px;">
        <button type="button" class="btn-edit" data-id="${item.id}">Edit</button>
        <button type="button" class="btn-delete" data-id="${item.id}" style="background-color: #dc2626; color: white;">Hapus</button>
      </div>
    `;

    daftar.append(article);
  });
}

// ==========================================
// 2. CREATE (POST DATA KE API DATABASE)
// ==========================================
if (formAlat) {
  formAlat.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Reset pesan error
    const errorSpans = formAlat.querySelectorAll('.error-msg');
    errorSpans.forEach((span) => (span.textContent = ''));

    const rawData = new FormData(formAlat);
    const formData = {
      namaAlat: rawData.get('namaAlat')?.trim() || '',
      kategori: rawData.get('kategori') || '',
      jumlah: Number(rawData.get('jumlah')),
      kondisi: rawData.get('kondisi') || '',
      tanggalPerolehan: rawData.get('tanggalPerolehan') || ''
    };

    // Validasi Client-Side
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      if (formSummary) {
        formSummary.textContent = 'Terdapat kesalahan pada form. Silakan periksa kembali.';
        formSummary.style.color = '#dc2626';
      }
      return;
    }

    // Payload dikirim ke Backend PHP (db: MySQL)
    const payload = {
      nama: formData.namaAlat,
      kategori: formData.kategori,
      jumlah: formData.jumlah,
      kondisi: formData.kondisi
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (formSummary) {
          formSummary.textContent = 'Data berhasil disimpan ke database!';
          formSummary.style.color = '#166534';
        }
        formAlat.reset();
        await loadInventarisData(); // Reload list otomatis dari DB
      } else {
        alert(`Gagal menambah data: ${result.message}`);
      }
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Terjadi kesalahan koneksi ke server saat menyimpan data.');
    }
  });
}

// ==========================================
// 3. UPDATE (PUT DATA VIA MODAL EDIT)
// ==========================================
function bukaModalEdit(id) {
  const item = dataInventaris.find((a) => a.id === Number(id));
  if (!item) return;

  document.querySelector('#edit-id').value = item.id;
  document.querySelector('#edit-nama').value = item.nama;
  document.querySelector('#edit-kategori').value = item.kategori;
  document.querySelector('#edit-jumlah').value = item.jumlah;
  document.querySelector('#edit-kondisi').value = item.kondisi;

  if (dialogEdit) dialogEdit.showModal();
}

if (btnCancelEdit && dialogEdit) {
  btnCancelEdit.addEventListener('click', () => dialogEdit.close());
}

if (formEditAlat) {
  formEditAlat.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.querySelector('#edit-id').value;

    const payload = {
      nama: document.querySelector('#edit-nama').value.trim(),
      kategori: document.querySelector('#edit-kategori').value,
      jumlah: Number(document.querySelector('#edit-jumlah').value),
      kondisi: document.querySelector('#edit-kondisi').value
    };

    try {
      const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Data berhasil diperbarui di database!');
        if (dialogEdit) dialogEdit.close();
        await loadInventarisData(); // Reload data
      } else {
        alert(`Gagal memperbarui data: ${result.message}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan koneksi saat memperbarui data.');
    }
  });
}

// ==========================================
// 4. DELETE (HAPUS DATA DENGAN KONFIRMASI)
// ==========================================
async function hapusAlat(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data alat ini?')) return;

  try {
    const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('Data berhasil dihapus!');
      await loadInventarisData();
    } else {
      alert(`Gagal menghapus: ${result.message}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Terjadi kesalahan koneksi saat menghapus data.');
  }
}

// Event Delegation untuk Tombol Edit dan Hapus
if (daftar) {
  daftar.addEventListener('click', (event) => {
    const target = event.target;
    const id = target.dataset.id;

    if (target.classList.contains('btn-edit')) {
      bukaModalEdit(id);
    } else if (target.classList.contains('btn-delete')) {
      hapusAlat(id);
    }
  });
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadInventarisData();
});