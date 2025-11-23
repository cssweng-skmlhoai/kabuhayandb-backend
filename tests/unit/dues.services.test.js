import { describe, it, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as DuesService from '../../services/dues.services.js';

//const mockExecute = vi.fn();
//const mockQuery = vi.fn;

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
/* Notes for old code
vi.mock('../../config/connect.js', () => ({//note: mocks the imported file during test -- that means in actuality we don't use the imported file during the running of a test. Instead it uses the mocked version of the file declared in here

  // note: in our app, it uses the actual getDB() function that connects to our database during test runs
  // this mocks the getDB() function (replaces the real getDB() function with a mock function)
  getDB: vi.fn().mockResolvedValue({ //note: Our getDB() functions returns the database connection object that contains 'execute()' and 'query()' functions
    //So we need to mock a return object with those SQL functions, because the functions we are testing are using them and we need to verify it's being used correctly
    // These replaces the SQL functions execute and query, we can use them to expect certain function calls
    execute: vi.fn(), 
    query: vi.fn(),

  }),
}));
*/

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

// note: the mocked getDB will return the same fake database object not different one each time
//note: Any functions that uses the mocked getDB, will all have the same mocked database object (mockDB === db)

//note: .vi.fn() will mock a function -- when function is mocked, it doesn't run on any logic and returns 'undefined' unless you specify with '.mockResolvedValue()'
//                                    -- Although it records how many times it was called, and what arguments it received
//                              NOTE: -- WHEN WE BEGIN A test() on a function we want, IF THE TESTED FUNCTION depends on other functions and we MOCK THEM, THEN IT WILL USE THOSE MOCK FUNCTIONS INSTEAD INSTEAD OF THE ACTUAL FUNCTIONS
//                              NOTE: -- WE ONLY WANT TO TEST THE LOGIC OF THE FUNCTION WE WANT TO TEST BUT NOT THE FUNCTIONS IT DEPENDS ON(WE MOCK THOSE INSTEAD -- WE ONLY WANT TO TEST IF THE TESTED FUNCTION USES THOSE DEPENDENT FUNCTIONS CORRECTLY)

// Describe function (this just encompasses the whole service file)
//note: create a test suite (first arg = name of test suite usually named after the function you want to test, 2nd arg = function to be called by the test runner)
describe('Testing getDues() functionalities', () => {
  let mockDB; //variable to hold mocked database connection

  // beforeEach ensures that the mockDB that we have is cleared of any previous mocks
  beforeEach(async () => {
    //runs before every test
    vi.clearAllMocks(); //removes all previous mock data
    mockDB = await getDB(); //note the getDB() here uses the mocked version not the real one,
    //NOTE: ALSO NOTE WE SPECIFIED THAT THE RETURN OF mock getDB() is an object that contains our query() and execute() functions
    //This means by storing return to a variable we could do mockDB.query() or mockDB.execute() to use the mock SQL functions

    //NOTE: 'db' variable in the function to be tested will refer to same object held by 'mockDB'
  });

  // An it()/test() function that serves as a single test case
  // Each service function will be tested using an it function
  it('should get all dues', async () => {
    // 1. Establish your mock data (imagine that this is in the database) -- assume the data that must be returned based on query
    const mock_dues = [
      {
        id: 1,
        due_date: '2025-6-2',
        amount: 69.0,
        status: 'Unpaid',
        due_type: 'Taxes',
        receipt_number: 'R123',
        household_id: 1,
      },
      {
        id: 2,
        due_date: '2026-2-2',
        amount: 420.0,
        status: 'Paid',
        due_type: 'Taxes',
        receipt_number: 'R456',
        household_id: 2,
      },
      {
        id: 3,
        due_date: '2026-8-21',
        amount: 699.0,
        status: 'Unpaid',
        due_type: 'Penalties',
        receipt_number: 'R789',
        household_id: 3,
      },
    ];

    // 2. Mock (simulate) the database query(Like pretend that it works as you wanted)
    // This basically just says that "When mockDB.query is called, it should return the mock_dues established earlier"
    // Note: Our query() is already mocked but no return value, so during this test we assume its return value will be our mock_dues
    // Note: remember that mockDB is just our getDB() that has the mock query() function
    mockDB.query.mockResolvedValueOnce([mock_dues]);

    //note: .query functions usuall returns [[{rowdata1}, {rowdata2},...], metadata], so we need to mimick the return function to be similar as this
    // mock_dues = [{rowdata1}, {rowdata2},....]
    // [mock_dues] == [[{rowdata1}, {rowdata2},...]](note: Our tested function doesn't use metadata so we don't include it but still need to return the same array dimension)
    // also note: [dues] = [[{rowdata1}, {rowdata2},...]] --means-- dues = [{rowdata1}, {rowdata2},...]

    // 3. Call the real function that we are testing
    //Note: inside the getDues() function in duration of this test case
    //getDB() and .query() ARE USING THE MOCKED VERSON AND DOES NOT USE THE ACTUAL FUNCTIONALITIES
    const result = await DuesService.getDues();

    //DURING THIS TEST: const db will use the mock getDB() that has the mock query() and execute() functions.
    //                  since we did mockDB = await getDB(),   In the tested function, when it does this db.query(), in actuallity it is using mockDB.query().
    //                  mockDB.query() records the argument 'SELECT * FROM dues' because it was called with that in the tested function.
    //                  getDues() returns 'mock_dues' because it uses the mock query() with the return value inside 'mockResolvedValueOnce([mock_dues])'.

    // 4. Test your expected results
    // First expect: Since the tested function used mockDB.query() and recorded the argument being passed, you're expecting that the mockDB.query() will call the same SQL query that we have in the real function
    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues');
    // Second expect:Since the tested function used mockDB.query and specified to return 'mock_dues' Expect that the tested function we have returns the same mock_dues we established
    // This ensures that our expect runs correctly
    expect(result).toEqual(mock_dues);
  });
});

describe('Testing getDuesById(id) functionalities', async () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('returns the due record based on ID if it exist', async () => {
    //mock database
    const mock_due = {
      id: 2,
      due_date: '2026-2-2',
      amount: 420.0,
      status: 'Paid',
      due_type: 'Taxes',
      receipt_number: 'R456',
      household_id: 2,
    };

    //mock data of function argument
    const id = 1;

    //Simulate query on what its supposed to return
    mockDB.query.mockResolvedValueOnce([[mock_due]]);

    //note: .query functions usuall returns [[{rowdata1}, {rowdata2},...], metadata], so we need to mimick the return function to be similar as this
    // mock_dues = {rowdata1}
    // [[mock_dues]] == [[{rowdata1}]](note: Our tested function doesn't use metadata so we don't include it but still need to return the same array dimension)
    // also note: [dues] = [[{rowdata1}]] --means-- dues = [{rowdata1}]

    //Call real function we are testing

    const result = await DuesService.getDuesById(id);

    //Test expected

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM dues WHERE id = ?',
      [1]
    );

    expect(result).toEqual(mock_due);
  });

  test('returns nothing if due cannot be found based on ID', async () => {
    //mock database

    //test data of function argument
    const id = 45;

    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await DuesService.getDuesById(id);

    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM dues WHERE id = ?',
      [45]
    );

    expect(result).toEqual(null);
  });
});

