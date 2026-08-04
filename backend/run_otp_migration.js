const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runOTPMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Connected to MySQL DB:', process.env.DB_NAME);
    const otpMigrationPath = path.join(__dirname, '../database/migrations/07_forgot_password_otp.sql');
    const otpSql = fs.readFileSync(otpMigrationPath, 'utf8');

    console.log('Running 07_forgot_password_otp.sql...');
    await connection.query(otpSql);
    console.log('✅ OTP Migration executed successfully!');
  } catch (err) {
    console.error('Error executing OTP SQL:', err.message);
  } finally {
    await connection.end();
  }
}

runOTPMigration();
