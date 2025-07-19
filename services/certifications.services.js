import { getDB } from './../config/connect.js';

// GET '/certifications'
export async function getCertifications() {
  const db = await getDB();
  const [certifications] = await db.query('SELECT * FROM certifications');
  return certifications;
}

// GET '/certifications/:id'
export async function getCertificationsById(id) {
  const db = await getDB();
  const [rows] = await db.query('SELECT * FROM certifications WHERE id = ?', [
    id,
  ]);
  const certification = rows[0];
  return certification || null;
}

// POST '/certifications'
export async function createCertifications(data) {
  const db = await getDB();
  const { member_id } = data;
  const values = [member_id];

  const [result] = await db.execute(
    'INSERT INTO kabuhayan_db.certifications (`member_id`) VALUES (?)',
    values
  );

  const created_certification = {
    id: result.insertId,
    member_id,
  };

  return created_certification;
}

// PUT '/certifications/:id'
export async function updateCertifications(id, updates) {
  const db = await getDB();

  const allowedColumns = ['member_id'];
  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  let value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.certifications SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// DELETE '/certifications/:id'
export async function deleteCertifications(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.certifications WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