describe('testing getDuesByMemberId() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns an array of due records and an object that sums up the total amount of each due type from each due record based on given member id ', async () => {
    //mock database
    const mock_dues = [
      {
        id: 1,
        due_date: '2025-6-2',
        amount: 690.0,
        status: 'Unpaid',
        due_type: 'Taxes',
        receipt_number: 'R123',
        household_id: 1,
        first_name: 'John',
        last_name: 'Marston',
      },
      {
        id: 1,
        due_date: '2026-2-2',
        amount: 420.0,
        status: 'Paid',
        due_type: 'Taxes',
        receipt_number: 'R456',
        household_id: 1,
        first_name: 'John',
        last_name: 'Marston',
      },
      {
        id: 1,
        due_date: '2026-8-21',
        amount: 699.0,
        status: 'Unpaid',
        due_type: 'Penalties',
        receipt_number: 'R789',
        household_id: 1,
        first_name: 'John',
        last_name: 'Marston',
      },
      {
        id: 1,
        due_date: '2026-8-21',
        amount: 0.0,
        status: 'Unpaid',
        due_type: 'others',
        receipt_number: 'R779',
        household_id: 1,
        first_name: 'John',
        last_name: 'Marston',
      },
    ];

    //test data
    const id = 1;

    //mock database functions
    mockDB.query.mockResolvedValue([mock_dues]);

    //run actual function
    const result = await DuesService.getDuesByMemberId(id);

    //Expect function to run properly
    expect(mockDB.query).toHaveBeenCalledWith(
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
      [1]
    );

    expect(result).toEqual({
      dues: mock_dues,
      balances: {
        monthly: 0,
        taxes: 690,
        amortization: 0,
        penalties: 699,
        others: 0,
      },
    });
  });

  test('Returns an empty array and an object that amounts 0 in all due type if no due record is found based on given member id', async () => {
    //mock database

    //test data
    const id = 1;

    //mock database functions
    mockDB.query.mockResolvedValue([[]]);

    //run actual function
    const result = await DuesService.getDuesByMemberId(id);

    //Expect function to run properly
    expect(mockDB.query).toHaveBeenCalledWith(
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
      [1]
    );

    expect(result).toEqual({
      dues: [],
      balances: {
        monthly: 0,
        taxes: 0,
        amortization: 0,
        penalties: 0,
        others: 0,
      },
    });
  });
});

