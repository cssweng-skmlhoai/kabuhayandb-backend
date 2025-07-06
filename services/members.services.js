import { getDB } from '../config/connect.js';

// GET '/members'
export async function getMembers() {
  const db = await getDB();
  const [members] = await db.query('SELECT * FROM members');
  return members;
}

// GET '/members/:id'
export async function getMemberById(id) {
  const db = await getDB();
  const [members] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
  const member = members[0];
  return member || null;
}

// GET '/members/home'
export async function getMembersHome() {
  const db = await getDB();
  const [members] = await db.query(`
    SELECT 
      m.id AS member_id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullname,
      f.head_position,
      h.block_no,
      h.lot_no,
      h.tct_no
    FROM members m
    JOIN families f ON m.family_id = f.id
    JOIN households h ON f.household_id = h.id;
  `);
  return members;
}

export async function getMembersHomeByName(name) {
  const db = await getDB();

  const [members] = await db.query(
    `
    SELECT 
      m.id AS member_id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullname,
      f.head_position,
      h.block_no,
      h.lot_no,
      h.tct_no
    FROM members m
    JOIN families f ON m.family_id = f.id
    JOIN households h ON f.household_id = h.id
    WHERE CONCAT(m.first_name, ' ', m.last_name) LIKE ?;
  `,
    [`%${name}%`]
  );
  const member = members[0];
  return member || null;
}

// POST '/members'
export async function createMembers(data) {
  const db = await getDB();
  const {
    last_name,
    first_name,
    middle_name,
    birth_date,
    confirmity_signature,
    remarks,
    family_id,
    is_admin,
  } = data;
  const values = [
    last_name,
    first_name,
    middle_name,
    new Date(birth_date),
    confirmity_signature,
    remarks,
    family_id,
    is_admin,
  ];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.members (`last_name`, `first_name`, `middle_name`, `birth_date`, `confirmity_signature`, `remarks`, `family_id`) VALUES (?, ?, ?, ?, ?, ?, ?)',
    values
  );

  const created_member = {
    id: rows.insertId,
    last_name,
    first_name,
    middle_name,
    birth_date,
    confirmity_signature,
    remarks,
    family_id,
    is_admin,
  };

  return created_member;
}

// PUT '/members/:id'
export async function updateMembers(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'last_name',
    'first_name',
    'middle_name',
    'birth_date',
    'confirmity_signature',
    'remarks',
    'family_id',
    'is_admin',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.members SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

export async function updateMemberMultiple(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'last_name',
    'first_name',
    'middle_name',
    'birth_date',
    'confirmity_signature',
    'remarks',
    'family_id',
  ];

  const setParts = [];
  const values = [];

  for (const column in updates) {
    if (allowedColumns.includes(column)) {
      let valueToPush = updates[column];

      if (column === 'birth_date') {
        if (valueToPush === null || valueToPush === undefined) {
          valueToPush = null;
        } else if (typeof valueToPush === 'string') {
          const parsedDate = new Date(valueToPush);
          if (isNaN(parsedDate.getTime())) {
            throw new Error(
              `Invalid date format for birth_date: "${valueToPush}". Expected a valid date string (e.g., "YYYY-MM-DD") or a Date object.`
            );
          }
          valueToPush = parsedDate;
        } else if (!(valueToPush instanceof Date)) {
          throw new Error(
            `Invalid type for birth_date: expected Date object, string, null, or undefined.`
          );
        }
      }

      setParts.push(`\`${column}\` = ?`);
      values.push(valueToPush);
    } else {
      throw new Error(`Attempted to update an unauthorized column: ${column}`);
    }
  }

  if (setParts.length === 0) {
    throw new Error('No valid columns provided for update.');
  }

  const setClause = setParts.join(', ');

  const query = `UPDATE kabuhayan_db.members SET ${setClause} WHERE id = ?`;

  values.push(id);

  const [result] = await db.execute(query, values);

  return { affectedRows: result.affectedRows };
}

// DELETE '/members/:id'
export async function deleteMembers(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.members WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
