export const API = 'api';
export const $ = (sel) => document.querySelector(sel);
export const HALAMAN = {
  'Guru/Dosen': 'dashboard-guru.html',
  'Siswa/Mahasiswa': 'dashboard-siswa.html',
};

let csrfToken = '';

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;
  try {
    const res = await fetch(`${API}/${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { message: 'Tidak dapat terhubung ke server.' } };
  }
}

export const pesan = (r) => r.data.message || 'Terjadi kesalahan.';

export function tampil(el, teks, sukses = false) {
  el.textContent = teks;
  el.className = sukses ? 'success-msg' : 'error-msg';
}

export async function logout() {
  await request('auth.php?action=logout', { method: 'POST' });
  window.location.href = 'login.html';
}

// Cek sesi di server, ambil CSRF token, dan arahkan jika peran tidak sesuai
export async function muatUser(peranWajib) {
  const r = await request('auth.php?action=me');
  if (r.status === 401) { window.location.href = 'login.html'; return null; }
  if (!r.ok) return null;

  csrfToken = r.data.csrf_token;
  const user = r.data.data;
  if (user.peran !== peranWajib) { window.location.href = HALAMAN[user.peran]; return null; }

  $('#welcome-title').textContent = `Selamat datang, ${user.nama}!`;
  $('#user-info').textContent = `${user.peran} - ${user.username}`;
  $('#btn-logout').addEventListener('click', logout);
  return user;
}