-- Menggunakan database pemweb_obe
USE pemweb_obe;

-- 1. Latihan Poin 1: Menambahkan Index pada kolom 'kategori' di tabel 'alat'
CREATE INDEX idx_alat_kategori ON alat(kategori);

-- 2. Latihan Poin 2: Modifikasi/Memastikan skema tabel 'peminjaman' dengan Constraint Foreign Key
-- (Catatan: Jika tabel peminjaman sudah terbuat sebelumnya, constraint ini sudah otomatis aktif)
ALTER TABLE peminjaman
  ADD CONSTRAINT fk_peminjaman_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_peminjaman_alat FOREIGN KEY (alat_id) REFERENCES alat(id) ON DELETE RESTRICT;
  
  // Rentan SQL Injection
$kategori = $_GET['kategori'] ?? '';
$sql = "SELECT * FROM alat WHERE kategori = '" . $kategori . "'";
$stmt = $pdo->query($SQL);

// Kebal SQL Injection
$kategori = $_GET['kategori'] ?? '';
$stmt = $pdo->prepare('SELECT * FROM alat WHERE kategori = :kategori');
$stmt->execute(['kategori' => $kategori]);