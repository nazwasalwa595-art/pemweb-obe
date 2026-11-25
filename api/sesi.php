<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/auth.php';

header('Content-Type: application/json; charset=utf-8');

function parseWaktu(string $v): ?string {
    foreach (['Y-m-d\TH:i', 'Y-m-d\TH:i:s', 'Y-m-d H:i:s'] as $fmt) {
        $d = DateTime::createFromFormat($fmt, $v);
        $err = DateTime::getLastErrors();
        if ($d && ($err === false || ($err['warning_count'] === 0 && $err['error_count'] === 0))) {
            return $d->format('Y-m-d H:i:s');
        }
    }
    return null;
}

function ambilInputSesi(): array {
    $in = bacaBodyJson();
    $nama  = trim((string)($in['nama_sesi'] ?? ''));
    $kode  = trim((string)($in['kode_qr'] ?? ''));
    $waktu = parseWaktu(trim((string)($in['berlaku_sampai'] ?? '')));

    if ($nama === '' || mb_strlen($nama) > 100 || !preg_match('/^[A-Za-z0-9_-]{3,50}$/', $kode) || $waktu === null) {
        galat('Data tidak valid. Nama sesi wajib (maks 100), kode QR 3–50 karakter (huruf/angka/-/_), batas waktu harus valid.', 422);
    }
    return [$nama, $kode, $waktu];
}

try {
    requireRole([PERAN_GURU]);
    $dosenId = (int)$_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    $idRaw = $_GET['id'] ?? null;
    $id = $idRaw === null ? null : filter_var($idRaw, FILTER_VALIDATE_INT);
    if ($idRaw !== null && ($id === false || $id <= 0)) {
        galat('Parameter ID tidak valid', 400);
    }

    // ---------- GET ----------
    if ($method === 'GET') {
        if ($id !== null) {
            $stmt = db()->prepare('SELECT id, nama_sesi, kode_qr, berlaku_sampai FROM sesi_qr WHERE id = :id AND dosen_id = :d');
            $stmt->execute(['id' => $id, 'd' => $dosenId]);
            $sesi = $stmt->fetch();
            if (!$sesi) galat('Sesi tidak ditemukan', 404);

            $rekap = db()->prepare(
                'SELECT u.nama, u.username, p.status, p.waktu_absen
                 FROM presensi p JOIN users u ON u.id = p.user_id
                 WHERE p.sesi_id = :s ORDER BY p.waktu_absen ASC'
            );
            $rekap->execute(['s' => $id]);
            kirimJson(['success' => true, 'data' => ['sesi' => $sesi, 'rekap' => $rekap->fetchAll()]]);
        }

        $stmt = db()->prepare(
            'SELECT s.id, s.nama_sesi, s.kode_qr, s.berlaku_sampai, COUNT(p.id) AS jumlah_presensi
             FROM sesi_qr s LEFT JOIN presensi p ON p.sesi_id = s.id
             WHERE s.dosen_id = :d GROUP BY s.id ORDER BY s.id DESC'
        );
        $stmt->execute(['d' => $dosenId]);
        $rows = $stmt->fetchAll();
        kirimJson(['success' => true, 'count' => count($rows), 'data' => $rows]);
    }

    // ---------- POST / PUT / DELETE ----------
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        verifyCsrfToken();
    }

    if ($method === 'POST') {
        [$nama, $kode, $waktu] = ambilInputSesi();
        $stmt = db()->prepare(
            'INSERT INTO sesi_qr (dosen_id, nama_sesi, kode_qr, berlaku_sampai) VALUES (:d, :n, :k, :w)'
        );
        $stmt->execute(['d' => $dosenId, 'n' => $nama, 'k' => $kode, 'w' => $waktu]);
        kirimJson(['success' => true, 'message' => 'Sesi berhasil dibuat', 'data' => ['id' => (int)db()->lastInsertId()]], 201);
    }

    if (in_array($method, ['PUT', 'PATCH', 'DELETE'], true)) {
        if ($id === null) galat('Parameter ID valid diperlukan', 400);

        $cek = db()->prepare('SELECT id FROM sesi_qr WHERE id = :id AND dosen_id = :d');
        $cek->execute(['id' => $id, 'd' => $dosenId]);
        if (!$cek->fetch()) galat('Sesi tidak ditemukan', 404);

        if ($method === 'DELETE') {
            $stmt = db()->prepare('DELETE FROM sesi_qr WHERE id = :id');
            $stmt->execute(['id' => $id]);
            kirimJson(['success' => true, 'message' => 'Sesi berhasil dihapus']);
        }

        [$nama, $kode, $waktu] = ambilInputSesi();
        $stmt = db()->prepare('UPDATE sesi_qr SET nama_sesi = :n, kode_qr = :k, berlaku_sampai = :w WHERE id = :id');
        $stmt->execute(['n' => $nama, 'k' => $kode, 'w' => $waktu, 'id' => $id]);
        kirimJson(['success' => true, 'message' => 'Sesi berhasil diperbarui']);
    }

    header('Allow: GET, POST, PUT, PATCH, DELETE');
    galat('Method tidak diizinkan', 405);

} catch (PDOException $e) {
    if (($e->errorInfo[1] ?? 0) === 1062) {
        galat('Kode QR sudah dipakai, gunakan kode lain', 409);
    }
    error_log('Sesi DB error: ' . $e->getMessage());
    galat('Terjadi kesalahan internal pada server', 500);
} catch (Throwable $e) {
    error_log('Sesi error: ' . $e->getMessage());
    galat('Terjadi kesalahan internal pada server', 500);
}