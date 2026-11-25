<?php
declare(strict_types=1);

const PERAN_GURU  = 'Guru/Dosen';
const PERAN_SISWA = 'Siswa/Mahasiswa';

function kirimJson(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function galat(string $pesan, int $status): never {
    kirimJson(['success' => false, 'message' => $pesan], $status);
}

function bacaBodyJson(): array {
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function wajibMethod(array $diizinkan): void {
    if (!in_array($_SERVER['REQUEST_METHOD'], $diizinkan, true)) {
        header('Allow: ' . implode(', ', $diizinkan));
        galat('Method tidak diizinkan', 405);
    }
}

function startAuthSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function requireLogin(): void {
    startAuthSession();
    if (empty($_SESSION['user_id'])) {
        galat('Silakan login terlebih dahulu', 401);
    }
}

function requireRole(array $peran): void {
    requireLogin();
    if (!in_array($_SESSION['role'] ?? '', $peran, true)) {
        galat('Akses ditolak', 403);
    }
}

function getCsrfToken(): string {
    startAuthSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(): void {
    startAuthSession();
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if ($token === '' || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        galat('Token CSRF tidak valid', 403);
    }
}