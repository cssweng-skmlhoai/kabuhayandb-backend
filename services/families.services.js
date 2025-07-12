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

export async function getFamilyGivenHousehold(householdId) {
  const db = await getDB();
  const [families] = await db.query(
    'SELECT * FROM families WHERE household_id = ?',
    [householdId]
  );
  const family = families[0].id;
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

// DELETE '/families/:id'
export async function deleteFamily(id) {
  const db = await getDB();
  let affectedRows = 0;
  const [familyMembersResult] = await db.execute(
    'DELETE FROM kabuhayan_db.family_members WHERE family_id = ?',
    [id]
  );

  affectedRows += familyMembersResult.affectedRows;

  const [familyResult] = await db.execute(
    'DELETE FROM kabuhayan_db.families WHERE id = ?',
    [id]
  );

  affectedRows += familyResult.affectedRows;

  return affectedRows;
}
