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

describe('Testing Database Changes History', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Retrieve all DB changes successfully', async () => {
    const rawRows = [
      {
        id: 1,
        date_changed: '2025-01-02',
        admin_id: 2,
        member_id: 4,
        change_type: 'Update',
        field_changed: 'first_name',
        old_value: 'Juan',
        new_value: 'Pedro',
        admin_name: 'Admin Test',
        member_name: 'Member Test',
      },
    ];

    mockDB.query.mockResolvedValueOnce([rawRows]);

    const result = await ChangesService.getChanges({
      page: 1,
      limit: 10,
      search: null,
      dateFrom: null,
      dateTo: null,
    });

    expect(mockDB.query).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        date: '2025-01-02',
        changedBy: 'Admin Test',
        member: 'Member Test',
        change_type: 'Update',
        field_changed: 'first_name',
        past_value: 'Juan',
        new_value: 'Pedro',
      },
    ]);
  });

  test('Retrieves db changes filtered by admin_id', async () => {
    const rawRows = [
      {
        id: 5,
        date_changed: '2025-02-10',
        admin_id: 10,
        member_id: 3,
        change_type: 'Update',
        field_changed: 'last_name',
        old_value: 'Reyes',
        new_value: 'Santos',
      },
    ];

    mockDB.query.mockResolvedValueOnce([rawRows]);

    const result = await ChangesService.getChanges({
      page: 1,
      limit: 10,
      search: 'Update',
    });

    expect(mockDB.query).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 5,
        date: '2025-02-10',
        changedBy: 10,
        member: 3,
        change_type: 'Update',
        field_changed: 'last_name',
        past_value: 'Reyes',
        new_value: 'Santos',
      },
    ]);
  });

  test('Retrieves db changes filtered by member_id', async () => {
    const rawRows = [
      {
        id: 8,
        date_changed: '2025-02-03',
        admin_id: 1,
        member_id: 7,
        change_type: 'Update',
        field_changed: 'middle_name',
        old_value: 'Cruz',
        new_value: 'Dela Cruz',
      },
    ];

    mockDB.query.mockResolvedValueOnce([rawRows]);

    const result = await ChangesService.getChanges({
      page: 1,
      limit: 10,
      search: 'Update',
    });

    expect(mockDB.query).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 8,
        date: '2025-02-03',
        changedBy: 1,
        member: 7,
        change_type: 'Update',
        field_changed: 'middle_name',
        past_value: 'Cruz',
        new_value: 'Dela Cruz',
      },
    ]);
  });

  test('Filter DB changes by date range', async () => {
    const rawRows = [
      {
        id: 15,
        date_changed: '2025-01-15',
        admin_id: 3,
        member_id: 10,
        change_type: 'Update',
        field_changed: 'status',
        old_value: 'Active',
        new_value: 'Inactive',
      },
    ];

    mockDB.query.mockResolvedValueOnce([rawRows]);

    const result = await ChangesService.getChanges({
      page: 1,
      limit: 10,
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
    });

    expect(mockDB.query).toHaveBeenCalledWith(
      expect.stringContaining('DATE(c.date_changed) BETWEEN ? AND ?'),
      expect.arrayContaining(['2025-01-01', '2025-01-31'])
    );

    expect(result[0].id).toBe(15);
  });

  test('Filter DB changes by keyword search', async () => {
    const rawRows = [
      {
        id: 99,
        date_changed: '2025-02-01',
        admin_id: 4,
        member_id: 12,
        change_type: 'Update',
        field_changed: 'last_name',
        old_value: 'Santos',
        new_value: 'Lopez',
        admin_name: 'Maria Santos',
        member_name: 'Juan Dela Cruz',
      },
    ];

    mockDB.query.mockResolvedValueOnce([rawRows]);

    const result = await ChangesService.getChanges({
      page: 1,
      limit: 10,
      search: 'Santos',
    });

    expect(mockDB.query).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 99,
        date: '2025-02-01',
        changedBy: 'Maria Santos',
        member: 'Juan Dela Cruz',
        change_type: 'Update',
        field_changed: 'last_name',
        past_value: 'Santos',
        new_value: 'Lopez',
      },
    ]);
  });

  test('Handling empty results', async () => {
    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await ChangesService.getChanges({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual([]);
  });

  test('Database failure is handled properly', async () => {
    mockDB.query.mockRejectedValueOnce(new Error('DB failed'));

    await expect(
      ChangesService.getChanges({ page: 1, limit: 10 })
    ).rejects.toThrow('DB failed');
  });
});
