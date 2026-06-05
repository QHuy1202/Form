CREATE DATABASE IF NOT EXISTS bang_hai_tac CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bang_hai_tac;

CREATE TABLE IF NOT EXISTS ho_so_ung_tuyen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_ht VARCHAR(50) NULL,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    ngay_sinh DATE NOT NULL,
    gioi_tinh ENUM('nam', 'nu', 'khac') DEFAULT 'nam',
    vi_tri VARCHAR(50) NOT NULL,
    ky_nang VARCHAR(255) NULL,
    ly_do TEXT NOT NULL,
    trang_thai ENUM('cho_duyet', 'dong_y', 'tu_choi') DEFAULT 'cho_duyet',
    ngay_nop TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);