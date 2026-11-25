import { $, request, pesan, tampil, HALAMAN } from './common.js';

const formLogin = $('#form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const summary = $('#form-summary');
    const username = $('#login-username').value.trim();
    const password = $('#login-password').value;

    if (!/^\d{8,18}$/.test(username) || !password) {
      tampil(summary, 'Username (angka 8–18 digit) dan kata sandi wajib diisi.');
      return;
    }
    const r = await request('auth.php?action=login', { method: 'POST', body: { username, password } });
    if (r.ok) window.location.href = HALAMAN[r.data.user.peran];
    else tampil(summary, pesan(r));
  });
}

const formRegister = $('#form-register');
if (formRegister) {
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const summary = $('#form-summary');
    const body = {
      peran: $('#peran').value,
      username: $('#username').value.trim(),
      nama: $('#nama').value.trim(),
      email: $('#email').value.trim(),
      password: $('#password').value,
    };

    if (!/^\d{8,18}$/.test(body.username)) { tampil(summary, 'Username wajib angka saja, 8–18 digit.'); return; }
    if (!body.nama || !body.email) { tampil(summary, 'Nama dan email wajib diisi.'); return; }
    if (body.password.length < 8) { tampil(summary, 'Kata sandi minimal 8 karakter.'); return; }

    const r = await request('auth.php?action=register', { method: 'POST', body });
    if (r.ok) {
      tampil(summary, 'Pendaftaran berhasil! Mengarahkan ke halaman login...', true);
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } else {
      tampil(summary, pesan(r));
    }
  });
}