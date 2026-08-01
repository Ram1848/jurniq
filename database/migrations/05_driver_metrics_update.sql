-- =============================================
-- Migration: Add Driver Metrics for AI Recommendation & Safety Score
-- =============================================

USE ride_sharing_db;

-- Add new columns to drivers table
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS driver_rating DECIMAL(3, 2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS completed_rides INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancelled_rides INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS complaints INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_arrivals INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS safety_score INT DEFAULT 100;
