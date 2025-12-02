/* eslint-env node */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as CredentialsService from '../../services/credentials.services.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

vi.mock('../../config/connect.js', () => ({
  getDB: vi.fn().mockResolvedValue({
    //Mock SQL queries of getDB
    query: vi.fn(),
    execute: vi.fn(),
    getConnection: vi.fn().mockResolvedValue({
      //getDB also returns an object of getConnections() that has its own set of queries and executes
      query: vi.fn(), //Mock those as well
      execute: vi.fn(),
      beginTransaction: vi.fn(), //And also the function unique to getConnections
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    }),
  }),
}));

//For mocking the hash function
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// For generating random tokens
vi.mock('crypto', () => ({
  default: {
    // randomBytes used to generate token string presented to user
    randomBytes: vi.fn().mockReturnValue(Buffer.from('rawtokenbytes')),
    // createHash returns an object with update().digest()
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashedtoken123'),
    })),
  },
}));

// For sending emails
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn(),
    }),
  },
}));

describe('Testing getCredentials() funtionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Should return all records of families when function is called', async () => {
    //mock data
    const mock_credentials = [
      { id: 1, member_id: 1, username: 'Dovahkin', password: 'Dragonborn' },
      { id: 2, member_id: 2, username: 'Trevor', password: 'IloveDrugs' },
      { id: 3, member_id: 3, username: 'Henya', password: 'BestKettle' },
    ];

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mock_credentials]);

    //run actual function
    const result = await CredentialsService.getCredentials();

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM credentials');

    expect(result).toBe(mock_credentials);
  });
});

describe('Testing getCredentialsById() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns the Credential record based on ID if it exist', async () => {
    //mock database
    const mock_credential = {
      id: 3,
      member_id: 3,
      username: 'Henya',
      password: 'BestKettle',
    };

    //test data argument
    const id = 3;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_credential]]);

    //run actual function
    const result = await CredentialsService.getCredentialsById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM credentials WHERE id = ?',
      [3]
    );
    expect(result).toBe(mock_credential);
  });

  test('Returns nothing if Credential record is not found based on ID', async () => {
    //mock database

    //test data argument
    const id = 45;

    //mock database functions
    mockDB.query.mockResolvedValue([[]]);

    //run actual function
    const result = await CredentialsService.getCredentialsById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM credentials WHERE id = ?',
      [45]
    );
    expect(result).toBe(null);
  });
});

describe('Testing getCredentialsByName() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns the Credential record based on Name if it exist', async () => {
    //mock database
    const mock_credential = {
      id: 3,
      member_id: 3,
      username: 'Henya',
      password: 'BestKettle',
    };

    //test data argument
    const name = 'Henya';

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_credential]]);

    //run actual function
    const result = await CredentialsService.getCredentialsByName(name);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM credentials WHERE username = ?',
      'Henya'
    );
    expect(result).toBe(mock_credential);
  });

  test('Returns nothing if Credential record is not found based on Name', async () => {
    //mock database

    //test data argument
    const name = 'Pikamee';

    //mock database functions
    mockDB.query.mockResolvedValue([[]]);

    //run actual function
    const result = await CredentialsService.getCredentialsByName(name);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM credentials WHERE username = ?',
      'Pikamee'
    );
    expect(result).toBe(null);
  });
});

describe('testing getCredentialsByMemberId() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('returns all credentials records based on given member_id', async () => {
    //mock data
    const mock_credential = {
      id: 3,
      member_id: 5,
      username: 'Henya',
      password: 'BestKettle',
    };

    //test data
    const member_id = 5;

    //mock database function
    mockDB.query.mockResolvedValue([[mock_credential]]);

    //run actual function
    const result = await CredentialsService.getCredentialsByMemberId(member_id);

    //expect function to run properly
    expect(mockDB.query).toBeCalledWith(
      'SELECT * FROM credentials WHERE member_id = ?',
      [5]
    );
    expect(result).toEqual(mock_credential);
  });

  test('returns null if no record is found based on given member_id', async () => {
    //mock data

    //test data
    const member_id = 5;

    //mock database function
    mockDB.query.mockResolvedValue([[]]);

    //run actual function
    const result = await CredentialsService.getCredentialsByMemberId(member_id);

    //expect function to run properly
    expect(mockDB.query).toBeCalledWith(
      'SELECT * FROM credentials WHERE member_id = ?',
      [5]
    );
    expect(result).toEqual(null);
  });
});

