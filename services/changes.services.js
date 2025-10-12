import { getDB } from '../config/connect.js';

// GET '/changes'
export async function getChanges() {
  const db = await getDB();
  const [rows] = await db.query('SELECT * FROM changes');

  for (const row of rows) {
    if (row.crn != null) {
      row.crn = String(row.crn).padStart(4, '0');
    }
  }
  return rows;
}

// GET '/changes/:id'
export async function getChangeById(id) {
  const db = await getDB();
  const [rows] = await db.query('SELECT * FROM changes WHERE id = ?', [id]);
  const certification = rows[0];
  return certification || null;
}

// GET '/changes/:type'
export async function getChangesByType(type) {
  const db = await getDB();
  const [rows] = await db.query('SELECT * FROM changes WHERE change_type = ?', [
    type,
  ]);
  return rows;
}

// POST '/changes'
export async function createChange(data, conn) {
  if (!conn) {
    conn = await getDB();
  }
  const {
    date,
    admin_id,
    member_id,
    change_type,
    field_changed,
    old_value,
    new_value,
  } = data;

  try {
    await conn.beginTransaction();

    const values = [
      new Date(date),
      admin_id,
      member_id,
      change_type,
      field_changed,
      old_value,
      new_value,
    ];

    const [rows] = await conn.execute(
      'INSERT INTO kabuhayan_db.dues (`date`, `admin_id`, `member_id`, `change_type`,  `field_changed`, `old_value`, `new_value`) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values
    );

    await conn.commit();

    return {
      id: rows.insertId,
      date,
      admin_id,
      member_id,
      change_type,
      field_changed,
      old_value,
      new_value,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
}
