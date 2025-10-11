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
// export async function createChange(data) {
//   const db = await getDB();
//   const { member_id } = data;

//   const created_at = new Date();

//   const [rows] = await db.query(
//     'SELECT MAX(crn) AS curr_crn FROM certifications'
//   );
//   const curr_crn = rows[0]?.curr_crn || 0;
//   const new_crn = curr_crn + 1;

//   const values = [member_id, created_at || null, new_crn];

//   const [result] = await db.execute(
//     'INSERT INTO kabuhayan_db.certifications (`member_id`, `created_at`, `crn`) VALUES (?, ?, ?)',
//     values
//   );

//   const created_certification = {
//     id: result.insertId,
//     member_id,
//     created_at,
//     new_crn,
//   };

//   return created_certification;
// }
