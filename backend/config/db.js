const mysql = require('mysql2/promise');
require('dotenv').config();

// ──────────────────────────────────────────────
// Create a MySQL connection pool using env vars
// ──────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // max simultaneous connections
  queueLimit: 0,            // unlimited queued requests
  enableKeepAlive: true,    // keep TCP connections alive
  keepAliveInitialDelay: 0, // start keep-alive immediately
});

/**
 * Test the database connection on startup.
 * Acquires a connection from the pool, logs success, then releases it.
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Connected Successfully');
    connection.release();
  } catch (error) {
    console.error(`Database Connection Failed: ${error.message}`);
    process.exit(1); // exit if DB is unreachable
  }
};

module.exports = { pool, testConnection };
