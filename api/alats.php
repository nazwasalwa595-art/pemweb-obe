<?php
declare(strict_types=1);

// Panggil file konfigurasi PDO database
require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Tangkap parameter filter kategori dari query string (GET)
    $kategori = $_GET['kategori'] ?? null;

    if ($kategori) {
        // Query terparameterisasi (Prepared Statement) bila ada filter kategori
        $stmt = db()->prepare('SELECT * FROM alat WHERE kategori = :kategori ORDER BY id DESC');
        $stmt->execute(['kategori' => $kategori]);
    } else {
        // Query biasa jika tanpa filter
        $stmt = db()->query('SELECT * FROM alat ORDER BY id DESC');
    }

    $alats = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count' => count($alats),
        'data' => $alats
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan pada server'
    ], JSON_UNESCAPED_UNICODE);
}