import { getDB } from '../config/connect.js';

// GET '/certifications'
export async function getCertifications() {
  const db = await getDB();
  const [rows] = await db.query(
    'SELECT m.first_name, m.last_name, c.* FROM certifications c JOIN members m ON c.member_id = m.id'
  );

  for (const row of rows) {
    if (row.crn != null) {
      row.crn = String(row.crn).padStart(4, '0');
    }
  }
  return rows;
}

// GET '/certifications/:id'
export async function getCertificationById(id) {
  const db = await getDB();
  const [rows] = await db.query('SELECT * FROM certifications WHERE id = ?', [
    id,
  ]);
  const certification = rows[0];
  return certification || null;
}

// GET '/certifications/member/:id'
export async function getCertificationByMemberId(id) {
  const db = await getDB();
  const [rows] = await db.query(
    `
    SELECT
    m.first_name,
    m.last_name,
    TIMESTAMPDIFF(YEAR, m.birth_date, CURDATE()) AS age,
    c.*,
    h.block_no,
    h.lot_no
    FROM certifications c
    JOIN members m ON c.member_id = m.id
    LEFT JOIN families f ON m.family_id = f.id
    LEFT JOIN households h ON f.household_id = h.id
    WHERE c.member_id = ?
    `,
    [id]
  );//Assuming database is empty
  const certification = rows[0];//If rows is an empty array
  certification.crn = String(certification.crn).padStart(4, '0');//certification.crn is undefined and will cause error here
  return certification || null;
}

// POST '/certifications'
export async function createCertification(data) {
  const db = await getDB();
  const { member_id } = data;

  const created_at = new Date();

  const [rows] = await db.query(
    'SELECT MAX(crn) AS curr_crn FROM certifications'
  );
  const curr_crn = rows[0]?.curr_crn || 0;
  const new_crn = curr_crn + 1;

  const values = [member_id, created_at || null, new_crn];

  const [result] = await db.execute(
    'INSERT INTO kabuhayan_db.certifications (`member_id`, `created_at`, `crn`) VALUES (?, ?, ?)',
    values
  );

  const created_certification = {
    id: result.insertId,
    member_id,
    created_at,
    new_crn,
  };

  return created_certification;
}

// PUT '/certifications/:id'
export async function updateCertification(id, updates) {
  const db = await getDB();

  const allowedColumns = ['member_id', 'created_at'];
  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.certifications SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// PUT multiple fields
export async function updateCertificationMultiple(id, updates, conn = null) {
  const db = conn || (await getDB());

  const allowedColumns = ['member_id', 'created_at'];
  const setParts = [];
  const values = [];

  for (const column in updates) {
    if (allowedColumns.includes(column)) {
      setParts.push(`\`${column}\` = ?`);
      values.push(updates[column]);
    } else {
      throw new Error(`Attempted to update an unauthorized column: ${column}`);
    }
  }

  if (setParts.length === 0) {
    throw new Error('No valid columns provided for update.');
  }

  const setClause = setParts.join(', ');
  const query = `UPDATE kabuhayan_db.certifications SET ${setClause} WHERE id = ?`;
  values.push(id);

  const [result] = await db.execute(query, values);
  return { affectedRows: result.affectedRows };
}

// DELETE '/certifications/:id'
export async function deleteCertification(id) {
  const db = await getDB();
  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.certifications WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
