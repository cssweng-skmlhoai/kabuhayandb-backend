import { getDB } from '../config/connect.js';

// GET '/family_members'
export async function getFamilyMembers() {
  const db = await getDB();
  const [family_members] = await db.query('SELECT * FROM family_members');
  return family_members;
}

// GET '/family_members/:id'
export async function getFamilyMemberById(id) {
  const db = await getDB();
  const [family_members] = await db.query(
    'SELECT * FROM family_members WHERE id = ?',
    [id]
  );
  const family_member = family_members[0];
  return family_member || null;
}

// POST '/family_members'
export async function createFamilyMember(data) {
  const db = await getDB();
  const {
    family_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    age,
    gender,
    relation_to_family,
    member_id,
  } = data;
  const values = [
    family_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    age,
    gender,
    relation_to_family,
    member_id,
  ];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.family_members (`family_id`,`last_name`, `first_name`, `middle_name`, `birth_date`, `age`, `gender`, `relation_to_family`, `member_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    values
  );

  const created_family_member = {
    id: rows.insertId,
    family_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    age,
    gender,
    relation_to_family,
    member_id,
  };

  return created_family_member;
}

// PUT '/members/:id'
export async function updateFamilyMember(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'family_id',
    'last_name',
    'first_name',
    'middle_name',
    'birth_date',
    'age',
    'gender',
    'relation_to_family',
    'member_id',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.family_members SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// DELETE '/members/:id'
export async function deleteFamilyMembers(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.family_members WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
