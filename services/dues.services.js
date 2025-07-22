import { getDB } from './../config/connect.js';

// GET '/dues'
export async function getDues() {
  const db = await getDB();
  const [dues] = await db.query('SELECT * FROM dues');
  return dues;
}

// GET '/dues/:id'
export async function getDuesById(id) {
  const db = await getDB();
  const [dues] = await db.query('SELECT * FROM dues WHERE id = ?', [id]);
  const due = dues[0];
  return due || null;
}

// GET '/dues/member/:id'
export async function getDuesByMemberId(id) {
  const db = await getDB();
  const [dues] = await db.query(
    `
      SELECT 
        d.*,
        m.first_name,
        m.last_name
        FROM dues d
        JOIN households h ON d.household_id = h.id
        JOIN families f ON f.household_id = h.id
        JOIN members m ON m.family_id = f.id
        WHERE m.id = ?
    `,
    [id]
  );

  const due_types = {
    'Monthly Dues': 'monthly',
    'Monthly Amortization': 'amortization',
    Taxes: 'taxes',
    Penalties: 'penalties',
    Others: 'others',
  };

  const balances = {
    monthly: 0,
    taxes: 0,
    amortization: 0,
    penalties: 0,
    others: 0,
  };

  for (const due of dues) {
    if (due.receipt_number != null) {
      due.receipt_number = String(due.receipt_number).padStart(4, '0');
    }

    if (due.status === 'Unpaid') {
      const key = due_types[due.due_type] || 'others';
      const amount = parseFloat(due.amount) || 0;
      balances[key] += amount;
    }
  }

  return {
    dues,
    balances,
  };
}

// GET '/dues/report/'
export async function getDuesReport() {
  const db = await getDB();
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // monthly collection efficiency
  const [billed_result] = await db.query(
    `
    SELECT SUM(amount) AS total_billed
    FROM dues
    WHERE MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
    [month, year]
  );

  const [collected_result] = await db.query(
    `
    SELECT SUM(amount) AS total_collected 
    FROM dues
    WHERE status = 'Paid' AND MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
    [month, year]
  );
  const total_billed = billed_result[0].total_billed || 0;
  const total_collected = collected_result[0].total_collected || 0;
  const efficiency =
    total_billed === 0 ? null : (total_collected / total_billed) * 100;

  const collection_efficiency = {
    total_billed,
    total_collected,
    efficiency,
  };

  // summary of dues by due type, including paid and unpaid breakdown
  const [dues_by_type] = await db.query(
    `
    SELECT 
    due_type,
    COUNT(*) AS total_dues,
    SUM(amount) AS total_amount,
      SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) AS paid_amount,
      SUM(CASE WHEN status = 'Unpaid' THEN amount ELSE 0 END) AS unpaid_amount
    FROM dues
    WHERE MONTH(due_date) = ? AND YEAR(due_date) = ?
    GROUP BY due_type
  `,
    [month, year]
  );

  const due_types = [
    'Monthly Amortization',
    'Monthly Dues',
    'Taxes',
    'Penalties',
    'Others',
  ];

  const summary_due_type = due_types.map((type) => {
    const row = dues_by_type.find((r) => r.due_type === type);
    return {
      due_type: type,
      total_dues: row?.total_dues || 0,
      total_amount: parseFloat(row?.total_amount || 0),
      paid_amount: parseFloat(row?.paid_amount || 0),
      unpaid_amount: parseFloat(row?.unpaid_amount || 0),
    };
  });

  // summary of due by household
  const [dues_by_household] = await db.query(
    `
    SELECT
      m.first_name,
      m.last_name,
      d.household_id,
      h.block_no,
      h.lot_no,
      COUNT(d.id) AS total_dues,
      SUM(d.amount) AS total_amount,
      IF(SUM(d.status = 'Unpaid') = COUNT(*), 'Unpaid',
        IF(SUM(d.status = 'Paid') = COUNT(*), 'Fully Paid', 'Partially Paid')) AS payment_status
    FROM dues d
    JOIN households h ON d.household_id = h.id
    JOIN families f ON f.household_id = h.id
    JOIN members m ON m.id = (
      SELECT MIN(id) FROM members WHERE family_id = f.id
    )
    WHERE MONTH(d.due_date) = ? AND YEAR(d.due_date) = ?
    GROUP BY d.household_id, h.block_no, h.lot_no, m.first_name, m.last_name
`,
    [month, year]
  );

  const summary_due_household = dues_by_household.map((row) => ({
    first_name: row.first_name,
    last_name: row.last_name,
    household_id: row.household_id,
    block_no: row.block_no,
    lot_no: row.lot_no,
    total_dues: row.total_dues,
    total_amount: parseFloat(row.total_amount),
    payment_status: row.payment_status,
  }));

  // totals of unpaid dues
  const [unpaid_dues] = await db.query(
    `
    SELECT
    COUNT(*) AS total_unpaid_dues,
    SUM(amount) AS total_unpaid_amount,
    COUNT(DISTINCT household_id) as distinct_households
    FROM dues
    WHERE status = 'Unpaid'
    `
  );

  const total_unpaid_dues = {
    total_unpaid_dues: unpaid_dues[0].total_unpaid_dues,
    total_unpaid_amount: parseFloat(unpaid_dues[0].total_unpaid_amount),
    affected_households: unpaid_dues[0].distinct_households,
    average_unpaid_per_household: Math.round(
      unpaid_dues[0].total_unpaid_amount / unpaid_dues[0].distinct_households
    ),
  };

  return {
    collection_efficiency,
    summary_due_type,
    summary_due_household,
    total_unpaid_dues,
  };
}

