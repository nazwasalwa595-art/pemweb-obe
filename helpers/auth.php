<?php
declare(strict_types=1);

function startAuthSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

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
    if (session_status() === PHP_SESSION_NONE) {
        startAuthSession();
    }

    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Silakan login terlebih dahulu'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function requireRole(array $roles): void {
    requireLogin();

    if (!in_array($_SESSION['role'] ?? '', $roles, true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Akses ditolak'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}