import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as ChangesService from '../../services/changes.services.js';

vi.mock('../../config/connect.js', () => ({
  getDB: vi.fn().mockResolvedValue({
    query: vi.fn(),
    execute: vi.fn(),
    getConnection: vi.fn().mockResolvedValue({
      query: vi.fn(),
      execute: vi.fn(),
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    }),
  }),
}));

describe('Testing Database of Changes Feature (Feature 2)', () => {
  let mockDB;
  let mockConn;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConn = await mockDB.getConnection();
  });

  test('Retrieves all DB changes successfully', async () => {
    const mockRows = [
      { id: 1, admin_id: 3, member_id: 5, change_type: 'Update', crn: 12 },
      { id: 2, admin_id: 1, member_id: 9, change_type: 'Create', crn: 7 },
    ];

    mockDB.query.mockResolvedValueOnce([mockRows]);

    const result = await ChangesService.getChanges();

    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM changes');

    // crn should be padded
    expect(result[0].crn).toBe('0012');
    expect(result[1].crn).toBe('0007');
  });

  test('Retrieves DB changes filtered by admin_id', async () => {
    const admin_id = 5;
    const mockRows = [
      { id: 10, admin_id: 5, member_id: 2, change_type: 'Update' },
      { id: 11, admin_id: 5, member_id: 3, change_type: 'Create' },
    ];

    mockDB.query.mockResolvedValueOnce([mockRows]);

    const result = await ChangesService.getChangesByType(admin_id);

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM changes WHERE change_type = ?',
      [admin_id]
    );

    expect(result).toEqual(mockRows);
  });

  test('Retrieves DB changes filtered by member_id', async () => {
    const member_id = 9;
    const mockRows = [
      { id: 20, admin_id: 3, member_id: 9, change_type: 'Update' },
    ];

    mockDB.query.mockResolvedValueOnce([mockRows]);

    const result = await ChangesService.getChangesByType(member_id);

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM changes WHERE change_type = ?',
      [member_id]
    );

    expect(result).toEqual(mockRows);
  });

  test.skip('Filters DB changes by date range (NOT IMPLEMENTED)', async () => {
    // Placeholder – backend service not implemented
  });

  test.skip('Retrieve DB changes filtered by member name (NOT IMPLEMENTED)', async () => {});

  test('Handles empty results correctly', async () => {
    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await ChangesService.getChanges();

    expect(result).toEqual([]);
  });

  test('Throws error when DB retrieval fails', async () => {
    mockDB.query.mockRejectedValueOnce(new Error('DB failed'));

    await expect(ChangesService.getChanges()).rejects.toThrow('DB failed');
  });

  test('createChange() inserts row and commits transaction', async () => {
    const payload = {
      date: '2025-01-01',
      admin_id: 1,
      member_id: 2,
      change_type: 'Update',
      field_changed: 'first_name',
      old_value: 'John',
      new_value: 'Jonathan',
    };

    mockConn.execute.mockResolvedValueOnce([{ insertId: 33 }]);

    const result = await ChangesService.createChange(payload, mockConn);

    expect(mockConn.beginTransaction).toHaveBeenCalled();
    expect(mockConn.execute).toHaveBeenCalledWith(
      'INSERT INTO kabuhayan_db.dues (`date`, `admin_id`, `member_id`, `change_type`,  `field_changed`, `old_value`, `new_value`) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        new Date(payload.date),
        payload.admin_id,
        payload.member_id,
        payload.change_type,
        payload.field_changed,
        payload.old_value,
        payload.new_value,
      ]
    );
    expect(mockConn.commit).toHaveBeenCalled();

    expect(result).toEqual({
      id: 33,
      ...payload,
    });
  });

  test('createChange() rolls back when DB error occurs', async () => {
    const payload = {
      date: '2025-01-01',
      admin_id: 2,
      member_id: 7,
      change_type: 'Delete',
      field_changed: 'middle_name',
      old_value: 'Lee',
      new_value: '-',
    };

    mockConn.execute.mockRejectedValueOnce(new Error('Insert failed'));

    await expect(
      ChangesService.createChange(payload, mockConn)
    ).rejects.toThrow('Insert failed');

    expect(mockConn.beginTransaction).toHaveBeenCalled();
    expect(mockConn.rollback).toHaveBeenCalled();
  });
});
