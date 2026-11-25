<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/helpers/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    requireRole([PERAN_SISWA]);
    $userId = (int)$_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    // ---------- RIWAYAT ----------
    if ($method === 'GET') {
        $stmt = db()->prepare(
            'SELECT s.nama_sesi, s.kode_qr, p.waktu_absen, p.status
             FROM presensi p JOIN sesi_qr s ON s.id = p.sesi_id
             WHERE p.user_id = :u ORDER BY p.waktu_absen DESC'
        );
        $stmt->execute(['u' => $userId]);
        $rows = $stmt->fetchAll();
        kirimJson(['success' => true, 'count' => count($rows), 'data' => $rows]);
    }

    // ---------- ABSEN ----------
    if ($method === 'POST') {
        verifyCsrfToken();
        $in = bacaBodyJson();
        $kode = trim((string)($in['kode_qr'] ?? ''));
        $status = (string)($in['status'] ?? '');

        if (!preg_match('/^[A-Za-z0-9_-]{3,50}$/', $kode) || !in_array($status, ['Hadir', 'Izin', 'Sakit'], true)) {
            galat('Kode QR atau status tidak valid', 422);
        }

        $stmt = db()->prepare('SELECT id, nama_sesi, berlaku_sampai FROM sesi_qr WHERE kode_qr = :k LIMIT 1');
        $stmt->execute(['k' => $kode]);
        $sesi = $stmt->fetch();

        if (!$sesi) galat('Kode QR tidak ditemukan', 404);
        if (strtotime((string)$sesi['berlaku_sampai']) < time()) galat('Sesi sudah berakhir', 422);

        $ins = db()->prepare(
            'INSERT INTO presensi (user_id, sesi_id, waktu_absen, status) VALUES (:u, :s, :w, :st)'
        );
        $ins->execute(['u' => $userId, 's' => (int)$sesi['id'], 'w' => date('Y-m-d H:i:s'), 'st' => $status]);

        kirimJson(['success' => true, 'message' => 'Presensi berhasil dicatat untuk ' . $sesi['nama_sesi']], 201);
    }

    header('Allow: GET, POST');
    galat('Method tidak diizinkan', 405);

} catch (PDOException $e) {
    if (($e->errorInfo[1] ?? 0) === 1062) {
        galat('Anda sudah presensi pada sesi ini', 409);
    }
    error_log('Presensi DB error: ' . $e->getMessage());
    galat('Terjadi kesalahan internal pada server', 500);
} catch (Throwable $e) {
    error_log('Presensi error: ' . $e->getMessage());
    galat('Terjadi kesalahan internal pada server', 500);
}