/* js/app.js - Logika Utama AbsensiQR, Modul 5, Modul 6, & Modul 7 (Web API) */

import { 
  ringkasAbsensi, 
  cariAbsensiSesuaiLokasi, 
  cariPesertaDenganId, 
  buatStringRingkasan,
  validateForm
} from './utils.js';

// Selection DOM
const daftar = document.querySelector('#daftar-alat');
const tombolFilter = document.querySelectorAll('[data-filter]');
const inputCari = document.querySelector('#input-cari');
const selectItemsPerPage = document.querySelector('#items-per-page');
const apiMessage = document.querySelector('#api-message');

// State Aplikasi
let inventaris = []; // Menyimpan data dari API / JSON Lokal
let filterKondisiSekarang = 'Semua';
let kataKunciCari = '';

// Ubah ke false agar aplikasi mencoba mengambil data dari internet/API
const USE_LOCAL_DATA = false;

// Buat URL endpoint-nya SALAH (tambahkan kata "-salah" di ujungnya)
const endpoint = USE_LOCAL_DATA
  ? './data/users.json'
  : 'https://jsonplaceholder.typicode.com/users-salah';

// 
// MODUL 7: Fungsi Async untuk Memuat Data API (Async/Await, Loading, & Retry State)
// 
async function loadInventarisData() {
  if (!apiMessage) return;

  // 1. Loading State
  apiMessage.innerHTML = '<span>Memuat data dari API...</span>';
  apiMessage.style.color = '#1e293b';

  try {
    // 2. Fetch Data dari Endpoint
    const response = await fetch(endpoint);

    // 3. Pengecekan status response.ok
    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    // 4. Parse JSON Response
    const data = await response.json();

    // Normalisasi data jika menggunakan API publik eksternal
    if (!USE_LOCAL_DATA) {
      inventaris = data.slice(0, 6).map((user, index) => ({
        id: user.id,
        nama: `${user.name} (${user.company?.name || 'Alat QR'})`,
        kategori: index % 2 === 0 ? 'Perangkat' : 'Kamera',
        jumlah: Math.floor(Math.random() * 5) + 1,
        kondisi: index % 3 === 0 ? 'Perlu Cek' : 'Baik',
        lokasi: user.address?.city || 'Lab Komputer'
      }));
    } else {
      inventaris = data;
    }

    // Pesan Sukses
    apiMessage.textContent = `Berhasil memuat ${inventaris.length} data.`;
    terapkanFilterDanRender();

  } catch (error) {
    console.error('Fetch Error:', error);

    // 5. Error State & Tombol Retry (Soal Latihan 1 Modul 7)
    apiMessage.innerHTML = `
      <span style="color: #dc2626;">Data gagal dimuat dari server. </span>
      <button type="button" id="btn-retry" style="margin-left: 8px; padding: 4px 8px; cursor: pointer;">
        Coba Lagi (Retry)
      </button>
    `;

    const btnRetry = document.querySelector('#btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', loadInventarisData);
    }
  }
}

// 
// WEB STORAGE: Ambil & Simpan Preferensi Items Per Page
// 
const KEY_ITEMS_PER_PAGE = 'absensi_items_per_page';
const savedItemsPerPage = localStorage.getItem(KEY_ITEMS_PER_PAGE) ?? '5';

if (selectItemsPerPage) {
  selectItemsPerPage.value = savedItemsPerPage;

  selectItemsPerPage.addEventListener('change', (e) => {
    const nilaiBaru = e.target.value;
    localStorage.setItem(KEY_ITEMS_PER_PAGE, nilaiBaru);
    terapkanFilterDanRender();
  });
}

// 
// FUNGSI RENDER CARDS TO DOM
// 
function renderItems(items) {
  if (!daftar) return;

  daftar.replaceChildren(); // Bersihkan container secara aman

  const limit = parseInt(selectItemsPerPage ? selectItemsPerPage.value : '5', 10);
  const itemsTampil = items.slice(0, limit);

  if (itemsTampil.length === 0) {
    const pesanKosong = document.createElement('p');
    pesanKosong.textContent = 'Tidak ada data inventaris yang cocok.';
    daftar.append(pesanKosong);
    return;
  }

  for (const item of itemsTampil) {
    const article = document.createElement('article');
    article.className = 'card';

    const title = document.createElement('h3');
    title.textContent = item.nama;

    const info = document.createElement('p');
    info.textContent = `${item.kategori} - ${item.jumlah} unit - ${item.kondisi}`;

    const btnDetail = document.createElement('button');
    btnDetail.type = 'button';
    btnDetail.className = 'btn-detail';
    btnDetail.dataset.id = item.id;
    btnDetail.textContent = 'Detail';

    article.append(title, info, btnDetail);
    daftar.append(article);
  }
}

