import pool from './connect.js';

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS current_time');
    console.log('✅ Connected to TiDB! Current time:', rows[0].current_time);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end(); // Close the connection pool
  }
}

testConnection();