describe('testing getDuesReport() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns a full report of dues for the next month when called', async () => {
    //mock database
    const mock_billed_result = [{ total_billed: 2000 }];
    const mock_collected_result = [{ total_collected: 1500 }];

    const mock_dues_by_type = [
      {
        due_type: 'Monthly Dues',
        total_dues: 5,
        total_amount: 1000,
        paid_amount: 600,
        unpaid_amount: 400,
      },
      {
        due_type: 'Taxes',
        total_dues: 3,
        total_amount: 690,
        paid_amount: 690,
        unpaid_amount: 0,
      },
      {
        due_type: 'Penalties',
        total_dues: 2,
        total_amount: 700,
        paid_amount: 0,
        unpaid_amount: 700,
      },
    ];

    const mock_dues_by_household = [
      {
        household_id: 1,
        block_no: 'blk-123',
        lot_no: '1',
        total_dues: 2,
        total_amount: 1000,
        payment_status: 'Fully Paid',
      },
      {
        household_id: 2,
        block_no: 'blk-456',
        lot_no: '2',
        total_dues: 3,
        total_amount: 1300,
        payment_status: 'Unpaid',
      },
    ];

    const mock_total_unpaid_dues = [
      {
        total_unpaid_dues: 3,
        total_unpaid_amount: 1200,
        distinct_households: 2,
      },
    ];

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mock_billed_result]); //Mock billed result query
    mockDB.query.mockResolvedValueOnce([mock_collected_result]); //Mock collected result query
    mockDB.query.mockResolvedValueOnce([mock_dues_by_type]); //Mock dues by type query
    mockDB.query.mockResolvedValueOnce([mock_dues_by_household]); //Mock dues by household query
    mockDB.query.mockResolvedValueOnce([mock_total_unpaid_dues]); //Mock total unpaid dues query

    //Run actual function
    const result = await DuesService.getDuesReport();

    //Expect funtions to run properly
    expect(mockDB.query).toHaveBeenNthCalledWith(
      1,
      `
    SELECT SUM(amount) AS total_billed
    FROM dues
    WHERE MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      2,
      `
    SELECT SUM(amount) AS total_collected 
    FROM dues
    WHERE status = 'Paid' AND MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      3,
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
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      4,
      `
    SELECT
    m.first_name,
    m.last_name,
    d.household_id,
    h.block_no,
    h.lot_no,
    COUNT(d.id) AS total_dues,
    SUM(d.amount) AS total_amount,
    CASE
      WHEN SUM(d.status = 'Unpaid') = COUNT(*) THEN 'Unpaid'
      WHEN SUM(d.status = 'Paid') = COUNT(*) THEN 'Fully Paid'
      ELSE 'Partially Paid'
    END AS payment_status
  FROM dues d
  JOIN households h ON d.household_id = h.id
  JOIN families f ON f.household_id = h.id
  JOIN (
    SELECT m1.*
    FROM members m1
    INNER JOIN (
      SELECT family_id, MIN(id) AS min_id
      FROM members
      GROUP BY family_id
    ) m2 ON m1.id = m2.min_id
  ) m ON m.family_id = f.id
  WHERE MONTH(d.due_date) = ? AND YEAR(d.due_date) = ?
  GROUP BY d.household_id, h.block_no, h.lot_no, m.first_name, m.last_name
  `,
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      5,
      `
    SELECT
    COUNT(*) AS total_unpaid_dues,
    SUM(amount) AS total_unpaid_amount,
    COUNT(DISTINCT household_id) as distinct_households
    FROM dues
    WHERE status = 'Unpaid'
    `
    );

    expect(result).toEqual({
      collection_efficiency: {
        total_billed: 2000,
        total_collected: 1500,
        efficiency: 75,
      },
      summary_due_type: [
        {
          due_type: 'Monthly Amortization',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
        {
          due_type: 'Monthly Dues',
          total_dues: 5,
          total_amount: 1000,
          paid_amount: 600,
          unpaid_amount: 400,
        },
        {
          due_type: 'Taxes',
          total_dues: 3,
          total_amount: 690,
          paid_amount: 690,
          unpaid_amount: 0,
        },
        {
          due_type: 'Penalties',
          total_dues: 2,
          total_amount: 700,
          paid_amount: 0,
          unpaid_amount: 700,
        },
        {
          due_type: 'Others',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
      ],
      summary_due_household: [
        {
          household_id: 1,
          block_no: 'blk-123',
          lot_no: '1',
          total_dues: 2,
          total_amount: 1000,
          payment_status: 'Fully Paid',
        },
        {
          household_id: 2,
          block_no: 'blk-456',
          lot_no: '2',
          total_dues: 3,
          total_amount: 1300,
          payment_status: 'Unpaid',
        },
      ],

      total_unpaid_dues: {
        total_unpaid_dues: 3,
        total_unpaid_amount: 1200,
        affected_households: 2,
        average_unpaid_per_household: 600,
      },
    });
  });

  test('Returns null in report if it cannot be found in database', async () => {
    //mock database
    const mock_billed_result = [{ total_billed: null }];
    const mock_collected_result = [{ total_collected: null }];

    const mock_total_unpaid_dues = [
      {
        total_unpaid_dues: 0,
        total_unpaid_amount: null,
        distinct_households: 0,
      },
    ];

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mock_billed_result]); //Mock billed result query
    mockDB.query.mockResolvedValueOnce([mock_collected_result]); //Mock collected result query
    mockDB.query.mockResolvedValueOnce([[]]); //Mock dues by type query
    mockDB.query.mockResolvedValueOnce([[]]); //Mock dues by household query
    mockDB.query.mockResolvedValueOnce([mock_total_unpaid_dues]); //Mock total unpaid dues query

    //Run actual function
    const result = await DuesService.getDuesReport();

    //Expect funtions to run properly
    expect(mockDB.query).toHaveBeenNthCalledWith(
      1,
      `
    SELECT SUM(amount) AS total_billed
    FROM dues
    WHERE MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      2,
      `
    SELECT SUM(amount) AS total_collected 
    FROM dues
    WHERE status = 'Paid' AND MONTH(due_date) = ? AND YEAR(due_date) = ?
    `,
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      3,
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
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      4,
      `
    SELECT
    m.first_name,
    m.last_name,
    d.household_id,
    h.block_no,
    h.lot_no,
    COUNT(d.id) AS total_dues,
    SUM(d.amount) AS total_amount,
    CASE
      WHEN SUM(d.status = 'Unpaid') = COUNT(*) THEN 'Unpaid'
      WHEN SUM(d.status = 'Paid') = COUNT(*) THEN 'Fully Paid'
      ELSE 'Partially Paid'
    END AS payment_status
  FROM dues d
  JOIN households h ON d.household_id = h.id
  JOIN families f ON f.household_id = h.id
  JOIN (
    SELECT m1.*
    FROM members m1
    INNER JOIN (
      SELECT family_id, MIN(id) AS min_id
      FROM members
      GROUP BY family_id
    ) m2 ON m1.id = m2.min_id
  ) m ON m.family_id = f.id
  WHERE MONTH(d.due_date) = ? AND YEAR(d.due_date) = ?
  GROUP BY d.household_id, h.block_no, h.lot_no, m.first_name, m.last_name
  `,
      [expect.any(Number), expect.any(Number)]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      5,
      `
    SELECT
    COUNT(*) AS total_unpaid_dues,
    SUM(amount) AS total_unpaid_amount,
    COUNT(DISTINCT household_id) as distinct_households
    FROM dues
    WHERE status = 'Unpaid'
    `
    );

    expect(result).toEqual({
      collection_efficiency: {
        total_billed: 0,
        total_collected: 0,
        efficiency: null,
      },
      summary_due_type: [
        {
          due_type: 'Monthly Amortization',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
        {
          due_type: 'Monthly Dues',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
        {
          due_type: 'Taxes',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
        {
          due_type: 'Penalties',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
        {
          due_type: 'Others',
          total_dues: 0,
          total_amount: 0,
          paid_amount: 0,
          unpaid_amount: 0,
        },
      ],
      summary_due_household: [],

      total_unpaid_dues: {
        total_unpaid_dues: 0,
        total_unpaid_amount: NaN,
        affected_households: 0,
        average_unpaid_per_household: NaN,
      },
    });
  });
});

describe('testing createDues(data) functionalities', () => {
  let mockDB;
  let mockConnection;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConnection = await mockDB.getConnection();
  });

  /* Old code for notes
  //When testing 'posts'
  test('Inserts due in the database and returns the due that was inserted', async() => {
    
    //Instead of faking fetching database, we fake on inserting the database
    //Note: Create test data as the argument being passed to the function,
    //test data of function argument
    const data = {
      due_date: '2025-07-29',
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      receipt_number: 'AB-1241',
      household_id: 4
    };

    //Simulate the execute() function on what it supposed to return
    //note: when you insert something in database, it returns an rows.insertID object that represents the new ID created for the row
    //note: but since we're not handling the actual database, we fake the insertID return value

    const fakeInsertID = 4;

    mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

    //note: .execute functions usuall returns [{resultObject}, metadata], so we need to mimick the return function to be similar as this
    // [{insertId: fakeInsertID}] == [{resultObject}](note: Our tested function doesn't use metadata so we don't include it but still need to return the same array dimension)
    // also note: [result] = [{resultObject}] --means-- result = {resultObject}

    //Run the actual function with our specified mock functions and test data
    const result = await DuesService.createDues(data);


    //Expect if execute was called with correct SQL
    expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`, `receipt_number`, `household_id`) VALUES (?, ?, ?, ?, ?, ?)', expect.any(Array))//expect that the query statement was called, along with the 'data' array

    const [calledQuery, calledValues] = mockDB.execute.mock.calls[0]; // mockDB.execute.mock.calls[0] - Accesses the first call that was made by execute() function
                                                                     //note that in the tested function it has execute("SQL query", values[...])
                                                                     //So calledQuery = 'SQL query'
                                                                     // calledValues = [new Date(), amount, status,.....]

    //We need to check if values[] was passed correctly to execute() database
    expect(calledValues[1]).toBe(1000); //checks if it passes the tested amount to execute()
    expect(calledValues[2]).toBe('Unpaid'); //checks it passes the tested status to execute()
    expect(calledValues[3]).toBe('Penalties');
    expect(calledValues[4]).toBe('AB-1241');
    expect(calledValues[5]).toBe(4);

    //Checks if it returns right
    expect(result).toEqual({

      id: fakeInsertID,
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      receipt_number: 'AB-1241',
      household_id: 4
    });

  })
  */

  test('Inserts due in the database and returns the due that was inserted along with its receipt number and household_id', async () => {
    //test data
    const data = {
      due_date: '2025-07-29',
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      member_id: 1,
    };

    //Mock connection queries
    mockConnection.query.mockResolvedValueOnce([[{ household_id: 2 }]]); //Mock the conn.query of SELECT
    mockConnection.query.mockResolvedValueOnce([[{ max_receipt: 123 }]]); //Mock conn.execute of UPDATE
    mockConnection.execute.mockResolvedValueOnce([{ insertId: 2 }]); //Mock conn.execute of INSERT

    //run actual function
    const result = await DuesService.createDues(data);

    //Expect function run properly
    expect(mockConnection.beginTransaction).toHaveBeenCalled();

    expect(mockConnection.query).toHaveBeenNthCalledWith(
      1,
      `
      SELECT
      f.household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `,
      [1]
    );

    expect(mockConnection.query).toHaveBeenNthCalledWith(
      2,
      `SELECT MAX(receipt_number) AS max_receipt FROM dues FOR UPDATE`
    );

    expect(mockConnection.execute).toHaveBeenNthCalledWith(
      1,
      'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`,  `household_id`, `receipt_number`) VALUES (?, ?, ?, ?, ?, ?)',
      expect.any(Array)
    );

    const [calledQuery, calledValues] = mockConnection.execute.mock.calls[0]; //the [0] is the first execute

    expect(calledValues[0]).toBeInstanceOf(Date);
    expect(calledValues[1]).toBe(1000);
    expect(calledValues[2]).toBe('Unpaid');
    expect(calledValues[3]).toBe('Penalties');
    expect(calledValues[4]).toBe(2);
    expect(calledValues[5]).toBe(124);

    expect(mockConnection.commit).toHaveBeenCalled();

    expect(result).toEqual({
      id: 2,
      due_date: '2025-07-29',
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      receipt_number: 124,
      household_id: 2,
    });

    expect(mockConnection.release).toHaveBeenCalled();
  });

  test('Rolls back transaction and throw error if SQL fails', async () => {
    //test data
    const data = {
      due_date: '2025-07-29',
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      member_id: 1,
    };

    //Mock connection queries
    mockConnection.query.mockResolvedValueOnce([[]]);
    mockConnection.query.mockResolvedValueOnce([[]]);
    mockConnection.execute.mockRejectedValueOnce(
      'INSERT ERROR: foreign key household_id cannot be null'
    );

    //run actual function
    await expect(DuesService.createDues(data)).rejects.toThrow(
      'INSERT ERROR: foreign key household_id cannot be null'
    );

    //Expect function to run properly
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.query).toHaveBeenNthCalledWith(
      1,
      `
      SELECT
      f.household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `,
      [1]
    );

    expect(mockConnection.execute).toHaveBeenNthCalledWith(
      1,
      'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`,  `household_id`, `receipt_number`) VALUES (?, ?, ?, ?, ?, ?)',
      expect.any(Array)
    );

    const [calledQuery, calledValues] = mockConnection.execute.mock.calls[0]; //the [0] is the first execute

    expect(calledValues[0]).toBeInstanceOf(Date);
    expect(calledValues[1]).toBe(1000);
    expect(calledValues[2]).toBe('Unpaid');
    expect(calledValues[3]).toBe('Penalties');
    expect(calledValues[4]).toBeUndefined;
    expect(calledValues[5]).toBe(1);

    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });
  //It for some reason does not cover the finally{} branch
  //Somewhat unecessary but For the sake of 100% test coverage
  test('Skips conn.release if conn was not established', async () => {
    //test data

    //Mock connection queries
    mockDB.getConnection.mockRejectedValueOnce(new Error('Failed to connect'));

    //Expect function to run properly
    await expect(
      DuesService.createDues({
        due_date: '2025-07-29',
        amount: 1000,
        status: 'Unpaid',
        due_type: 'Penalties',
        member_id: 1,
      })
    ).rejects.toThrow();

    expect(mockConnection?.release).not.toHaveBeenCalled();
  });
});

