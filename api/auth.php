<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $action = $_GET['action'] ?? '';

    // ---------- DAFTAR ----------
    if ($action === 'register') {
        wajibMethod(['POST']);
        $in = bacaBodyJson();
        $peran    = (string)($in['peran'] ?? '');
        $username = trim((string)($in['username'] ?? ''));
        $nama     = trim((string)($in['nama'] ?? ''));
        $email    = trim((string)($in['email'] ?? ''));
        $password = $in['password'] ?? '';

        if (
            !in_array($peran, [PERAN_GURU, PERAN_SISWA], true) ||
            !preg_match('/^\d{8,18}$/', $username) ||
            $nama === '' || mb_strlen($nama) > 100 ||
            !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150 ||
            !is_string($password) || mb_strlen($password) < 8 || strlen($password) > 72
        ) {
            galat('Data tidak valid. Username wajib angka 8–18 digit, email valid, password minimal 8 karakter.', 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO users (username, nama, email, password, peran) VALUES (:u, :n, :e, :p, :r)'
        );
        $stmt->execute([
            'u' => $username, 'n' => $nama, 'e' => $email,
            'p' => password_hash($password, PASSWORD_BCRYPT), 'r' => $peran,
        ]);
        kirimJson(['success' => true, 'message' => 'Pendaftaran berhasil, silakan login'], 201);
    }

    // ---------- LOGIN ----------
    if ($action === 'login') {
        wajibMethod(['POST']);
        $in = bacaBodyJson();
        $username = trim((string)($in['username'] ?? ''));
        $password = $in['password'] ?? '';

        if (!preg_match('/^\d{8,18}$/', $username) || !is_string($password) || $password === '') {
            galat('Username (angka) dan password wajib diisi', 422);
        }

        $stmt = db()->prepare(
            'SELECT id, username, nama, email, password, peran FROM users WHERE username = :u LIMIT 1'
        );
        $stmt->execute(['u' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, (string)$user['password'])) {
            galat('Username atau password salah', 401);
        }

        startAuthSession();
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['role'] = $user['peran'];

        kirimJson([
            'success' => true,
            'message' => 'Login berhasil',
            'csrf_token' => getCsrfToken(),
            'user' => [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'nama' => $user['nama'],
                'email' => $user['email'],
                'peran' => $user['peran'],
            ],
        ]);
    }

    // ---------- PROFIL (cek sesi) ----------
    if ($action === 'me') {
        wajibMethod(['GET']);
        requireLogin();
        $stmt = db()->prepare('SELECT id, username, nama, email, peran, created_at FROM users WHERE id = :id');
        $stmt->execute(['id' => $_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user) galat('Data user tidak ditemukan', 404);
        kirimJson(['success' => true, 'data' => $user, 'csrf_token' => getCsrfToken()]);
    }

    // ---------- LOGOUT ----------
    if ($action === 'logout') {
        wajibMethod(['POST']);
        startAuthSession();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $p['path'],
                'domain' => $p['domain'] ?? '',
                'secure' => $p['secure'],
                'httponly' => $p['httponly'],
                'samesite' => $p['samesite'] ?? 'Lax',
            ]);
        }
        session_destroy();
        kirimJson(['success' => true, 'message' => 'Logout berhasil']);
    }

    galat('Action tidak dikenal', 404);

} catch (PDOException $e) {
    if (($e->errorInfo[1] ?? 0) === 1062) {
        galat('Username atau email sudah terdaftar', 409);
    }
    error_log('Auth DB error: ' . $e->getMessage());
    galat('Terjadi kesalahan internal pada server', 500);
} catch (Throwable $e) {
    error_log('Auth error: ' . $e->getMessage());
    galat('Terjadi kesalahan internal pada server', 500);
}