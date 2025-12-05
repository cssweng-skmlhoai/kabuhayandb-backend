/* global Buffer */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';

import * as UploadsServices from '../../services/uploads.services.js';

vi.mock('../../config/connect.js', () => ({
  getDB: vi.fn().mockResolvedValue({
    execute: vi.fn(),
    query: vi.fn(),
  }),
}));

describe('Testing uploadSingleImgByMemberId() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Uploads credential record`s pfp and returns the image that was set', async () => {
    //test data
    const data = {
      buffer: Buffer.from('fake-image-data'),
      mime_type: 'image/png',
      original_name: 'mypic.png',
      member_id: 1,
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run function
    const result = await UploadsServices.uploadSingleImgByMemberId(data);

    //epect function to run properly
    expect(mockDB.execute).toBeCalledWith(
      'UPDATE credentials SET pfp = ? WHERE member_id = ?',
      [Buffer.from('fake-image-data'), 1]
    );

    expect(result).toEqual({
      upload: true,
      buffer: Buffer.from('fake-image-data'),
      mime_type: 'image/png',
      original_name: 'mypic.png',
      member_id: 1,
    });
  });

  test('Fails to upload pfp when np credential record is not found with given member_id', async () => {
    //test data
    const data = {
      buffer: Buffer.from('fake-image-data'),
      mime_type: 'image/png',
      original_name: 'mypic.png',
      member_id: 1,
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

    //run function
    const result = await UploadsServices.uploadSingleImgByMemberId(data);

    //epect function to run properly
    expect(mockDB.execute).toBeCalledWith(
      'UPDATE credentials SET pfp = ? WHERE member_id = ?',
      [Buffer.from('fake-image-data'), 1]
    );

    expect(result).toEqual({
      upload: false,
      buffer: Buffer.from('fake-image-data'),
      mime_type: 'image/png',
      original_name: 'mypic.png',
      member_id: 1,
    });
  });
});

describe('Testing getPfpBtMemberId() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns pfp of the credentials record when function is called', async () => {
    //test data
    const id = 3;
    const mock_member = { pfp: Buffer.from('HenyaDayooImage') };

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_member]]);

    //run function
    const result = await UploadsServices.getPfpByMemberId(id);

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT pfp FROM credentials WHERE member_id = ?',
      [3]
    );

    expect(result).toEqual(Buffer.from('HenyaDayooImage'));
  });

  test('Returns null when member record and its pfp is not  found based on given id', async () => {
    const id = 3;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[]]);

    //run function
    const result = await UploadsServices.getPfpByMemberId(id);

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT pfp FROM credentials WHERE member_id = ?',
      [3]
    );

    expect(result).toEqual(null);
  });

  test('Returns null when member record exist but its pfp is not found based on given id', async () => {
    const id = 3;
    const mock_member = { pfp: null };

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_member]]);

    //run function
    const result = await UploadsServices.getPfpByMemberId(id);

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT pfp FROM credentials WHERE member_id = ?',
      [3]
    );

    expect(result).toEqual(null);
  });
});

describe('testing uploadSigByMemberId() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('successfully upload signature by member and returns what was sent', async () => {
    const data = {
      buffer: Buffer.from('fake-image-data'),
      mime_type: 'image/png',
      original_name: 'mypic.png',
      member_id: 1,
    };

    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await UploadsServices.uploadSigByMemberId(data);

    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE members SET confirmity_signature = ? WHERE id = ?',
      [Buffer.from('fake-image-data'), 1]
    );

    expect(result).toEqual({
      upload: true,
      buffer: Buffer.from('fake-image-data'),
      mime_type: 'image/png',
      original_name: 'mypic.png',
      member_id: 1,
    });
  });
});
