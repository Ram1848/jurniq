-- =============================================
-- Migration: Architecture Update
-- Adds missing tables and columns for new features
-- =============================================

USE ride_sharing_db;

-- 1. Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relation VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 2. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('info', 'alert', 'promotion', 'ride_update') DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Modify Users
ALTER TABLE users
    ADD COLUMN stripe_customer_id VARCHAR(255) DEFAULT NULL AFTER phone;

-- 4. Modify Drivers
ALTER TABLE drivers
    ADD COLUMN current_lat DECIMAL(10, 8) DEFAULT NULL,
    ADD COLUMN current_lng DECIMAL(11, 8) DEFAULT NULL;

-- 5. Modify Rides
ALTER TABLE rides
    ADD COLUMN pickup_lat DECIMAL(10, 8) DEFAULT NULL AFTER pickup_location,
    ADD COLUMN pickup_lng DECIMAL(11, 8) DEFAULT NULL AFTER pickup_lat,
    ADD COLUMN drop_lat DECIMAL(10, 8) DEFAULT NULL AFTER drop_location,
    ADD COLUMN drop_lng DECIMAL(11, 8) DEFAULT NULL AFTER drop_lat;

-- 6. Modify Payments
ALTER TABLE payments
    ADD COLUMN stripe_transaction_id VARCHAR(255) DEFAULT NULL AFTER payment_method;

-- 7. Add Indexes
-- Ensure indexes exist (using a safe approach for existing tables)
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Drivers
CREATE INDEX idx_drivers_availability ON drivers(availability_status);
CREATE INDEX idx_drivers_location ON drivers(current_lat, current_lng);

-- Rides
CREATE INDEX idx_rides_rider ON rides(rider_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);

-- Ratings
CREATE INDEX idx_ratings_ride ON ratings(ride_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

