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

router.post('/create', async (req, res) => {
  try {
    const pool = await getDB();
    const values = [
      new Date(),
      req.body.amount,
      req.body.status,
      req.body.due_type,
      req.body.receipt_number,
    ];

    // const values = [new Date(), 400.3, 'Paid', 'Monthly Dues', '200'];
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

  /*
  To test this method, type this into the terminal:
  curl -X POST http://localhost:3000/dues/create \
  -H "Content-Type: application/json" \
  -d '{"amount": FLOAT NUMBER, "status": "STATUS STRING", "due_type": "DUE TYPE STRING", "receipt_number": "RECEIPT NUMBER STRING"}'
  */
});

router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updates = JSON.parse(JSON.stringify(req.body));

  const allowedColumns = [
    'due_date',
    'amount',
    'status',
    'due_type',
    'receipt_number',
  ];
  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    return res
      .status(400)
      .json({ error: 'Only one valid column can be updated at a time.' });
  }

  const column = keys[0];
  const value = updates[column];

  // 🐞 Debug logs
  console.log('Updating column:', column);
  console.log('With value:', value);
  console.log('For dues_id:', id);

  try {
    const pool = await getDB();

    const [result] = await pool.execute(
      `UPDATE kabuhayan_db.dues SET \`${column}\` = ? WHERE dues_id = ?`,
      [value, id]
    );

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed.' });
  }

  /*
    curl -X PUT http://localhost:3000/dues/update/idOfRowToUpdate \
  -H "Content-Type: application/json" \
  -d '{"Column_to_update": "newValue"}'
  */
});

router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getDB();

    await pool.execute(
      `DELETE FROM kabuhayan_db.dues WHERE dues_id = ?`,
      [id] // NOTE: This needs to be in array format
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed.' });
  }

  /*
    // curl -X DELETE http://localhost:3000/dues/delete/idOfRowToDelete
  */
});

export default router;
