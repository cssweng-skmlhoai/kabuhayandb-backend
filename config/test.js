import pool from './connect.js';

// NOTE: can be deprecated after

async function testConnection() {
  try {
    const values = [
      [1200.5, 850.75, 300.0],
      [1300.0, 900.0, 350.0],
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
