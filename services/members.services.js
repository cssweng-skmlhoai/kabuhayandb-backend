import { getDB } from '../config/connect.js';
import { createCredentials } from './credentials.services.js';
import {
  updateFamiliesMultiple,
  createFamilies,
  getFamilyById,
} from './families.services.js';
import {
  updateFamilyMemberMultiple,
  createFamilyMember,
  deleteFamilyMembers,
} from './family_members.services.js';
import {
  updateHouseholdMultiple,
  createHouseholds,
  deleteHousehold,
} from './households.services.js';

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
      h.tct_no,
      c.pfp
    FROM members m
    JOIN families f ON m.family_id = f.id
    JOIN households h ON f.household_id = h.id
    LEFT JOIN credentials c ON c.member_id = m.id
  `);
  return members;
}

// POST '/members/info'
export async function createMemberInfo(data) {
  const db = await getDB();
  const conn = await db.getConnection();
  const { members, families, households, family_members } = data;

  try {
    await conn.beginTransaction();

    const household_data = await createHouseholds(households, conn);

    const family_data = await createFamilies(
      {
        ...families,
        household_id: household_data.id,
      },
      conn
    );

    const member_data = await createMembers(
      {
        ...members,
        family_id: family_data.id,
      },
      conn
    );

    const created_family_members = [];
    if (Array.isArray(family_members)) {
      for (const fm of family_members) {
        const created_fm = await createFamilyMember(
          {
            ...fm,
            family_id: family_data.id,
            member_id: member_data.id,
          },
          conn
        );
        created_family_members.push(created_fm);
      }
    }

    const username = `${members.first_name.toLowerCase()}_${members.last_name.toLowerCase()}`;
    const length = 10;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const data = {
      member_id: member_data.id,
      username,
      password,
      pfp: null,
    };

    const credentials = await createCredentials(data, conn);
    await conn.commit();

    return {
      household_data,
      family_data,
      member_data,
      family_members,
      credentials: {
        username,
        password,
      },
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// GET '/members/info/:id'
export async function getMemberInfoById(id) {
  const db = await getDB();
  const [members] = await db.query(
    `
      SELECT
        m.id AS member_id,
        m.last_name,
        m.first_name,
        m.middle_name,
        m.birth_date,
        TIMESTAMPDIFF(YEAR, m.birth_date, CURDATE()) AS age,
        m.gender,
        f.head_position as position,
        m.contact_number,
        h.tct_no,
        h.block_no,
        h.lot_no,
        h.open_space_share,
        h.area,
        (h.area + h.open_space_share) AS total,
        m.confirmity_signature,
        m.remarks,
        f.id AS family_id,
        h.condition_type,
        h.Meralco,
        h.Maynilad,
        h.Septic_Tank,
        f.land_acquisition,
        f.status_of_occupancy,
        c.pfp
      FROM members m
      JOIN families f ON m.family_id = f.id
      JOIN households h ON f.household_id = h.id
      LEFT JOIN credentials c ON c.member_id = m.id
      WHERE m.id = ?;
    `,
    [id]
  );

  const member = members[0];
  if (!member) return null;

  const [familyMembers] = await db.query(
    `
      SELECT
        id,
        last_name,
        first_name,
        middle_name,
        relation_to_member AS relation,
        birth_date,
        TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age,
        gender,
        educational_attainment
      FROM family_members
      WHERE member_id = ?
    `,
    [id]
  );

  return {
    ...member,
    family_members: familyMembers,
  };
}

// PUT 'members/info/:id'
export async function updateMemberInfo(id, payload) {
  const db = await getDB();
  const conn = await db.getConnection();
  const { members, families, households, family_members } = payload;

  const [rows] = await conn.query(
    `
    SELECT
      f.id AS family_id,
      h.id AS household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      JOIN households h ON f.household_id = h.id
      WHERE m.id = ?
  `,
    [id]
  );

  const data = rows[0];
  if (!data) {
    conn.release();
    return null;
  }

  const { family_id, household_id } = data;

  try {
    await conn.beginTransaction();

    if (members && Object.keys(members).length > 0) {
      await updateMemberMultiple(id, members, conn);
    }

    if (families && Object.keys(families).length > 0) {
      await updateFamiliesMultiple(family_id, families, conn);
    }

    if (households && Object.keys(households).length > 0) {
      await updateHouseholdMultiple(household_id, households, conn);
    }

    if (family_members && Array.isArray(family_members)) {
      for (const family_member of family_members) {
        const { id: family_member_id, update, ...updates } = family_member;

        if (!family_member_id) {
          console.log({ ...updates, family_id, id });
          await createFamilyMember(
            { ...updates, family_id, member_id: id },
            conn
          );
          continue;
        }

        if (update === false && family_member_id) {
          await deleteFamilyMembers(family_member_id, conn);
        } else if (Object.keys(updates).length > 0) {
          await updateFamilyMemberMultiple(family_member_id, updates, conn);
        }
      }
    }

    await conn.commit();
    return { success: true };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// GET 'members/home?name={name}'
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

  return members;
}

// POST '/members'
export async function createMembers(data, conn = null) {
  const db = conn || (await getDB());
  const {
    last_name,
    first_name,
    middle_name,
    birth_date,
    confirmity_signature,
    remarks,
    family_id,
    contact_number,
    gender,
  } = data;
  const values = [
    last_name,
    first_name,
    middle_name,
    new Date(birth_date),
    confirmity_signature,
    remarks,
    family_id,
    contact_number,
    gender,
  ];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.members (`last_name`, `first_name`, `middle_name`, `birth_date`, `confirmity_signature`, `remarks`, `family_id`, `contact_number`, `gender`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
    contact_number,
    gender,
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
    'gender',
    'contact_number',
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
    `UPDATE kabuhayan_db.members SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

export async function updateMemberMultiple(id, updates, conn = null) {
  const db = conn || (await getDB());

  const allowedColumns = [
    'last_name',
    'first_name',
    'middle_name',
    'birth_date',
    'confirmity_signature',
    'remarks',
    'family_id',
    'gender',
    'age',
    'contact_number',
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
  let affectedRows = 0;
  const memberToDelete = await getMemberById(id);
  const householdID = await getFamilyById(memberToDelete.family_id);
  const householdResult = await deleteHousehold(householdID.household_id); //ERROR: Based on how deleteHousehold returns, it returns an int not an object
  affectedRows += householdResult; //Doing this will cause an undefined value

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.credentials WHERE id = ?',
    [memberToDelete.id]
  );

  const [memberResult] = await db.execute(
    'DELETE FROM kabuhayan_db.members WHERE id = ?',
    [id]
  );
  affectedRows += memberResult.affectedRows;

  return affectedRows;
}
