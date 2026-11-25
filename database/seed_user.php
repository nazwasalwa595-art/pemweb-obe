<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Script seed hanya boleh dijalankan melalui CLI.\n");
}

require_once __DIR__ . '/../config/database.php';

$password = 'password123';
$hash = password_hash($password, PASSWORD_BCRYPT);

$users = [
    ['username' => '198001012005011001', 'nama' => 'Dosen Pemweb',     'email' => 'dosen@absensiqr.test',     'peran' => 'Guru/Dosen'],
    ['username' => '2440000001',         'nama' => 'Mahasiswa Contoh', 'email' => 'mahasiswa@absensiqr.test', 'peran' => 'Siswa/Mahasiswa'],
];

try {
    $pdo = db();
    $cek = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $ubah = $pdo->prepare('UPDATE users SET nama = ?, email = ?, password = ?, peran = ? WHERE id = ?');
    $tambah = $pdo->prepare('INSERT INTO users (username, nama, email, password, peran) VALUES (?, ?, ?, ?, ?)');

    foreach ($users as $u) {
        $cek->execute([$u['username']]);
        $id = $cek->fetchColumn();
        if ($id !== false) {
            $ubah->execute([$u['nama'], $u['email'], $hash, $u['peran'], $id]);
            echo "Diperbarui : {$u['username']} ({$u['peran']})\n";
        } else {
            $tambah->execute([$u['username'], $u['nama'], $u['email'], $hash, $u['peran']]);
            echo "Ditambahkan: {$u['username']} ({$u['peran']})\n";
        }
    }
    echo "\nSelesai. Password semua akun: {$password}\n";
} catch (Throwable $e) {
    echo 'Error seeding: ' . $e->getMessage() . "\n";
}