describe('testing createCredentials() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Inserts Credential record in database and returns that record that was inserted', async () => {
    //test data of function argument
    const data = {
      member_id: 4,
      username: 'Carthethyia',
      password: 'MyCurrentWaifu',
      pfp: 'pfp.png',
    };

    //mock database functions
    const fakeInsertID = 4;
    mockDB.execute.mockResolvedValueOnce([{ insertId: fakeInsertID }]);

    //mock hash functions
    const fakeHashedPassword = 'KeepMyWaifuASecret';
    bcrypt.hash.mockResolvedValueOnce(fakeHashedPassword);

    //run actual function
    const result = await CredentialsService.createCredentials(data);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'INSERT INTO kabuhayan_db.credentials (`member_id`, `username`, `password`, `pfp`) VALUES (?, ?, ?, ?)',
      expect.any(Array)
    );

    const [, calledValues] = mockDB.execute.mock.calls[0];

    expect(bcrypt.hash).toHaveBeenCalledWith(
      'MyCurrentWaifu',
      expect.any(Number)
    );

    expect(calledValues[0]).toBe(4);
    expect(calledValues[1]).toBe('Carthethyia');
    expect(calledValues[2]).toBe('KeepMyWaifuASecret');
    expect(calledValues[3]).toBe('pfp.png');

    expect(result).toEqual({
      id: fakeInsertID,
      member_id: 4,
      username: 'Carthethyia',
      pfp: 'pfp.png',
    });
  });
});

describe('Testing updateCredentials() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Update Credential record`s column except password column and return the affected row if you try to update only 1 column', async () => {
    //test data of function argument
    const id = 2;
    const updates = { username: 'Franklin' };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await CredentialsService.updateCredentials(id, updates);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.credentials SET `username` = ? WHERE id = ?',
      ['Franklin', 2]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 2;
    const updates = { username: 'Franklin', password: 'YeeYeeAssHaircut' };

    //run actual function //expect actual function logic to be correct
    await expect(
      CredentialsService.updateCredentials(id, updates)
    ).rejects.toThrow('Only one valid column can be updated at a time.');
  });

  test('Throws error if you try to update column that is not allowed', async () => {
    //test data of function argument
    const id = 2;
    const updates = { pet: 'Chop' };

    //run actual function //expect actual function logic to be correct
    await expect(
      CredentialsService.updateCredentials(id, updates)
    ).rejects.toThrow('Only one valid column can be updated at a time.');
  });

  test('Updates credential record`s password and returns affectedRows', async () => {
    //test data of function argument
    const id = 2;
    const updates = { password: 'SayWhat?' };

    //mock hash functions
    const fakeHashedPassword = 'SecretStash';
    bcrypt.hash.mockResolvedValueOnce(fakeHashedPassword);

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await CredentialsService.updateCredentials(id, updates);

    //expect actual function logic to be correct
    expect(bcrypt.hash).toHaveBeenCalledWith('SayWhat?', expect.any(Number));
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.credentials SET `password` = ? WHERE id = ?',
      ['SecretStash', 2]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });
});

describe('Testing deleteCredentials() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Deletes a credential record based on given id and returns affectedRows', async () => {
    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValue([{ affectedRows: 1 }]);

    //run actual functio
    const result = await CredentialsService.deleteCredentials(id);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'DELETE FROM kabuhayan_db.credentials WHERE id = ?',
      [2]
    );
    expect(result).toBe(1);
  });
});

