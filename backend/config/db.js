const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Test the database connection on startup.
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('TiDB Connected Successfully');
    connection.release();
  } catch (error) {
    console.error(`Database Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };