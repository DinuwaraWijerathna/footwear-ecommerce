-- ═══════════════════════════════════════════════
-- STEPZ — Adds the missing `orders` table ONLY.
-- Safe to run even if you already have products/users data —
-- this does NOT touch or delete those tables.
--
-- HOW TO RUN (phpMyAdmin):
--   1. Open phpMyAdmin -> click "stepz_db" in the left sidebar
--   2. Click the "Import" tab -> choose this file -> click "Go"
--   (Or: click the "SQL" tab, paste this whole file's contents, click "Go")
-- ═══════════════════════════════════════════════

USE stepz_db;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT DEFAULT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) DEFAULT NULL,
  customer_city VARCHAR(100) DEFAULT NULL,
  customer_address VARCHAR(255) DEFAULT NULL,
  items JSON NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'cod',
  card_last4 VARCHAR(4) DEFAULT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
