// routes/items.js
import express from 'express';
const router = express.Router();
import { getDB } from './../config/connect.js';

// Read
router.get('/read', async (req, res) => {
  try {
    const pool = await getDB();

    console.log('Here!');
    const [rows] = await pool.execute('SELECT * FROM dues');
    console.log('Here!');

    res.send(rows);
    console.log('Here!');
    console.log('✅ Connected to TiDB! Selected data:', rows);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    // possibly insert something here
  }
});
router.get('/create', async (req, res) => {
  try {
    const pool = await getDB();

    const values = [new Date(), 500.3, 'Paid', 'Monthly Dues', '100'];
    const [rows] = await pool.execute(
      'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`, `receipt_number`) VALUES (?, ?, ?, ?, ?)',
      values
    );

    res.send('Added rows: ' + rows);
    console.log('✅ Connected to TiDB! Selected data:', rows);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    // possibly insert something here
  }
});
router.put('/update', (req, res) => res.send(`Update dues ${req.params.id}`));
router.delete('/delete', (req, res) =>
  res.send(`Delete dues ${req.params.id}`)
);

export default router;
