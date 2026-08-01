-- =============================================
-- Day 5: Admin Module Schema Updates
-- Run AFTER the original schema.sql
-- =============================================

USE ride_sharing_db;

-- Add 'admin' to the users role enum and add status column
ALTER TABLE users
  MODIFY COLUMN role ENUM('rider', 'driver', 'admin') NOT NULL DEFAULT 'rider',
  ADD COLUMN status ENUM('active', 'blocked') DEFAULT 'active' AFTER role;

-- Seed a default admin user (password: admin123)
-- bcryptjs hash for 'admin123' with 10 rounds
INSERT INTO users (full_name, email, password, phone, role, status)
VALUES (
  'Admin User',
  'admin@rideshare.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '9999999999',
  'admin',
  'active'
)
ON DUPLICATE KEY UPDATE role = 'admin';
