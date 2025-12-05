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
export async function createFamilyMember(data, conn) {
  const db = conn || (await getDB());
  const {
    family_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    gender,
    relation_to_member,
    member_id,
    educational_attainment,
  } = data;
  const values = [
    family_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    gender,
    relation_to_member,
    member_id,
    educational_attainment,
  ];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.family_members (`family_id`,`last_name`, `first_name`, `middle_name`, `birth_date`, `gender`, `relation_to_member`, `member_id`, `educational_attainment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    values
  );

  const created_family_member = {
    id: rows.insertId,
    family_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    gender,
    relation_to_member,
    member_id,
    educational_attainment,
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
    'gender',
    'relation_to_member',
    'member_id',
    'educational_attainment',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  let value = updates[column];

  if (column === 'birth_date') {
    if (value === null || value === undefined) {
      value = null;
    } else if (typeof value === 'string') {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid date format for birth_date: ${value}`);
      }
      value = parsed;
    } else if (!(value instanceof Date)) {
      throw new Error(`Invalid type for birth_date`);
    }
  }

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.family_members SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// PUT '/family_members/:id'
export async function updateFamilyMemberMultiple(id, updates, conn = null) {
  const db = conn || (await getDB());

  const allowedColumns = [
    'family_id',
    'last_name',
    'first_name',
    'middle_name',
    'birth_date',
    'gender',
    'relation_to_member',
    'member_id',
    'educational_attainment',
  ];

  const setParts = [];
  const values = [];

  for (const column in updates) {
    if (allowedColumns.includes(column)) {
      let value = updates[column];

      if (column === 'birth_date') {
        if (value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'string') {
          const parsed = new Date(value);
          if (isNaN(parsed.getTime())) {
            throw new Error(`Invalid date format for birth_date: ${value}`);
          }
          value = parsed;
        } else if (!(value instanceof Date)) {
          throw new Error(`Invalid type for birth_date`);
        }
      }

      setParts.push(`\`${column}\` = ?`);
      values.push(value);
    } else {
      throw new Error(`Attempted to update an unauthorized column: ${column}`);
    }
  }

  if (setParts.length === 0) {
    throw new Error('No valid columns provided for update.');
  }

  const setClause = setParts.join(', ');
  const query = `UPDATE kabuhayan_db.family_members SET ${setClause} WHERE id = ?`;

  values.push(id);

  const [result] = await db.execute(query, values);

  return { affectedRows: result.affectedRows };
}

// DELETE '/members/:id'
export async function deleteFamilyMembers(id, conn = null) {
  const db = conn || (await getDB());

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.family_members WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
