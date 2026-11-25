-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.33 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for pemweb_obe
CREATE DATABASE IF NOT EXISTS `pemweb_obe` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `pemweb_obe`;

-- Dumping structure for table pemweb_obe.alat
DROP TABLE IF EXISTS `alat`;
CREATE TABLE IF NOT EXISTS `alat` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah` int(10) unsigned NOT NULL DEFAULT '0',
  `kondisi` enum('Baik','Perlu Cek','Rusak') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Baik',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_alat_kategori` (`kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pemweb_obe.alat: ~12 rows (approximately)
/*!40000 ALTER TABLE `alat` DISABLE KEYS */;
INSERT INTO `alat` (`id`, `nama`, `kategori`, `jumlah`, `kondisi`, `created_at`, `updated_at`) VALUES
	(2, 'Multimeter Digital', 'Elektronika', 10, 'Baik', '2026-10-28 13:09:21', '2026-10-28 13:09:21'),
	(3, 'Kabel UTP Cat6', 'Jaringan', 25, 'Perlu Cek', '2026-10-28 13:09:21', '2026-11-04 10:54:45'),
	(5, 'Scanner QR Code', 'Perangkat', 15, 'Perlu Cek', '2026-11-04 10:55:39', '2026-11-04 10:55:39'),
	(6, 'Access Point Wi-Fi 6', 'Jaringan', 8, 'Baik', '2026-11-04 11:01:22', '2026-11-04 11:01:22'),
	(7, 'Oscilloscope Digital', 'Elektronika', 3, 'Baik', '2026-11-11 17:50:26', '2026-11-11 17:50:26'),
	(8, 'Switch Managed 24 Port', 'Jaringan', 3, 'Baik', '2026-11-18 17:37:25', '2026-11-18 17:37:25'),
	(9, 'Scanner QR Code', 'Perangkat', 5, 'Baik', '2026-11-25 09:52:53', '2026-11-25 09:52:53'),
	(10, 'Webcam HD Absensi', 'Kamera', 3, 'Baik', '2026-11-25 09:52:53', '2026-11-25 09:52:53'),
	(11, 'Tablet Presensi', 'Perangkat', 2, 'Perlu Cek', '2026-11-25 09:52:53', '2026-11-25 09:52:53'),
	(12, 'Kabel LAN UTP', 'Jaringan', 10, 'Perlu Cek', '2026-11-25 09:52:53', '2026-11-25 09:52:53'),
	(13, 'Printer Card ID', 'Perangkat', 1, 'Baik', '2026-11-25 09:52:53', '2026-11-25 09:52:53'),
	(14, 'Router Wi-Fi 6', 'Jaringan', 4, 'Baik', '2026-11-25 09:52:53', '2026-11-25 09:52:53');
/*!40000 ALTER TABLE `alat` ENABLE KEYS */;

-- Dumping structure for table pemweb_obe.presensi
DROP TABLE IF EXISTS `presensi`;
CREATE TABLE IF NOT EXISTS `presensi` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `sesi_id` int(10) unsigned NOT NULL,
  `waktu_absen` datetime NOT NULL,
  `status` enum('Hadir','Izin','Sakit') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hadir',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_presensi` (`user_id`,`sesi_id`),
  KEY `fk_presensi_sesi` (`sesi_id`),
  CONSTRAINT `fk_presensi_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `sesi_qr` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_presensi_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pemweb_obe.presensi: ~0 rows (approximately)
/*!40000 ALTER TABLE `presensi` DISABLE KEYS */;
INSERT INTO `presensi` (`id`, `user_id`, `sesi_id`, `waktu_absen`, `status`) VALUES
	(1, 3, 3, '2026-11-25 11:59:21', 'Hadir');
/*!40000 ALTER TABLE `presensi` ENABLE KEYS */;

-- Dumping structure for table pemweb_obe.sesi_qr
DROP TABLE IF EXISTS `sesi_qr`;
CREATE TABLE IF NOT EXISTS `sesi_qr` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dosen_id` int(10) unsigned NOT NULL,
  `nama_sesi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kode_qr` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `berlaku_sampai` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_qr` (`kode_qr`),
  KEY `fk_sesi_dosen` (`dosen_id`),
  CONSTRAINT `fk_sesi_dosen` FOREIGN KEY (`dosen_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pemweb_obe.sesi_qr: ~2 rows (approximately)
/*!40000 ALTER TABLE `sesi_qr` DISABLE KEYS */;
INSERT INTO `sesi_qr` (`id`, `dosen_id`, `nama_sesi`, `kode_qr`, `berlaku_sampai`, `created_at`) VALUES
	(3, 1, 'pemrograman web', '0987', '2026-11-25 12:02:00', '2026-11-25 11:48:30');
/*!40000 ALTER TABLE `sesi_qr` ENABLE KEYS */;

-- Dumping structure for table pemweb_obe.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `peran` enum('Siswa/Mahasiswa','Guru/Dosen') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table pemweb_obe.users: ~4 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `nama`, `email`, `password`, `peran`, `created_at`) VALUES
	(1, '198001012005011001', 'Dosen Pemweb', 'dosen@absensiqr.test', '$2y$12$Lo.61YSA8j6eEWdS5INLueCN5Q6Zu8pjxFhdX7c0giIODLpIlHFh2', 'Guru/Dosen', '2026-11-25 10:37:18'),
	(2, '2440000001', 'Mahasiswa Contoh', 'mahasiswa@absensiqr.test', '$2y$12$Lo.61YSA8j6eEWdS5INLueCN5Q6Zu8pjxFhdX7c0giIODLpIlHFh2', 'Siswa/Mahasiswa', '2026-11-25 10:37:18'),
	(3, '2440304021', 'NAZWA SALWA ADELLIA', '2440304021@mhs.ubt.ac.id', '$2y$12$PvC78Uq9N9IAjUsMTUnUgesLEOt60lsxojF7bFu5LT9xuUG3QE.KS', 'Siswa/Mahasiswa', '2026-11-25 11:19:36'),
	(4, '2440304005', 'ERMA SARI', 'imakece28@gmail.com', '$2y$12$IoU81L5tGfAqkQv4/98WseroJFEKnA7pUevnxfTIFSdldTP/U4kUy', 'Siswa/Mahasiswa', '2026-11-25 11:20:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
