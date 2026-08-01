-- =============================================
-- Ride Sharing Application - Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS ride_sharing_db;
USE ride_sharing_db;

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('rider', 'driver') NOT NULL DEFAULT 'rider',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Drivers Table
-- =============================================
CREATE TABLE IF NOT EXISTS drivers (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_type ENUM('bike', 'auto', 'mini', 'sedan', 'suv') NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- Rides Table
-- =============================================
CREATE TABLE IF NOT EXISTS rides (
    ride_id INT AUTO_INCREMENT PRIMARY KEY,
    rider_id INT NOT NULL,
    driver_id INT DEFAULT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    drop_location VARCHAR(255) NOT NULL,
    distance DECIMAL(10, 2) DEFAULT NULL,
    fare DECIMAL(10, 2) DEFAULT NULL,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    vehicle_type ENUM('bike', 'auto', 'mini', 'sedan', 'suv') DEFAULT 'mini',
    payment_method ENUM('cash', 'upi', 'card') DEFAULT 'cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rider_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =============================================
-- Ratings Table
-- =============================================
CREATE TABLE IF NOT EXISTS ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    rider_id INT NOT NULL,
    driver_id INT NOT NULL,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    review TEXT,
    FOREIGN KEY (ride_id) REFERENCES rides(ride_id) ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- Payments Table
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'upi', 'card') NOT NULL,
    FOREIGN KEY (ride_id) REFERENCES rides(ride_id) ON DELETE CASCADE
);