// POST '/dues'
export async function createDues(data) {
  const db = await getDB();
  const { due_date, amount, status, due_type, member_id } = data;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows1] = await conn.query(
      `
      SELECT
      f.household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `,
      [member_id]
    );

    const household_id = rows1[0]?.household_id;

    const [rows2] = await conn.query(
      `SELECT MAX(receipt_number) AS max_receipt FROM dues FOR UPDATE`
    );
    const curr_receipt = rows2[0]?.max_receipt || 0;
    const new_receipt = curr_receipt + 1;

    const values = [
      new Date(due_date),
      amount,
      status,
      due_type,
      household_id,
      new_receipt,
    ];

    const [rows] = await conn.execute(
      'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`,  `household_id`, `receipt_number`) VALUES (?, ?, ?, ?, ?, ?)',
      values
    );

    await conn.commit();

    return {
      id: rows.insertId,
      due_date,
      amount,
      status,
      due_type,
      receipt_number: new_receipt,
      household_id,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// PUT '/dues/:id'
export async function updateDues(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'due_date',
    'amount',
    'status',
    'due_type',
    'household_id',
  ];

  const keys = Object.keys(updates);

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) {
    throw new Error('Only one valid column can be updated at a time.');
  }

  const column = keys[0];
  const value = updates[column];

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.dues SET \`${column}\` = ? WHERE id = ?`,
    [value, id]
  );

  return { affectedRows: result.affectedRows };
}

// PUT '/dues/:id'
export async function updateDuesMultiple(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'due_date',
    'amount',
    'status',
    'due_type',
    'household_id',
    'receipt_number',
  ];

  const setParts = [];
  const values = [];

  for (const column in updates) {
    if (allowedColumns.includes(column)) {
      setParts.push(`\`${column}\` = ?`);
      values.push(updates[column]);

      // if paid, add a date_paid
      if (column === 'status' && updates[column] === 'Paid') {
        setParts.push('`date_paid` = NOW()');
      } else if (updates[column] === 'Unpaid') {
        setParts.push('`date_paid` = NULL');
      }
    } else {
      throw new Error(`Attempted to update an unauthorized column: ${column}`);
    }
  }

  if (setParts.length === 0) {
    throw new Error('No valid columns provided for update.');
  }

  const setClause = setParts.join(', ');
  const query = `UPDATE kabuhayan_db.dues SET ${setClause} WHERE id = ?`;

  values.push(id); // for WHERE clause

  const [result] = await db.execute(query, values);

  return { affectedRows: result.affectedRows };
}

// DELETE '/dues/:id'
export async function deleteDues(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.dues WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}