describe('testing updateDues() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });
  /**
   * In the updateDues() function -- id = row id, updates = An object that represents the column and new value(ex. {amount:1000})
   * Object.keys() - What this does is it takes the 'updates' object (which you pass to the function) and extracts an array of its property names (keys). -- BASICALLY IT GETS THE KEY PART OF THE OBJECT(I.E. GETS THE COLUMN OF WHAT YOU'RE UPDATING)
   * ex. const keys = Object.keys({amount:1000})-- becomes
   *            keys = [amount] - It creates an array of 'keys' that was inside the 'updates' object
   *            which means - keys.length = 1
   *
   * note: if columns = 'amount'
   *           updates[columns] is the same as updates.amount
   */

  //When testing updates
  test('Update Due record`s column and return the affected row if you try to update only 1 column', async () => {
    //Note: Create test data as the argument being passed to the function,
    //mock data of function argument
    const id = 1;
    const updates = { amount: 2000 };

    //Simulate the execute() function on what's it supposed to return
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //the actual execute() funcion returns its entire metadata but function we are testing only use 'affectedRows' metadata so we fake a return of 'affectedRows'
    //Run the actual function with mock functions and test data
    const result = await DuesService.updateDues(id, updates);

    //Expect if execute was called with correct SQL
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.dues SET `amount` = ? WHERE id = ?',
      [2000, 1]
    );

    //Expect if function produces correct value
    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 1;
    const updates = { amount: 2000, status: 'Paid' };

    //run the function and expect it to reject and throw an error
    await expect(DuesService.updateDues(id, updates)).rejects.toThrow(
      'Only one valid column can be updated at a time.'
    );
  });

  test('Throws error if you try to update a column that is not valid', async () => {
    //test data of function argument
    const id = 1;
    const updates = { Lolz: 'I AM GOING INSANE' };

    //run the function and expect it to reject and throw an error
    await expect(DuesService.updateDues(id, updates)).rejects.toThrow(
      'Only one valid column can be updated at a time.'
    );
  });
});

