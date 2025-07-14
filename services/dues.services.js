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

// GET '/dues/member/:id'
export async function getDuesByMemberId(id) {
  const db = await getDB();
  const [dues] = await db.query(
    `
      SELECT 
        d.*
        FROM dues d
        JOIN households h ON d.household_id = h.id
        JOIN families f ON f.household_id = h.id
        JOIN members m ON m.family_id = f.id
        WHERE m.id = ?
    `,
    [id]
  );

  const balances = {
    monthly: 0,
    taxes: 0,
    amortization: 0,
    penalties: 0,
    others: 0,
  };

  for (const due of dues) {
    if (!balances[due.due_type]) balances[due.due_type] = balances.others;
    balances[due.due_type] += due.amount;
  }

  return {
    dues,
    balances,
  };
}

// GET '/dues/report/:id'
export async function getDuesReportByMemberId(id) {
  const db = await getDB();
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  // monthly collection efficiency
  const [total_billed] = await db.query(
    `
    SELECT SUM(amount) AS total_billed
    FROM dues
    WHERE MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
    [month, year]
  );

  const [total_collected] = await db.query(
    `
    SELECT SUM(amount) AS total_collected 
    FROM dues
    WHERE status = 'Paid' AND MONTH(due_date) = ? AND YEAR(due_data) = ?
    `,
    [month, year]
  );

  const efficiency = (total_collected / total_billed) * 100;

  const collection_efficiency = {
    total_billed: total_billed[0].total_billed || 0,
    total_collected: total_collected[0].total_collected || 0,
    efficiency: (total_collected / total_billed) * 100,
  };
}

// POST '/dues'
export async function createDues(data) {
  const db = await getDB();
  const { due_date, amount, status, due_type, member_id } = data;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows1] = await conn.query(
      `
      SELECT
      f.household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `,
      [member_id]
    );

    const household_id = rows1[0]?.household_id;
    const values = [new Date(due_date), amount, status, due_type, household_id];

    const [rows] = await conn.execute(
      'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`,  `household_id`) VALUES (?, ?, ?, ?, ?)',
      values
    );

    const due_id = rows.insertId;
    const receipt_number = due_id.toString().padStart(5, '0');

    await conn.execute(
      'UPDATE kabuhayan_db.dues SET receipt_number = ? WHERE id = ?',
      [receipt_number, due_id]
    );

    await conn.commit();

    return {
      id: rows.insertId,
      amount,
      status,
      due_type,
      receipt_number,
      household_id,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// PUT '/dues/:id'
export async function updateDues(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'due_date',
    'amount',
    'status',
    'due_type',
    'household_id',
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
