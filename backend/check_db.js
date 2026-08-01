const { pool, testConnection } = require('./config/db');

async function checkData() {
  try {
    await testConnection();
    const [users] = await pool.query('SELECT * FROM users');
    console.log('Users in DB:', users);
    
    const [rides] = await pool.query('SELECT * FROM rides');
    console.log('Rides in DB:', rides);

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    process.exit();
  }
}

checkData();
