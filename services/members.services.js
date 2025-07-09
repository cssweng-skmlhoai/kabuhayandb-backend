import { getDB } from '../config/connect.js';
import * as familyServices from './families.services.js';
import * as householdServices from './households.services.js';

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

// GET '/members/:first/:last'
export async function getMemberByName(first, last) {
  const db = await getDB();
  const [members] = await db.query(
    'SELECT * FROM members WHERE first_name = ? AND last_name = ?',
    [first][last]
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
    gender,
    contact_number,
    confirmity_signature,
    remarks,
    family_id,
  } = data;

  const values = [
    last_name,
    first_name,
    middle_name,
    new Date(birth_date),
    gender,
    contact_number,
    confirmity_signature,
    remarks,
    family_id,
  ];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.members (`last_name`, `first_name`, `middle_name`, `birth_date`, `gender`, `contact_number`, `confirmity_signature`, `remarks`, `family_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
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

// DELETE '/members/:id'
export async function deleteMembers(id) {
  const db = await getDB();
  let affectedRows = 0;
  const memberToDelete = await getMemberById(id);
  const householdID = await familyServices.getFamilyById(
    memberToDelete.family_id
  );
  console.log(householdID);
  const householdResult = await householdServices.deleteHousehold(
    householdID.household_id
  );

  affectedRows += householdResult.affectedRows;

  const [memberResult] = await db.execute(
    'DELETE FROM kabuhayan_db.members WHERE id = ?',
    [id]
  );
  affectedRows += memberResult.affectedRows;

  return affectedRows;
}
