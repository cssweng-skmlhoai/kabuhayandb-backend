import pool from './connect.js';

async function testConnection() {
  try {
    const values = [
    [1200.50, 850.75, 300.00],
    [1300.00, 900.00, 350.00],
    ];

    await pool.query(
      'INSERT INTO `dues` (`Meralco`, `Maynilad`, `Septic_Tank`) VALUES ?',
      [values]
    );

    const [rows] = await pool.query('SELECT * FROM dues');
    console.log('✅ Connected to TiDB! Selected data:', rows);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end(); // Close the connection pool
  }
}

testConnection();