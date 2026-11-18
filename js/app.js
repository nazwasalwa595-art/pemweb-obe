/* js/app.js - Integration Auth & CRUD Sesi Serta Search Real-Time */

const API_AUTH_URL = 'http://localhost/pemweb-proyek-semester/api/auth.php';
const API_SESI_URL = 'http://localhost/pemweb-proyek-semester/api/sesi.php';

const ROLE_KEY = 'absensi_user_role';
const USER_KEY = 'absensi_user_name';

// -------------------------------------------------------------
// A. LOGIKA LOGIN (Hanya berjalan di login.html)
// -------------------------------------------------------------
const formLogin = document.querySelector('#form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.querySelector('#login-username')?.value.trim() || '';
    const passwordInput = document.querySelector('#login-password')?.value || '';
    const summaryMsg = document.querySelector('#login-summary');

    if (!usernameInput || !passwordInput) {
      alert('Username (NIP/NIM) dan Kata Sandi wajib diisi!');
      return;
    }

    try {
      const response = await fetch(`${API_AUTH_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem(ROLE_KEY, result.data.role);
        localStorage.setItem(USER_KEY, result.data.nama);

        alert(`Login Berhasil!\nSelamat datang, ${result.data.nama}`);
        window.location.href = (result.data.role === 'guru' || result.data.peran === 'Guru/Dosen') 
          ? 'dashboard-guru.html' 
          : 'dashboard-siswa.html';
      } else {
        if (summaryMsg) {
          summaryMsg.style.display = 'block';
          summaryMsg.textContent = result.message;
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Koneksi ke server API gagal.');
    }
  });
}

// -------------------------------------------------------------
// B. LOGIKA CRUD SESI & SEARCH (Hanya berjalan di dashboard-guru.html)
// -------------------------------------------------------------
async function muatDaftarSesi(query = '') {
  const container = document.querySelector('#daftar-sesi');
  if (!container) return;

  try {
    const url = query ? `${API_SESI_URL}?q=${encodeURIComponent(query)}` : API_SESI_URL;
    const response = await fetch(url);
    const result = await response.json();

    container.replaceChildren();

    if (!response.ok || !result.success || !result.data || result.data.length === 0) {
      container.innerHTML = '<p style="color:#64748b; font-style:italic;">Tidak ada sesi mata kuliah ditemukan.</p>';
      return;
    }

    result.data.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card-sesi';
      card.style.cssText = 'border:1px solid #cbd5e1; padding:15px; border-radius:8px; margin-bottom:10px; background:var(--surface);';
      card.innerHTML = `
        <h3>${item.nama_sesi}</h3>
        <p>Kode QR: <strong>${item.kode_qr}</strong> | Kategori: <strong>${item.kategori}</strong></p>
        <p>Berlaku Sampai: ${item.berlaku_sampai}</p>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button type="button" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;" onclick="bukaModalEdit(${item.id}, '${item.nama_sesi}', '${item.kode_qr}', '${item.kategori}', '${item.berlaku_sampai}')">Edit</button>
          <button type="button" style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;" onclick="hapusSesi(${item.id})">Hapus</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Fetch Sesi Error:', err);
  }
}

// Input Search Real-Time
const inputSearch = document.querySelector('#input-search');
if (inputSearch) {
  inputSearch.addEventListener('input', (e) => {
    const kataKunci = e.target.value.trim();
    muatDaftarSesi(kataKunci);
  });
}

// Tambah Sesi (POST)
const formCreate = document.querySelector('#form-buat-sesi');
if (formCreate) {
  formCreate.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nama_sesi: document.querySelector('#nama_sesi').value.trim(),
      kode_qr: document.querySelector('#kode_qr').value.trim(),
      kategori: document.querySelector('#kategori').value,
      berlaku_sampai: document.querySelector('#berlaku_sampai').value
    };

    try {
      const res = await fetch(API_SESI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert('Sesi berhasil dibuat!');
        formCreate.reset();
        muatDaftarSesi();
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  });
}

// Edit Sesi (PUT)
const modalEdit = document.querySelector('#modal-edit-sesi');
const formEdit = document.querySelector('#form-edit-sesi');
const btnCancel = document.querySelector('#btn-cancel-edit');

window.bukaModalEdit = function(id, nama, kode, kat, berlaku) {
  document.querySelector('#edit-id').value = id;
  document.querySelector('#edit-nama_sesi').value = nama;
  document.querySelector('#edit-kode_qr').value = kode;
  document.querySelector('#edit-kategori').value = kat;
  document.querySelector('#edit-berlaku_sampai').value = berlaku.replace(' ', 'T');
  if (modalEdit) modalEdit.showModal();
};

if (btnCancel && modalEdit) {
  btnCancel.addEventListener('click', () => modalEdit.close());
}

if (formEdit) {
  formEdit.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.querySelector('#edit-id').value;
    const payload = {
      nama_sesi: document.querySelector('#edit-nama_sesi').value.trim(),
      kode_qr: document.querySelector('#edit-kode_qr').value.trim(),
      kategori: document.querySelector('#edit-kategori').value,
      berlaku_sampai: document.querySelector('#edit-berlaku_sampai').value
    };

    try {
      const res = await fetch(`${API_SESI_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert('Sesi mata kuliah berhasil diperbarui!');
        modalEdit.close();
        muatDaftarSesi();
      } else {
        alert(`Gagal Edit: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  });
}

// Hapus Sesi (DELETE)
window.hapusSesi = async function(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus sesi ini?')) return;

  try {
    const res = await fetch(`${API_SESI_URL}?id=${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok && data.success) {
      alert('Sesi berhasil dihapus!');
      muatDaftarSesi();
    } else {
      alert(`Gagal Hapus: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
  }
};

// Logout
const btnLogout = document.querySelector('#btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  });
}

// Inisialisasi Otomatis
document.addEventListener('DOMContentLoaded', () => {
  muatDaftarSesi();
});