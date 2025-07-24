import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as CertificationsServices from '../../services/certifications.services.js';

vi.mock('../../config/connect.js', () => ({
  getDB: vi.fn().mockResolvedValue({
    execute: vi.fn(),
    query: vi.fn(),
  }),
}));

describe('Testing getCertifications() funtionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Should return all records of certificates when function is called', async () => {
    //mock data
    const mock_certificates = [
      {
        first_name: 'Bruce',
        last_name: 'Wayne',
        middle_name: 'test',
        id: 1,
        member_id: 1,
        created_at: '2025-07-23',
        crn: 1,
      },
      {
        first_name: 'Clark',
        last_name: 'Man',
        middle_name: 'test',
        id: 2,
        member_id: 2,
        created_at: '2025-04-13',
        crn: 2,
      },
      {
        first_name: 'Spider',
        last_name: 'Man',
        middle_name: 'test',
        id: 3,
        member_id: 3,
        created_at: '2024-01-20',
        crn: 3,
      },
    ];

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mock_certificates]);

    //run actual function
    const result = await CertificationsServices.getCertifications();

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT m.first_name, m.last_name, m.middle_name, c.* FROM certifications c JOIN members m ON c.member_id = m.id'
    );

    expect(result).toEqual([
      {
        first_name: 'Bruce',
        last_name: 'Wayne',
        middle_name: 'test',
        id: 1,
        member_id: 1,
        created_at: '2025-07-23',
        crn: '0001',
      },
      {
        first_name: 'Clark',
        last_name: 'Man',
        middle_name: 'test',
        id: 2,
        member_id: 2,
        created_at: '2025-04-13',
        crn: '0002',
      },
      {
        first_name: 'Spider',
        last_name: 'Man',
        middle_name: 'test',
        id: 3,
        member_id: 3,
        created_at: '2024-01-20',
        crn: '0003',
      },
    ]);
  });
});

describe('Testing getCertificationById() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns the Certificate record based on ID if it exist', async () => {
    //mock database
    const mock_certificate = {
      first_name: 'Bruce',
      last_name: 'Wayne',
      id: 1,
      member_id: 1,
      created_at: '2025-07-23',
      crn: 1,
    };

    //test data argument
    const id = 1;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_certificate]]);

    //run actual function
    const result = await CertificationsServices.getCertificationById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM certifications WHERE id = ?',
      [1]
    );
    expect(result).toBe(mock_certificate);
  });

  test('Returns nothing if Certificate record is not found based on ID', async () => {
    //mock database

    //test data argument
    const id = 2;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[]]);

    //run actual function
    const result = await CertificationsServices.getCertificationById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM certifications WHERE id = ?',
      [2]
    );
    expect(result).toBe(null);
  });
});

describe('Testing getCertificationByMemberId() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns the certificate records based on member_id records', async () => {
    //mock database
    const mock_certificate = {
      first_name: 'Bruce',
      middle_name: 'test',
      last_name: 'Wayne',
      age: 30,
      id: 1,
      member_id: 1,
      created_at: '2025-07-23',
      crn: 1,
      block_no: 'blk-123',
      lot_no: 'lt-123',
    };

    //test data argument
    const id = 1;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_certificate]]);

    //run actual function
    const result = await CertificationsServices.getCertificationByMemberId(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      `
    SELECT
    m.first_name,
    m.last_name,
    m.middle_name,
    TIMESTAMPDIFF(YEAR, m.birth_date, CURDATE()) AS age,
    c.*,
    h.block_no,
    h.lot_no
    FROM certifications c
    JOIN members m ON c.member_id = m.id
    LEFT JOIN families f ON m.family_id = f.id
    LEFT JOIN households h ON f.household_id = h.id
    WHERE c.member_id = ?
    `,
      [1]
    );
    expect(result).toEqual({
      first_name: 'Bruce',
      last_name: 'Wayne',
      middle_name: 'test',
      age: 30,
      id: 1,
      member_id: 1,
      created_at: '2025-07-23',
      crn: '0001',
      block_no: 'blk-123',
      lot_no: 'lt-123',
    });
  });
  /*REMOVE WHEN BUG IS FIXED
        test('Returns nothing if Certificate record is not found based on ID', async() => {
    
            //mock database
    
            //test data argument
            const id = 2
    
            //mock database functions
            mockDB.query.mockResolvedValueOnce([[]])
    
            //run actual function
            const result = await CertificationsServices.getCertificationByMemberId(id)
    
            //expect actual function logic to be correct
            expect(mockDB.query).toHaveBeenCalledWith(`
        SELECT
        m.first_name,
        m.last_name,
        TIMESTAMPDIFF(YEAR, m.birth_date, CURDATE()) AS age,
        c.*,
        h.block_no,
        h.lot_no
        FROM certifications c
        JOIN members m ON c.member_id = m.id
        LEFT JOIN families f ON m.family_id = f.id
        LEFT JOIN households h ON f.household_id = h.id
        WHERE c.member_id = ?
        `, [2])
    
            expect(result).toBe(null)
    
        });
        */
});

