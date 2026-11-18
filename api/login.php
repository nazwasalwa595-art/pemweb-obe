<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format JSON tidak valid'], JSON_UNESCAPED_UNICODE);
    exit;
}

$email = trim((string)($data['email'] ?? ''));
$password = $data['password'] ?? null;

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || $password === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Email dan password wajib diisi dengan benar'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = db()->prepare(
        'SELECT id, nama, email, password_hash, role FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    error_log('Login database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan internal pada server'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$user || !password_verify($password, (string)$user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Email atau password salah'], JSON_UNESCAPED_UNICODE);
    exit;
}

startAuthSession();
$_SESSION = [];
session_regenerate_id(true);

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role'] = $user['role'];

echo json_encode([
    'message' => 'Login berhasil',
    'user' => [
        'id' => (int) $user['id'],
        'nama' => $user['nama'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
], JSON_UNESCAPED_UNICODE);