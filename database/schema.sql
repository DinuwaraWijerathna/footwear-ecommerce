-- ═══════════════════════════════════════════════
-- STEPZ Database Setup
-- phpMyAdmin -> Import tab -> select this file -> Go
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS stepz_db;
USE stepz_db;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) DEFAULT NULL,
  badge VARCHAR(20) DEFAULT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  image VARCHAR(255) NOT NULL,
  sizes VARCHAR(100) NOT NULL,      -- comma separated e.g. "6,7,8,9,10,11,12"
  description TEXT,
  in_stock TINYINT(1) DEFAULT 1
);

-- Migrating the same 8 products that were hardcoded in app.js,
-- so nothing is lost when you switch to the database.
INSERT INTO products
  (brand, name, category, price, old_price, badge, rating, reviews, image, sizes, description, in_stock)
VALUES
('Nike', 'Air Max 270 React', 'men', 18500, 24000, 'sale', 4.8, 214, 'assets/images/product_mens.png', '6,7,8,9,10,11,12',
 'The Nike Air Max 270 React combines two of Nike''s most innovative cushioning technologies. Featuring a massive heel Air unit and React foam midsole, this shoe delivers all-day comfort and a sleek, modern profile.', 1),

('Adidas', 'Ultraboost 23', 'sport', 21000, NULL, 'new', 4.9, 187, 'assets/images/product_sport.png', '6,7,8,9,10,11',
 'Engineered for elite performance. Adidas Ultraboost 23 features BOOST midsole technology, Primeknit+ upper, and a Continental rubber outsole for superior grip in all conditions.', 1),

('Steve Madden', 'Elara Stiletto Heels', 'women', 9800, 14500, 'sale', 4.7, 92, 'assets/images/product_womens.png', '4,5,6,7,8,9',
 'The Elara stiletto by Steve Madden is the epitome of elegant femininity. Crafted from premium materials with a sleek pointed toe and 4-inch heel that commands attention at every event.', 1),

('Timberland', 'Premium Loafer', 'casual', 13500, NULL, 'hot', 4.6, 143, 'assets/images/product_casual.png', '6,7,8,9,10,11,12',
 'The Timberland Premium Loafer is crafted from full-grain leather with a padded collar and premium foam footbed. Versatile enough for the office or weekend outings.', 1),

('Jordan', 'Air Jordan 1 Retro High', 'men', 32000, 38000, 'sale', 4.9, 512, 'assets/images/product_mens.png', '7,8,9,10,11,12',
 'The iconic Air Jordan 1 Retro High OG is a classic reimagined. Premium leather upper with Nike Air cushioning delivers unparalleled comfort and style that has transcended generations.', 1),

('Puma', 'Nitro Runner Elite', 'sport', 15800, NULL, 'new', 4.5, 76, 'assets/images/product_sport.png', '6,7,8,9,10,11',
 'Built for speed and endurance, the Puma Nitro Runner Elite uses NITRO foam technology for a super-responsive ride with every stride. Lightweight, breathable, and race-ready.', 1),

('Aldo', 'Strappy Sandal Heels', 'women', 7200, 10800, 'sale', 4.4, 61, 'assets/images/product_womens.png', '4,5,6,7,8',
 'ALDO Strappy Sandal Heels feature delicate ankle straps and a block heel for balance and style. Perfect for summer events, brunches, and evening outings.', 1),

('Skechers', 'Arch Fit Loafer', 'casual', 8900, 11000, 'sale', 4.6, 208, 'assets/images/product_casual.png', '6,7,8,9,10,11,12',
 'Skechers Arch Fit Loafer features an orthopedic insole developed with podiatrists. Superior arch support combined with a stylish slip-on design for all-day comfort.', 1);
