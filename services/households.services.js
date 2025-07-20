import { getDB } from '../config/connect.js';
import * as familyServices from './families.services.js';

// GET '/households'
export async function getHouseholds() {
  const db = await getDB();
  const [households] = await db.query('SELECT * FROM households');
  return households;
}

// GET '/households/:id'
export async function getHouseholdById(id) {
  const db = await getDB();
  const [households] = await db.query('SELECT * FROM households WHERE id = ?', [
    id,
  ]);
  const household = households[0];
  return household || null;
}

// POST '/households'
export async function createHouseholds(data, conn) {
  const db = conn || (await getDB());
  const {
    condition_type,
    tct_no,
    block_no,
    lot_no,
    area,
    open_space_share,
    Meralco,
    Maynilad,
    Septic_Tank,
  } = data;
  const values = [
    condition_type,
    tct_no,
    block_no,
    lot_no,
    area,
    open_space_share,
    Meralco,
    Maynilad,
    Septic_Tank,
  ];
  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.households (`condition_type`, `tct_no`, `block_no`, `lot_no`, `area`, `open_space_share`, `Meralco`, `Maynilad`, `Septic_Tank`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    values
  );

  const created_household = {
    id: rows.insertId,
    condition_type,
    tct_no,
    block_no,
    lot_no,
    area,
    open_space_share,
    Meralco,
    Maynilad,
    Septic_Tank,
  };

  return created_household;
}

// PUT '/households/:id'
export async function updateHouseholds(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'condition_type',
    'tct_no',
    'block_no',
    'lot_no',
    'area',
    'open_space_share',
    'Meralco',
    'Maynilad',
    'Septic_Tank',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.households SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

export async function updateHouseholdMultiple(id, updates, conn = null) {
  const db = conn || (await getDB());

  const allowedColumns = [
    'condition_type',
    'tct_no',
    'block_no',
    'lot_no',
    'area',
    'open_space_share',
    'Meralco',
    'Maynilad',
    'Septic_Tank',
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

  const query = `UPDATE kabuhayan_db.households SET ${setClause} WHERE id = ?`;

  values.push(id);

  const [result] = await db.execute(query, values);

  return { affectedRows: result.affectedRows };
}

// DELETE '/households/:id'
export async function deleteHousehold(id) {
  const db = await getDB();

  let totalAffectedFamilyMembers = 0;
  try {
    const [duesResult] = await db.execute(
      'DELETE FROM kabuhayan_db.dues WHERE household_id = ?',
      [id]
    );

    const family = await familyServices.getFamilyGivenHousehold(id);
    if (family && family.id) {
      const affectedMembers = await familyServices.deleteFamily(family.id);
      totalAffectedFamilyMembers = affectedMembers;
      console.log(
        `Family (ID: ${family.id}) and its members deleted. Affected members: ${affectedMembers}`
      );
    } else {
      console.log(`No family found for household ${id} to delete.`);
    }
    const [householdResult] = await db.execute(
      'DELETE FROM kabuhayan_db.households WHERE id = ?',
      [id]
    );
    console.log('Total Family Members Affected: ' + totalAffectedFamilyMembers);
    return totalAffectedFamilyMembers;
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}
