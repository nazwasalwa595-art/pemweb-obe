<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan'], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'message' => 'API is running smoothly',
    'timestamp' => date(DATE_ATOM)
], JSON_UNESCAPED_UNICODE);