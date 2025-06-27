import { getDB } from './../config/connect.js';

// GET '/dues'
export async function getDues() {
  const db = await getDB();
  const [dues] = await db.query('SELECT * FROM dues');
  return dues;
}

// GET '/dues/:id'
export async function getDuesById(id) {
  const db = await getDB();
  const [dues] = await db.query('SELECT * FROM dues WHERE id = ?', [id]);
  const due = dues[0];
  return due || null;
}

// POST '/dues'
export async function createDues(data) {
  const db = await getDB();
  const { due_date, amount, status, due_type, receipt_number } = data;
  const values = [due_date, amount, status, due_type, receipt_number];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`, `receipt_number`) VALUES (?, ?, ?, ?, ?)',
    values
  );

  const created_due = {
    id: rows.insertId,
    amount,
    status,
    due_type,
    receipt_number,
  };

  return created_due;
}

// PUT '/dues/:id'
export async function updateDues(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'due_date',
    'amount',
    'status',
    'due_type',
    'receipt_number',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.dues SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// DELETE '/dues/:id'
export async function deleteDues(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.dues WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
