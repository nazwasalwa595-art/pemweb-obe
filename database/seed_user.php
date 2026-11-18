<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Script seed hanya boleh dijalankan melalui CLI.\n");
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = db();
    
    // Hash resmi BCRYPT untuk password: "password123"
    $password = 'password123';
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Data User Dummy yang di-seed (Petugas & Viewer)
    $users = [
        [
            'nama' => 'Petugas Lab',
            'email' => 'petugas@pemweb.test',
            'role' => 'petugas'
        ],
        [
            'nama' => 'Siswa Viewer',
            'email' => 'viewer@pemweb.test',
            'role' => 'viewer'
        ]
    ];

    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $updateStmt = $pdo->prepare('UPDATE users SET nama = ?, password_hash = ?, role = ? WHERE id = ?');
    $insertStmt = $pdo->prepare('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)');

    foreach ($users as $u) {
        $checkStmt->execute([$u['email']]);
        $userId = $checkStmt->fetchColumn();

        if ($userId !== false) {
            $updateStmt->execute([$u['nama'], $hash, $u['role'], $userId]);
            echo "User '{$u['email']}' (Role: {$u['role']}) berhasil diperbarui.\n";
        } else {
            $insertStmt->execute([$u['nama'], $u['email'], $hash, $u['role']]);
            echo "User '{$u['email']}' (Role: {$u['role']}) berhasil ditambahkan.\n";
        }
    }

    echo "\nSeeding Selesai! Kedua user dapat login menggunakan password: {$password}\n";

} catch (Throwable $e) {
    echo "Error Seeding: " . $e->getMessage() . "\n";
}