// 
// MODUL 7 (LATIHAN 2): Filter Lokal tanpa Fetch Ulang
// 
function terapkanFilterDanRender() {
  const hasil = inventaris.filter((item) => {
    const cocokKondisi = filterKondisiSekarang === 'Semua' || item.kondisi === filterKondisiSekarang;
    const cocokNama = item.nama.toLowerCase().includes(kataKunciCari.toLowerCase());
    return cocokKondisi && cocokNama;
  });

  renderItems(hasil);
}

// Event Listener Search Real-Time
if (inputCari) {
  inputCari.addEventListener('input', (e) => {
    kataKunciCari = e.target.value;
    terapkanFilterDanRender();
  });
}

// Event Listener Filter Kondisi
tombolFilter.forEach((button) => {
  button.addEventListener('click', () => {
    filterKondisiSekarang = button.dataset.filter;
    terapkanFilterDanRender();
  });
});

// Event Delegation Tombol Detail
if (daftar) {
  daftar.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-detail')) {
      const idAlat = parseInt(event.target.dataset.id, 10);
      const detailAlat = inventaris.find((item) => item.id === idAlat);

      if (detailAlat) {
        alert(`--- DETAIL INVENTARIS ---
ID: ${detailAlat.id}
Nama: ${detailAlat.nama}
Kategori: ${detailAlat.kategori}
Jumlah: ${detailAlat.jumlah} unit
Kondisi: ${detailAlat.kondisi}
Lokasi: ${detailAlat.lokasi}`);
      }
    }
  });
}

// Web Storage: Preferensi Tema (Light/Dark Mode)
function inisialisasiFiturTema() {
  const header = document.querySelector('header');
  if (!header) return;

  const themeButton = document.createElement('button');
  themeButton.id = 'theme-button';
  themeButton.type = 'button';
  themeButton.textContent = 'Ganti Tema';
  header.appendChild(themeButton);

  const savedTheme = localStorage.getItem('theme') ?? 'light';
  document.documentElement.dataset.theme = savedTheme;

  themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  });
}

// 
// MODUL 6: Handling Form Submit & Validasi
// 
const formAlat = document.querySelector('#form-alat');
const formSummary = document.querySelector('#form-summary');
const previewContainer = document.querySelector('#preview-container');
const previewContent = document.querySelector('#preview-content');

if (formAlat) {
  formAlat.addEventListener('submit', (event) => {
    event.preventDefault();

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

    const errors = validateForm(formData);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      if (formSummary) {
        formSummary.textContent = `Terdapat ${errorKeys.length} kesalahan pada form. Silakan periksa pesan bantuan di bawah.`;
        formSummary.style.color = '#dc2626';
      }

      errorKeys.forEach((key) => {
        const idSpan = `err-${key.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`)}`;
        const errSpan = document.querySelector(`#${idSpan}`);
        if (errSpan) errSpan.textContent = errors[key];
      });
      return;
    }

    if (previewContainer && previewContent) {
      previewContent.innerHTML = `
        <strong>Nama Alat:</strong> ${formData.namaAlat}<br>
        <strong>Kategori:</strong> ${formData.kategori}<br>
        <strong>Jumlah:</strong> ${formData.jumlah} unit<br>
        <strong>Kondisi:</strong> ${formData.kondisi}<br>
        <strong>Tanggal Perolehan:</strong> ${formData.tanggalPerolehan}
      `;
      previewContainer.hidden = false;

      if (formSummary) {
        formSummary.textContent = 'Data berhasil divalidasi dan siap disimpan!';
        formSummary.style.color = '#166534';
      }

      formAlat.reset();
    }
  });
}

// Inisialisasi Aplikasi saat DOM Siap
document.addEventListener('DOMContentLoaded', () => {
  inisialisasiFiturTema();
  loadInventarisData();
});