describe('testing updateduesMultiple() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Updates multiple columns and returns the number of affected rows', async () => {
    //test data
    const id = 1;
    const updates = {
      amount: 2000,
      due_type: 'Taxes',
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //Run the function
    const result = await DuesService.updateDuesMultiple(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toBeCalledWith(
      'UPDATE kabuhayan_db.dues SET `amount` = ?, `due_type` = ? WHERE id = ?',
      [2000, 'Taxes', 1]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Updates multiple columns with Paid status', async () => {
    //test data
    const id = 1;
    const updates = {
      amount: 2000,
      status: 'Paid',
      due_type: 'Taxes',
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //Run the function
    const result = await DuesService.updateDuesMultiple(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toBeCalledWith(
      'UPDATE kabuhayan_db.dues SET `amount` = ?, `status` = ?, `date_paid` = NOW(), `due_type` = ? WHERE id = ?',
      [2000, 'Paid', 'Taxes', 1]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Updates multiple columns with Unpaid status', async () => {
    //test data
    const id = 1;
    const updates = {
      amount: 2000,
      status: 'Unpaid',
      due_type: 'Taxes',
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //Run the function
    const result = await DuesService.updateDuesMultiple(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toBeCalledWith(
      'UPDATE kabuhayan_db.dues SET `amount` = ?, `status` = ?, `date_paid` = NULL, `due_type` = ? WHERE id = ?',
      [2000, 'Unpaid', 'Taxes', 1]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throw error for updating unauthorized column', async () => {
    //test data
    const id = 1;
    const updates = {
      amount: 2000,
      status: 'Unpaid',
      due_type: 'Taxes',
      Heavy: 'is dead',
    };

    //Run the function
    await expect(DuesService.updateDuesMultiple(id, updates)).rejects.toThrow(
      `Attempted to update an unauthorized column: Heavy`
    );
  });

  test('Throw error for trying to update no columns', async () => {
    //test data
    const id = 1;
    const updates = {};

    //Run the function
    await expect(DuesService.updateDuesMultiple(id, updates)).rejects.toThrow(
      `No valid columns provided for update.`
    );
  });
});

describe('testing deleteDues() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Deletes a due based on given id and returns affectedRows', async () => {
    //test data of function argument
    const id = 3;

    //Simulate the execute() function on what's it supposed to return
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //the actual execute() funcion returns its entire metadata but function we are testing only use 'affectedRows' metadata so we fake a return of 'affectedRows'

    //run actual function
    const result = await DuesService.deleteDues(id);

    //Check if execute() uses correct SQL
    expect(mockDB.execute).toHaveBeenCalledWith(
      'DELETE FROM kabuhayan_db.dues WHERE id = ?',
      [3]
    );

    //Check if the tested function returned correctly
    expect(result).toBe(1);
  });
});

// TESTING getUnpaidDuesReport()

describe('Testing getUnpaidDuesReport() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns grouped unpaid dues report (no filters)', async () => {
    const mockRows = [
      {
        first_name: 'John',
        last_name: 'Doe',
        block_no: 1,
        lot_no: 2,
        due_type: 'Monthly Dues',
        amount: 500,
        amount_paid: 100,
        balance: 400,
        due_date: '2024-05-10',
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        block_no: 1,
        lot_no: 2,
        due_type: 'Taxes',
        amount: 300,
        amount_paid: 0,
        balance: 300,
        due_date: '2024-05-15',
      },
    ];

    mockDB.query.mockResolvedValueOnce([mockRows]);

    const result = await DuesService.getUnpaidDuesReport();

    expect(mockDB.query).toHaveBeenCalledWith(expect.any(String), []);

    expect(result).toEqual([
      {
        member_name: 'John Doe',
        filter_value: 'Blk 1, Lot 2',
        dues: [
          {
            due_type: 'Monthly Dues',
            amount_due: 500,
            amount_paid: 100,
            balance: 400,
            due_date: '2024-05-10',
          },
          {
            due_type: 'Taxes',
            amount_due: 300,
            amount_paid: 0,
            balance: 300,
            due_date: '2024-05-15',
          },
        ],
      },
    ]);
  });

  test('Applies blockNo filter', async () => {
    const mockRows = [
      {
        first_name: 'Jane',
        last_name: 'Smith',
        block_no: 5,
        lot_no: 10,
        due_type: 'Penalties',
        amount: 200,
        amount_paid: 0,
        balance: 200,
        due_date: '2024-07-01',
      },
    ];

    mockDB.query.mockResolvedValueOnce([mockRows]);

    const result = await DuesService.getUnpaidDuesReport({ blockNo: 5 });

    expect(mockDB.query).toHaveBeenCalledWith(
      expect.stringContaining('h.block_no = ?'),
      [5]
    );

    expect(result.length).toBe(1);
    expect(result[0].member_name).toBe('Jane Smith');
  });

  test('Applies lotNo filter', async () => {
    const mockRows = [
      {
        first_name: 'Paolo',
        last_name: 'Reyes',
        block_no: 3,
        lot_no: 99,
        due_type: 'Taxes',
        amount: 900,
        amount_paid: 100,
        balance: 800,
        due_date: '2024-05-22',
      },
    ];

    mockDB.query.mockResolvedValueOnce([mockRows]);

    const result = await DuesService.getUnpaidDuesReport({ lotNo: 99 });

    expect(mockDB.query).toHaveBeenCalledWith(
      expect.stringContaining('h.lot_no = ?'),
      [99]
    );

    expect(result[0].filter_value).toBe('Blk 3, Lot 99');
  });

  test('Returns empty array when DB returns no unpaid dues', async () => {
    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await DuesService.getUnpaidDuesReport();

    expect(result).toEqual([]);
  });

  test('Throws error when DB query fails', async () => {
    mockDB.query.mockRejectedValueOnce(new Error('DB Error'));

    await expect(DuesService.getUnpaidDuesReport()).rejects.toThrow('DB Error');
  });
});
