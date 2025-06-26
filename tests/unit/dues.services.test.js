import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as DuesService from '../../services/dues.services.js';

/*
 * This function mocks the database established in the config
 *
 * in mocks like this, your best friend is vi.fn()
 *
 * What is vi.fn()? A vitest function that mocks an existing function, which does these:
 * - Tracks how many times a function was called
 * - Records what arguments the function was called with
 *
 */
vi.mock('../../config/connect.js', () => ({
  // This mocks the getDB() function (replaces the real getDB() function with a mock function)
  getDB: vi.fn().mockResolvedValue({
    // These replaces the SQL functions execute and query, we can use them to expect certain function calls
    execute: vi.fn(),
    query: vi.fn(),
  }),
}));

// Describe function (this just encompasses the whole service file)
describe('DuesService Unit Tests', () => {
  let mockDB;

  // beforeEach ensures that the mockDB that we have is cleared of any previous mocks
  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  // An it function that serves as a single test
  // Each service function will be tested using an it function
  it('should get all dues', async () => {
    // 1. Establish your mock data (imagine that this is in the database)
    const mock_dues = [
      { id: 1, amount: 69, status: 'Unpaid' },
      { id: 2, amount: 20.5, status: 'Paid' },
    ];

    // 2. Mock (simulate) the database query
    // This basically just says that "When mockDB.query is called, it should return the mock_dues established earlier"
    mockDB.query.mockResolvedValueOnce([mock_dues]);

    // 3. Call the real function that we are testing
    const result = await DuesService.getDues();

    // 4. Test your expected results
    // First expect: You're expecting that the mockDB.query() will call the same SQL query that we have in the real function
    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues');
    // Second expect: Expect that the real function we have returns the same mock_dues we established
    // This ensures that our expect runs correctly
    expect(result).toEqual(mock_dues);
  });
});