describe('Testing changePassword() functionalities', () => {
  let mockDB;
  let mockConnection;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConnection = await mockDB.getConnection();
  });

  test('Successfully changes password by passing the correct old passowrd', async () => {
    const id = 2;
    const current_password = 'old_password';
    const new_password = 'new_password';

    const mock_data = {
      id: 2,
      password: 'Hashed_old_password',
    };

    mockConnection.query.mockResolvedValueOnce([[mock_data]]);
    bcrypt.compare.mockResolvedValueOnce(true); //assume old password sent is correct
    bcrypt.hash.mockResolvedValueOnce('Hashed_new_password');

    mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await CredentialsService.changePassword(
      id,
      current_password,
      new_password
    );

    expect(mockConnection.beginTransaction).toBeCalled();

    expect(mockConnection.query).toBeCalledWith(
      'SELECT id, password FROM credentials WHERE member_id = ?',
      [2]
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      current_password,
      mock_data.password
    );

    expect(mockConnection.execute).toBeCalledWith(
      'UPDATE kabuhayan_db.credentials SET password = ? WHERE id = ?',
      ['Hashed_new_password', 2]
    );

    expect(mockConnection.commit).toBeCalled();

    expect(result).toEqual({ affectedRows: 1 });

    expect(mockConnection.release).toBeCalled();
  });

  test('Fails in changing password by passing the wrong old passowrd', async () => {
    const id = 2;
    const current_password = 'wrong_password';
    const new_password = 'new_password';

    const mock_data = {
      id: 2,
      password: 'Hashed_old_password',
    };

    mockConnection.query.mockResolvedValueOnce([[mock_data]]);
    bcrypt.compare.mockResolvedValueOnce(false); //assume old password sent is wrong

    await expect(
      CredentialsService.changePassword(id, current_password, new_password)
    ).rejects.toThrow();

    expect(mockConnection.beginTransaction).toBeCalled();

    expect(mockConnection.query).toBeCalledWith(
      'SELECT id, password FROM credentials WHERE member_id = ?',
      [2]
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      current_password,
      mock_data.password
    );

    expect(mockConnection.rollback).toBeCalled();
  });

  /*
  test('Fails in changing password by passing an ID to an empty', async() => {

    const id = 2
    const current_password = 'wrong_password'
    const new_password = 'new_password'

    

    mockConnection.query.mockResolvedValueOnce([[]])
    bcrypt.compare.mockResolvedValueOnce(false)//assume old password sent is wrong

    await expect(CredentialsService.changePassword(id, current_password, new_password)).rejects.toThrow()
    
    expect(mockConnection.beginTransaction).toBeCalled()

    expect(mockConnection.query).toBeCalledWith('SELECT id, password FROM credentials WHERE member_id = ?', [2])

    expect(bcrypt.compare).not.toHaveBeenCalled();

    expect(mockConnection.rollback).toBeCalled()

  })
  */
});

describe('Testing verifyLogin() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('returns user if username exists and password matches', async () => {
    //test data of function argument
    const username = 'Henya';
    const password = 'BestKettle';

    //mock database
    const mock_credential = {
      id: 3,
      member_id: 3,
      username: 'Henya',
      password: 'HashedBestKettle',
    };

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_credential]]);

    //mock hash functions
    bcrypt.compare.mockResolvedValueOnce(true);

    //run actual function
    const result = await CredentialsService.verifyLogin(username, password);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM kabuhayan_db.credentials WHERE username = ?',
      ['Henya']
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(password, 'HashedBestKettle');
    expect(result).toEqual({ id: 3, member_id: 3, username: 'Henya' });
  });

  test('returns null if no account is found', async () => {
    //test data of function argument
    const username = 'GawrGura';
    const password = 'A';

    //mock database

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[]]);

    //run actual function
    const result = await CredentialsService.verifyLogin(username, password);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM kabuhayan_db.credentials WHERE username = ?',
      ['GawrGura']
    );
    expect(result).toBe(null);
  });

  test('returns null if password does not match', async () => {
    //test data of function argument
    const username = 'Henya';
    const password = 'StinkyKettle';

    //mock database
    const mock_credential = {
      id: 3,
      member_id: 3,
      username: 'Henya',
      password: 'HashedBestKettle',
    };

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_credential]]);

    //mock hash functions
    bcrypt.compare.mockResolvedValueOnce(false);

    //run actual function
    const result = await CredentialsService.verifyLogin(username, password);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM kabuhayan_db.credentials WHERE username = ?',
      ['Henya']
    );
    expect(result).toBe(null);
  });
});

