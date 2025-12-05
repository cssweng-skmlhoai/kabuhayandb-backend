import { getDB } from '../config/connect.js';

// GET '/changes'
export async function getChanges(filters) {
  const db = await getDB();

  const { page, limit, search, dateFrom, dateTo } = filters;

  let sql = `
    SELECT 
        c.*,
        CONCAT(A.first_name, ' ', A.last_name) AS admin_name, 
        CONCAT(M.first_name, ' ', M.last_name) AS member_name
    FROM 
        changes c
    LEFT JOIN 
        members A ON c.admin_id = A.id 
    LEFT JOIN 
        members M ON c.member_id = M.id
  `;

  const whereClauses = [];
  const queryParams = [];

  console.log(dateFrom, dateTo);

  if (dateFrom && dateTo) {
    console.log(dateFrom, dateTo);
    if (dateFrom === dateTo) {
      whereClauses.push(
        `c.date_changed >= ? AND c.date_changed < DATE_ADD(?, INTERVAL 1 DAY)`
      );
      queryParams.push(dateFrom, dateFrom);
    } else {
      whereClauses.push(
        `c.date_changed >= ? AND c.date_changed < DATE_ADD(?, INTERVAL 1 DAY)`
      );
      queryParams.push(dateFrom, dateTo);
    }
  }

  if (search) {
    const searchTerm = `%${search}%`;
    whereClauses.push(`
      (
        c.change_type LIKE ? OR 
        c.field_changed LIKE ? OR 
        c.new_value LIKE ? OR 
        CONCAT(A.first_name, ' ', A.last_name) LIKE ? OR 
        CONCAT(M.first_name, ' ', M.last_name) LIKE ?
      )
    `);
    queryParams.push(
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm
    );
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ` + whereClauses.join(' AND ');
  }

  const safeLimit = parseInt(limit) || 10;
  const safePage = parseInt(page) || 1;
  const offset = (safePage - 1) * safeLimit;

  sql += ` ORDER BY c.date_changed DESC LIMIT ? OFFSET ?`;
  queryParams.push(safeLimit, offset);

  const [rows] = await db.query(sql, queryParams);

  const transformedRows = rows.map((row) => {
    const {
      id,
      date_changed,
      admin_id,
      member_id,
      change_type,
      field_changed,
      old_value,
      new_value,
      admin_name,
      member_name,
    } = row;

    return {
      id,
      date: date_changed,
      changedBy: admin_name || admin_id,
      member: member_name || member_id,
      change_type: change_type,
      field_changed: field_changed,
      past_value: old_value,
      new_value: new_value,
    };
  });

  return transformedRows;
}

export async function logChange(data, conn) {
  if (!conn) {
    conn = await getDB();
  }
  const {
    admin_id,
    member_id,
    change_type,
    field_changed,
    old_value,
    new_value,
  } = data;

  const date_changed = new Date();

  try {
    await conn.beginTransaction();

    const values = [
      date_changed,
      admin_id,
      member_id,
      change_type,
      field_changed,
      old_value,
      new_value,
    ];

    const [rows] = await conn.execute(
      'INSERT INTO kabuhayan_db.changes (`date_changed`, `admin_id`, `member_id`, `change_type`,  `field_changed`, `old_value`, `new_value`) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values
    );

    await conn.commit();

    return {
      id: rows.insertId,
      date_changed,
      admin_id,
      member_id,
      change_type,
      field_changed,
      old_value,
      new_value,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
}
