<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET Method - Mengembalikan Data Array Sementara
if ($method === 'GET') {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            ['id' => 1, 'nama' => 'Scanner QR Code', 'jumlah' => 5, 'kondisi' => 'Baik'],
            ['id' => 2, 'nama' => 'Webcam HD Absensi', 'jumlah' => 3, 'kondisi' => 'Baik'],
            ['id' => 3, 'nama' => 'Router Wi-Fi 6', 'jumlah' => 4, 'kondisi' => 'Baik']
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST Method - Input JSON & Validasi Sesuai Aturan Bisnis
if ($method === 'POST') {
    try {
        $payload = json_decode(
            file_get_contents('php://input'),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    } catch (JsonException $e) {
        // Condition: Status 400 Bad Request (JSON Rusak/Invalid)
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON tidak valid'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Body JSON harus berupa object'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $nama = trim((string)($payload['nama'] ?? ''));
    $jumlah = filter_var($payload['jumlah'] ?? null, FILTER_VALIDATE_INT);

    // Condition: Status 422 Unprocessable Content (Data Tidak Memenuhi Aturan Bisnis)
    if ($nama === '' || strlen($nama) > 100 || $jumlah === false || $jumlah < 0) {
        http_response_code(422);
        echo json_encode([
            'error' => 'Data tidak memenuhi aturan bisnis. Nama wajib diisi (max 100 karakter) & jumlah harus berupa angka >= 0'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Condition: Status 201 Created (JSON Valid)
    http_response_code(201);
    echo json_encode([
        'message' => 'Data berhasil dibuat',
        'data' => compact('nama', 'jumlah')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Status 405 Method Not Allowed (Jika memakai method PUT, DELETE, dll)
header('Allow: GET, POST');
http_response_code(405);
echo json_encode(['error' => 'Method tidak diizinkan'], JSON_UNESCAPED_UNICODE);