describe('Testing requestPasswordReset()', () => {
  let mockDB, mockConn, mockTransport;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConn = await mockDB.getConnection();
    mockTransport = nodemailer.createTransport();
  });

  test('sends reset email successfully when user exists', async () => {
    // service queries db (db.query) to find user by email
    mockDB.query.mockResolvedValueOnce([[{ id: 1 }]]); // find user
    // bcrypt.hash used optionally in other parts; not required here but safe to mock
    bcrypt.hash.mockResolvedValueOnce('unused_hash');
    // conn.query for INSERT token
    mockConn.query.mockResolvedValueOnce();
    // transporter.sendMail resolves
    mockTransport.sendMail.mockResolvedValueOnce();

    const result =
      await CredentialsService.requestPasswordReset('user@example.com');

    expect(mockConn.beginTransaction).toHaveBeenCalled();
    // the service does db.query to locate user
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT id FROM credentials WHERE email = ?',
      ['user@example.com']
    );
    // insertion into reset_tokens should have been called via conn.query
    expect(mockConn.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO reset_tokens'),
      expect.arrayContaining([1, 'hashedtoken123', expect.any(String)])
    );
    // sendMail should have been invoked
    expect(mockTransport.sendMail).toHaveBeenCalled();
    expect(mockConn.commit).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'Password reset email sent',
    });
  });

  test('returns success even if email does not exist', async () => {
    // db.query returns empty rows -> service returns success and commits
    mockDB.query.mockResolvedValueOnce([[]]);

    const result =
      await CredentialsService.requestPasswordReset('ghost@example.com');

    expect(mockConn.commit).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'Password reset request processed',
    });
  });

  test('rolls back transaction when email sending fails', async () => {
    mockDB.query.mockResolvedValueOnce([[{ id: 1 }]]); // user exists
    mockConn.query.mockResolvedValueOnce(); // insert ok
    // simulate sendMail failure
    mockTransport.sendMail.mockRejectedValueOnce(new Error('Mail failed'));

    await expect(
      CredentialsService.requestPasswordReset('user@example.com')
    ).rejects.toThrow('Failed to process password reset request');

    expect(mockConn.rollback).toHaveBeenCalled();
  });
});

describe('Testing resetPassword()', () => {
  let mockDB, mockConn;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConn = await mockDB.getConnection();
  });

  test('resets password successfully with valid token', async () => {
    const now = new Date();

    // Query 1: find token
    mockConn.query.mockResolvedValueOnce([
      [
        {
          cid: 1,
          expiry_date: new Date(now.getTime() + 3600000),
          is_used: null,
        },
      ],
    ]);

    // Query 2: find user credential
    mockConn.query.mockResolvedValueOnce([[{ id: 1, password: 'oldpass' }]]);

    // Mock new password hash
    bcrypt.hash.mockResolvedValueOnce('unused_hash');

    // Execute #1 – update password
    mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    // Execute #2 – mark token used
    mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await CredentialsService.resetPassword(
      'validtoken',
      'newpass'
    );

    // Check correct SQL and parameters
    expect(mockConn.execute).toHaveBeenNthCalledWith(
      1,
      'UPDATE kabuhayan_db.credentials SET password = ? WHERE id = ?',
      ['unused_hash', 1]
    );

    expect(mockConn.execute).toHaveBeenNthCalledWith(
      2,
      'UPDATE reset_tokens SET is_used = 1 WHERE cid = ?',
      [1]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('throws error if token is expired', async () => {
    mockConn.query.mockResolvedValueOnce([
      [{ cid: 1, expiry_date: new Date(Date.now() - 1000), is_used: null }],
    ]);

    await expect(
      CredentialsService.resetPassword('expired', 'newpass')
    ).rejects.toThrow();

    expect(mockConn.rollback).toHaveBeenCalled();
  });

  test('throws error if no valid token found (expired or used)', async () => {
    // Simulate empty result (expired, used, or invalid)
    mockConn.query.mockResolvedValueOnce([[]]);

    await expect(
      CredentialsService.resetPassword('invalid', 'newpass')
    ).rejects.toThrow();

    expect(mockConn.rollback).toHaveBeenCalled();
  });
});

describe('Testing verifyToken()', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('returns token record when token is valid (hashed lookup)', async () => {
    const now = new Date();
    // db.query should be called with hashed token and return a row
    mockDB.query.mockResolvedValueOnce([
      [
        {
          cid: 1,
          token: 'hashedtoken123',
          expiry_date: new Date(now.getTime() + 3600000),
          is_used: null,
        },
      ],
    ]);

    const result = await CredentialsService.verifyToken('goodrawtoken');

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM reset_tokens WHERE token = ? AND is_used IS NULL AND expiry_date > NOW()',
      ['hashedtoken123']
    );
    expect(result).toEqual({
      cid: 1,
      token: 'hashedtoken123',
      expiry_date: expect.any(Date),
      is_used: null,
    });
  });

  test('returns null when token is not found or invalid', async () => {
    mockDB.query.mockResolvedValueOnce([[]]); // no rows
    const result = await CredentialsService.verifyToken('notfoundtoken');
    expect(result).toBeNull();
  });
});
