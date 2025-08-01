import { getDB } from './../config/connect.js';
import bcrypt from 'bcrypt';

const salt_rounds = 10;

// GET '/credentials'
export async function getCredentials() {
  const db = await getDB();
  const [credentials] = await db.query('SELECT * FROM credentials');
  return credentials;
}

// GET '/credentials/:id'
export async function getCredentialsById(id) {
  const db = await getDB();
  const [rows] = await db.query('SELECT * FROM credentials WHERE id = ?', [id]);
  const credential = rows[0];
  return credential || null;
}

// GET '/credentials?username={name}'
export async function getCredentialsByName(username) {
  const db = await getDB();
  const [users] = await db.query(
    'SELECT * FROM credentials WHERE username = ?',
    username
  );
  const user = users[0];
  return user || null;
}

// GET '/credentials/member/:id'
export async function getCredentialsByMemberId(id) {
  const db = await getDB();
  const [users] = await db.query(
    'SELECT * FROM credentials WHERE member_id = ?',
    [id]
  );
  const user = users[0];
  return user || null;
}

// POST '/credentials'
export async function createCredentials(data, conn) {
  const db = conn || (await getDB());
  const { member_id, username, password, pfp } = data;
  const hashed_password = await bcrypt.hash(password, salt_rounds);
  const values = [member_id, username, hashed_password, pfp];

  const [result] = await db.execute(
    'INSERT INTO kabuhayan_db.credentials (`member_id`, `username`, `password`, `pfp`) VALUES (?, ?, ?, ?)',
    values
  );

  const created_credential = {
    id: result.insertId,
    member_id,
    username,
    pfp,
  };

  return created_credential;
}

// PUT '/credentials/:id'
export async function updateCredentials(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'member_id',
    'username',
    'password',
    'pfp',
    'is_admin',
  ];
  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  let value = updates[column];

  if (column === 'password') {
    value = await bcrypt.hash(value, salt_rounds);
  }

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.credentials SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// POST '/credentials/password/:id'
export async function changePassword(id, current_password, new_password) {
  const db = await getDB();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [password] = await conn.query(
      'SELECT id, password FROM credentials WHERE member_id = ?',
      [id]
    );

    const match = await bcrypt.compare(current_password, password[0].password); //Assuming an empty database password[0] returns undefined and will cause error here

    if (!match) throw new Error();

    const hashed_password = await bcrypt.hash(new_password, salt_rounds);

    const [result] = await conn.execute(
      'UPDATE kabuhayan_db.credentials SET password = ? WHERE id = ?',
      [hashed_password, password[0].id]
    );

    await conn.commit();
    return { affectedRows: result.affectedRows };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// DELETE '/credentials/:id'
export async function deleteCredentials(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.credentials WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}

// POST '/credentials/login'
export async function verifyLogin(username, password) {
  const db = await getDB();

  const [users] = await db.query(
    'SELECT * FROM kabuhayan_db.credentials WHERE username = ?',
    [username]
  );
  const user = users[0];

  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  delete user.password;

  return user;
}
