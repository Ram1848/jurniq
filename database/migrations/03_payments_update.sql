-- =============================================
-- Migration: Add created_at to payments
-- =============================================

USE ride_sharing_db;

-- We don't want an error if the column already exists, but MySQL doesn't have IF NOT EXISTS for ADD COLUMN before 8.0.29.
-- Assuming standard usage, we'll just run the add column. If it fails due to existing, we can ignore.
-- First check if created_at exists. If not, add it.
SET @dbname = DATABASE();
SET @tablename = 'payments';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
