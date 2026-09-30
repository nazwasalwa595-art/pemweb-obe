/* js/app.js - Logika Utama AbsensiQR & Latihan E Modul 5 */

import { 
  ringkasAbsensi, 
  cariAbsensiSesuaiLokasi, 
  cariPesertaDenganId, 
  buatStringRingkasan,
  validateForm
} from './utils.js';

// 1. Data inventaris lengkap dari Modul 4
const inventaris = [
  { id: 1, nama: 'Scanner QR Code', kategori: 'Perangkat', jumlah: 5, kondisi: 'Baik', lokasi: 'Lab Komputer 1' },
  { id: 2, nama: 'Webcam HD Absensi', kategori: 'Kamera', jumlah: 3, kondisi: 'Baik', lokasi: 'Ruang Kelas 3A' },
  { id: 3, nama: 'Tablet Presensi', kategori: 'Perangkat', jumlah: 2, kondisi: 'Perlu Cek', lokasi: 'Lab Komputer 1' },
  { id: 4, nama: 'Kabel LAN UTP', kategori: 'Jaringan', jumlah: 10, kondisi: 'Perlu Cek', lokasi: 'Lab Komputer 1' },
  { id: 5, nama: 'Printer Card ID', kategori: 'Perangkat', jumlah: 1, kondisi: 'Baik', lokasi: 'Ruang Admin' },
  { id: 6, nama: 'Router Wi-Fi 6', kategori: 'Jaringan', jumlah: 4, kondisi: 'Baik', lokasi: 'Lab Komputer 1' }
];

// DOM Selection
const daftar = document.querySelector('#daftar-alat');
const tombolFilter = document.querySelectorAll('[data-filter]');
const inputCari = document.querySelector('#input-cari');
const selectItemsPerPage = document.querySelector('#items-per-page');

// Variable State awal
let filterKondisiSekarang = 'Semua';
let kataKunciCari = '';

// 
// LATIHAN 3: Ambil Pilihan Jumlah Item Per Halaman dari LocalStorage
// 
const KEY_ITEMS_PER_PAGE = 'absensi_items_per_page';
const savedItemsPerPage = localStorage.getItem(KEY_ITEMS_PER_PAGE) ?? '5';

if (selectItemsPerPage) {
  selectItemsPerPage.value = savedItemsPerPage;

  // Simpan ke localStorage saat pengguna mengganti nilai dropdown
  selectItemsPerPage.addEventListener('change', (e) => {
    const nilaiBaru = e.target.value;
    localStorage.setItem(KEY_ITEMS_PER_PAGE, nilaiBaru);
    terapkanFilterDanRender();
  });
}

// 
// FUNGSI RENDER CARDS (Latihan 2: Menambahkan Tombol Detail)
// 
function renderItems(items) {
  if (!daftar) return;

  daftar.replaceChildren(); // Bersihkan container

  const limit = parseInt(selectItemsPerPage ? selectItemsPerPage.value : '5', 10);
  const itemsTampil = items.slice(0, limit); // Batasi sesuai nilai localStorage/dropdown

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

    // Latihan 2: Tombol Detail dengan data-id
    const btnDetail = document.createElement('button');
    btnDetail.type = 'button';
    btnDetail.className = 'btn-detail';
    btnDetail.dataset.id = item.id;
    btnDetail.textContent = 'Detail';

    article.append(title, info, btnDetail);
    daftar.append(article);
  }
}

// Fungsi Helper gabungan pencarian & filter
function terapkanFilterDanRender() {
  const hasil = inventaris.filter((item) => {
    const cocokKondisi = filterKondisiSekarang === 'Semua' || item.kondisi === filterKondisiSekarang;
    const cocokNama = item.nama.toLowerCase().includes(kataKunciCari.toLowerCase());
    return cocokKondisi && cocokNama;
  });

  renderItems(hasil);
}

// 
// LATIHAN 1: Pencarian Berdasarkan Nama yang Merespons Event 'input'
// 
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

// 
// LATIHAN 2: Event Delegation pada Container Daftar (#daftar-alat)
// 
if (daftar) {
  daftar.addEventListener('click', (event) => {
    // Cek apakah elemen yang diklik adalah tombol .btn-detail
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

// Render awal
terapkanFilterDanRender();

// 
// Web Storage: Preferensi Tema
// 
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

document.addEventListener('DOMContentLoaded', () => {
  inisialisasiFiturTema();
});


/* ==========================================================================
   MODUL 6: EVENT LISTENER SUBMIT & INPUT HANDLING
   ========================================================================== */
const formAlat = document.querySelector('#form-alat');
const formSummary = document.querySelector('#form-summary');
const previewContainer = document.querySelector('#preview-container');
const previewContent = document.querySelector('#preview-content');

if (formAlat) {
  formAlat.addEventListener('submit', (event) => {
    // Mencegah reload halaman
    event.preventDefault();

    // Reset pesan error & atribut aksesibilitas sebelumnya
    const errorSpans = formAlat.querySelectorAll('.error-msg');
    errorSpans.forEach((span) => (span.textContent = ''));

    const inputs = formAlat.querySelectorAll('input, select');
    inputs.forEach((input) => input.removeAttribute('aria-invalid'));

    if (formSummary) formSummary.textContent = '';
    if (previewContainer) previewContainer.hidden = true;

    // Normalisasi Data Input (.trim() & Number())
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

    // Jika Terdapat Error
    if (errorKeys.length > 0) {
      if (formSummary) {
        formSummary.textContent = `Terdapat ${errorKeys.length} kesalahan pada form. Silakan periksa pesan bantuan di bawah.`;
        formSummary.style.color = '#dc2626';
      }

      let firstErrorField = null;

      errorKeys.forEach((key) => {
        const inputField = formAlat.querySelector(`[name="${key}"]`);
        const idSpan = `err-${key.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`)}`;
        const errSpan = document.querySelector(`#${idSpan}`);

        if (inputField) {
          inputField.setAttribute('aria-invalid', 'true');
          if (!firstErrorField) firstErrorField = inputField;
        }

        if (errSpan) {
          errSpan.textContent = errors[key];
        }
      });

      // Fokuskan kursor ke field error pertama (Aksesibilitas Keyboard)
      if (firstErrorField) {
        firstErrorField.focus();
      }

      return;
    }

    // Jika Valid: Tampilkan Preview Data
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