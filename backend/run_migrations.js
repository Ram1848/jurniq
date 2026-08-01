const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSQL() {
  // Connect without DB name first to create the DB if needed
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log('Connected to MySQL server.');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const adminMigrationPath = path.join(__dirname, '../database/migrations/01_admin_migration.sql');
    const architectureMigrationPath = path.join(__dirname, '../database/migrations/02_architecture_update.sql');
    const paymentsMigrationPath = path.join(__dirname, '../database/migrations/03_payments_update.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const adminSql = fs.readFileSync(adminMigrationPath, 'utf8');
    const archSql = fs.readFileSync(architectureMigrationPath, 'utf8');
    const paymentsSql = fs.readFileSync(paymentsMigrationPath, 'utf8');

    console.log('Running schema.sql...');
    await connection.query(schemaSql);

    // Switch to the created DB
    await connection.query(`USE ${process.env.DB_NAME}`);

    console.log('Running 01_admin_migration.sql...');
    await connection.query(adminSql);

    console.log('Running 02_architecture_update.sql...');
    await connection.query(archSql);

    console.log('Running 03_payments_update.sql...');
    await connection.query(paymentsSql);

    console.log('✅ All SQL files executed successfully! The database is now seeded.');
  } catch (err) {
    console.error('Error executing SQL:', err.message);
  } finally {
    await connection.end();
  }
}

runSQL();
