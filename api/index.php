<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'message' => 'Selamat datang di REST API Pemweb OBE',
    'status' => 'active'
], JSON_UNESCAPED_UNICODE);