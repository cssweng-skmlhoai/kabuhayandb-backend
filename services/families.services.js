import { getDB } from '../config/connect.js';

// GET '/families'
export async function getFamilies() {
  const db = await getDB();
  const [families] = await db.query('SELECT * FROM families');
  return families;
}

// GET '/families/:id'
export async function getFamilyById(id) {
  const db = await getDB();
  const [families] = await db.query('SELECT * FROM families WHERE id = ?', [
    id,
  ]);
  const family = families[0];
  return family || null;
}

// POST '/families'
export async function createFamilies(data) {
  const db = await getDB();
  const { head_position, land_acquisition, status_of_occupancy, household_id } =
    data;
  const values = [
    head_position,
    land_acquisition,
    status_of_occupancy,
    household_id,
  ];
  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.families (`head_position`, `land_acquisition`, `status_of_occupancy`, `household_id`) VALUES (?, ?, ?, ?)',
    values
  );

  const created_family = {
    id: rows.insertId,
    head_position,
    land_acquisition,
    status_of_occupancy,
    household_id,
  };

  return created_family;
}

// PUT '/families/:id'
export async function updateFamilies(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'head_position',
    'land_acquisition',
    'status_of_occupancy',
    'household_id',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.families SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

export async function updateFamiliesMultiple(id, updates, conn = null) {
  const db = conn || (await getDB());

  const allowedColumns = [
    'head_position',
    'land_acquisition',
    'status_of_occupancy',
    'household_id',
  ];

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

  const query = `UPDATE kabuhayan_db.families SET ${setClause} WHERE id = ?`;

  values.push(id);

  const [result] = await db.execute(query, values);

  return { affectedRows: result.affectedRows };
}

// DELETE '/families/:id'
export async function deleteFamilies(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.families WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
