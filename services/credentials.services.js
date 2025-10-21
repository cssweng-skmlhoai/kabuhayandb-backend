import { getDB } from './../config/connect.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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

// POST '/credentials/reset'
export async function requestPasswordReset(email) {
  // change as needed
  const db = await getDB();
  const conn = await db.getConnection();

  // set up nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.OAUTH_EMAIL,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  // Function to send reset email
  const sendPasswordResetEmail = async (email, resetToken, userId) => {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}&userId=${userId}`;

    const mailOptions = {
      from: process.env.OAUTH_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  };
  //end of my part

  try {
    await conn.beginTransaction();

    // start of part

    // Find user
    const [userRows] = await db.query(
      'SELECT id FROM credentials WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      // Don't reveal if email exists - just return success
      await conn.commit();
      return { success: true, message: 'Password reset request processed' };
    }

    const userId = userRows[0].id;

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 12);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store in database - FIXED SQL (3 values, 3 placeholders)
    await conn.query(
      `INSERT INTO reset_tokens (cid, token, expiry_date) 
       VALUES (?, ?, ?)`,
      [userId, hashedToken, expiresAt]
    );

    // Send email
    await sendPasswordResetEmail(email, token, userId);

    await conn.commit();
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Forgot password error:', error);
    await conn.rollback();
    throw new Error('Failed to process password reset request');
  } finally {
    conn.release();
  }
}

// POST '/credentials/reset/:token'
export async function resetPassword(token, new_password) {
  const db = await getDB();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [user] = await conn.query(
      'SELECT cid, expiry_date FROM reset_tokens WHERE token = ?',
      [token]
    );

    if (user[0].expiry_date < new Date()) {
      throw new Error();
    }

    const [password] = await conn.query(
      'SELECT id, password FROM credentials WHERE member_id = ?',
      [user[0].cid]
    );

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
