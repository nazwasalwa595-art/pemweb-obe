<?php
declare(strict_types=1);

// Import koneksi PDO Database & Helper Autentikasi
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;

    // ==========================================
    // POIN 5 MODUL 12: PROTEKSI OTORISASI ROLE
    // Membatasi request penulisan data (POST, PUT, PATCH, DELETE) 
    // agar hanya bisa diakses oleh role 'admin' atau 'petugas'
    // ==========================================
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        requireRole(['admin', 'petugas']);
    }

    // ==========================================
    // GET METHOD (COLLECTION & BY ID)
    // ==========================================
    if ($method === 'GET') {
        
        // GET BY ID (Dengan Penanganan Status Code 404 / 400)
        if (isset($_GET['id'])) {
            if ($id === false || $id <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Parameter ID tidak valid'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = db()->prepare('SELECT * FROM alat WHERE id = :id');
            $stmt->execute(['id' => $id]);
            $item = $stmt->fetch();

            if (!$item) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Data alat tidak ditemukan'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $item], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // FILTER KATEGORI & PAGINATION
        $kategori = isset($_GET['kategori']) ? trim((string)$_GET['kategori']) : null;
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 5; // Default 5 item per halaman
        $offset = ($page - 1) * $limit; // Perbaikan sintaks offset

        // Hitung total data untuk pagination meta
        if ($kategori) {
            $countStmt = db()->prepare('SELECT COUNT(*) FROM alat WHERE kategori = :kategori');
            $countStmt->execute(['kategori' => $kategori]);
        } else {
            $countStmt = db()->query('SELECT COUNT(*) FROM alat');
        }
        $totalItems = (int)$countStmt->fetchColumn();
        $totalPages = (int)ceil($totalItems / $limit);

        // Fetch data terpaginasi dari tabel 'alat'
        if ($kategori) {
            $query = 'SELECT * FROM alat WHERE kategori = :kategori ORDER BY id DESC LIMIT :limit OFFSET :offset';
            $stmt = db()->prepare($query);
            $stmt->bindValue(':kategori', $kategori, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $query = 'SELECT * FROM alat ORDER BY id DESC LIMIT :limit OFFSET :offset';
            $stmt = db()->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
        }

        $alats = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'pagination' => [
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
                'current_page' => $page,
                'limit' => $limit
            ],
            'count' => count($alats),
            'data' => $alats
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ==========================================
    // POST METHOD (CREATE - TERPROTEKSI)
    // ==========================================
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $nama = trim((string)($input['nama'] ?? ''));
        $kategori = trim((string)($input['kategori'] ?? ''));
        $jumlah = filter_var($input['jumlah'] ?? null, FILTER_VALIDATE_INT);
        $kondisi = trim((string)($input['kondisi'] ?? 'Baik'));

        if ($nama === '' || $kategori === '' || $jumlah === false || $jumlah < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Data tidak valid. Nama dan kategori wajib diisi, jumlah >= 0'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = db()->prepare('INSERT INTO alat (nama, kategori, jumlah, kondisi) VALUES (:nama, :kategori, :jumlah, :kondisi)');
        $stmt->execute(['nama' => $nama, 'kategori' => $kategori, 'jumlah' => $jumlah, 'kondisi' => $kondisi]);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Data alat berhasil ditambahkan',
            'data' => ['id' => (int)db()->lastInsertId(), 'nama' => $nama, 'kategori' => $kategori, 'jumlah' => $jumlah, 'kondisi' => $kondisi]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ==========================================
    // PUT / PATCH METHOD (UPDATE - TERPROTEKSI)
    // ==========================================
    if ($method === 'PUT' || $method === 'PATCH') {
        if ($id === null || $id === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Parameter ID valid diperlukan'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $check = db()->prepare('SELECT id FROM alat WHERE id = :id');
        $check->execute(['id' => $id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Data alat tidak ditemukan'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $nama = trim((string)($input['nama'] ?? ''));
        $kategori = trim((string)($input['kategori'] ?? ''));
        $jumlah = filter_var($input['jumlah'] ?? null, FILTER_VALIDATE_INT);
        $kondisi = trim((string)($input['kondisi'] ?? 'Baik'));

        if ($nama === '' || $kategori === '' || $jumlah === false || $jumlah < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Data tidak valid'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = db()->prepare('UPDATE alat SET nama = :nama, kategori = :kategori, jumlah = :jumlah, kondisi = :kondisi WHERE id = :id');
        $stmt->execute(['id' => $id, 'nama' => $nama, 'kategori' => $kategori, 'jumlah' => $jumlah, 'kondisi' => $kondisi]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Data alat berhasil diperbarui'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ==========================================
    // DELETE METHOD (DELETE - TERPROTEKSI)
    // ==========================================
    if ($method === 'DELETE') {
        if ($id === null || $id === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Parameter ID valid diperlukan'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $check = db()->prepare('SELECT id FROM alat WHERE id = :id');
        $check->execute(['id' => $id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Data alat tidak ditemukan'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = db()->prepare('DELETE FROM alat WHERE id = :id');
        $stmt->execute(['id' => $id]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Data alat berhasil dihapus'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Method not allowed
    header('Allow: GET, POST, PUT, PATCH, DELETE');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method HTTP tidak diizinkan'], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan internal pada server'
    ], JSON_UNESCAPED_UNICODE);
}