describe('Testing createCertification() functionalities', async () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Create certificate record based on member_id', async () => {
    const data = { member_id: 1 };

    const fakeDate = new Date('2025-07-22T12:00:00Z');
    vi.setSystemTime(fakeDate); // freeze time to check 'created_at'

    mockDB.query.mockResolvedValueOnce([[{ curr_crn: 1 }]]);
    mockDB.execute.mockResolvedValueOnce([{ insertId: 2 }]);

    const result = await CertificationsServices.createCertification(data);

    expect(mockDB.query).toBeCalledWith(
      'SELECT MAX(crn) AS curr_crn FROM certifications'
    );
    expect(mockDB.execute).toBeCalledWith(
      'INSERT INTO kabuhayan_db.certifications (`member_id`, `created_at`, `crn`) VALUES (?, ?, ?)',
      [1, fakeDate, 2]
    );

    expect(result).toEqual({
      id: 2,
      member_id: 1,
      created_at: fakeDate,
      new_crn: 2,
    });
  });

  test('Create certificate record for the first time', async () => {
    const data = { member_id: 1 };

    const fakeDate = new Date('2025-07-22T12:00:00Z');
    vi.setSystemTime(fakeDate); // freeze time to check 'created_at'

    mockDB.query.mockResolvedValueOnce([[{ curr_crn: null }]]);
    mockDB.execute.mockResolvedValueOnce([{ insertId: 2 }]);

    const result = await CertificationsServices.createCertification(data);

    expect(mockDB.query).toBeCalledWith(
      'SELECT MAX(crn) AS curr_crn FROM certifications'
    );
    expect(mockDB.execute).toBeCalledWith(
      'INSERT INTO kabuhayan_db.certifications (`member_id`, `created_at`, `crn`) VALUES (?, ?, ?)',
      [1, fakeDate, 1]
    );

    expect(result).toEqual({
      id: 2,
      member_id: 1,
      created_at: fakeDate,
      new_crn: 1,
    });
  });
});

describe('Testing updateCertification() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Update Certificate record`s column and return the affected row if you try to update only 1 column', async () => {
    //test data of function argument
    const id = 2;
    const updates = { member_id: 1 };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await CertificationsServices.updateCertification(
      id,
      updates
    );

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.certifications SET `member_id` = ? WHERE id = ?',
      [1, 2]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 2;
    const updates = { member_id: 1, created_at: '2020-01-02' };

    //run actual function //expect actual function logic to be correct
    await expect(
      CertificationsServices.updateCertification(id, updates)
    ).rejects.toThrow('Only one valid column can be updated at a time.');
  });

  test('Throws error if you try to update a column that does not exist', async () => {
    //test data of function argument
    const id = 2;
    const updates = { WhereIsMyHouse: ' :`( ' };

    //run actual function //expect actual function logic to be correct
    await expect(
      CertificationsServices.updateCertification(id, updates)
    ).rejects.toThrow('Only one valid column can be updated at a time.');
  });
});

describe('Testing updateCertificationMultiple() functionalities', () => {
  let mockDB;
  let mockConn;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConn = mockDB;
  });

  test('Updates multiple columns and returns the number of affected rows', async () => {
    //test data
    const id = 3;
    const updates = {
      member_id: 1,
      created_at: '2020-01-02',
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //Run actual function

    const result = await CertificationsServices.updateCertificationMultiple(
      id,
      updates
    );

    //Expect function to run properly
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.certifications SET `member_id` = ?, `created_at` = ? WHERE id = ?',
      [1, '2020-01-02', 3]
    );
    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throw error for updating unauthorized column', async () => {
    //test data
    const id = 3;
    const updates = {
      member_id: 1,
      created_at: '2020-01-02',
      Loan_Sharker: 'Pablo Escobar',
    };

    await expect(
      CertificationsServices.updateCertificationMultiple(id, updates)
    ).rejects.toThrow(
      `Attempted to update an unauthorized column: Loan_Sharker`
    );
  });

  test('Throw error for trying to update no columns', async () => {
    //test data
    const id = 4;
    const updates = {};

    //Run the function
    await expect(
      CertificationsServices.updateCertificationMultiple(id, updates)
    ).rejects.toThrow(`No valid columns provided for update.`);
  });
});

describe('Testing deleteCertification() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Deletes successfully', async () => {
    const id = 1;

    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await CertificationsServices.deleteCertification(id);

    expect(mockDB.execute).toBeCalledWith(
      'DELETE FROM kabuhayan_db.certifications WHERE id = ?',
      [1]
    );
    expect(result).toBe(1);
  });

  test('Deletes nothing if id is not found', async () => {
    const id = 100;

    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const result = await CertificationsServices.deleteCertification(id);

    expect(mockDB.execute).toBeCalledWith(
      'DELETE FROM kabuhayan_db.certifications WHERE id = ?',
      [100]
    );
    expect(result).toBe(0);
  });
});
