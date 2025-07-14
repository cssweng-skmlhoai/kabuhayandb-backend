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

  getDB: vi.fn().mockResolvedValue({//Mock SQL queries of getDB
      query: vi.fn(),
      execute: vi.fn(),
    getConnection: vi.fn().mockResolvedValue({//getDB also returns an object of getConnections() that has its own set of queries and executes
      query: vi.fn(),//Mock those as well
      execute: vi.fn(),
      beginTransaction: vi.fn(), //And also the function unique to getConnections
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn()
    })
  })

}))

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
  beforeEach(async () => {//runs before every test
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
      { id: 1, due_date: '2025-6-2', amount: 69.00, status: 'Unpaid', due_type: 'Taxes', receipt_number: 'R123', household_id: 1},
      { id: 2, due_date: '2026-2-2', amount: 420.00, status: 'Paid', due_type: 'Taxes', receipt_number: 'R456', household_id: 2},
      { id: 3, due_date: '2026-8-21', amount: 699.00, status: 'Unpaid', due_type: 'Penalties', receipt_number: 'R789', household_id: 3},
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
    vi.clearAllMocks()
    mockDB = await getDB();

  });

  test('returns the due record based on ID if it exist', async () => {
    //mock database
    const mock_due = { id: 2, due_date: '2026-2-2', amount: 420.00, status: 'Paid', due_type: 'Taxes', receipt_number: 'R456', household_id: 2}

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

    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues WHERE id = ?', [1]);
    
    expect(result).toEqual(mock_due);



  });

  
  test('returns nothing if due cannot be found based on ID', async () => {

    //mock database

    //test data of function argument
    const id = 45

    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await DuesService.getDuesById(id);

    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues WHERE id = ?', [45]);

    expect(result).toEqual(null);

  });

});


describe('testing createDues(data) functionalities', async() => {
  
  let mockDB;
  let mockConnection;

  beforeEach(async () => {
    vi.clearAllMocks()
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

  test('Inserts due in the database and returns the due that was inserted along with its receipt number and household_id', async() => {

    //test data 
    const data = {
      due_date: '2025-07-29',
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      member_id: 1
    };

    //Mock connection queries
    mockConnection.query.mockResolvedValueOnce([[{household_id: 2}]]) //Mock the conn.query of SELECT
    mockConnection.execute.mockResolvedValueOnce([{insertId: 2}])//Mock conn.execute of INSERT
    mockConnection.execute.mockResolvedValueOnce([])//Mock conn.execute of UPDATE

    //run actual function
    const result = await DuesService.createDues(data)

    //Expect function run properly
    expect(mockConnection.beginTransaction).toHaveBeenCalled();

    expect(mockConnection.query).toHaveBeenNthCalledWith(1, 
    `
      SELECT
      f.household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `, [1])

    expect(mockConnection.execute).toHaveBeenNthCalledWith(1,'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`,  `household_id`) VALUES (?, ?, ?, ?, ?)', expect.any(Array))

    const [calledQuery, calledValues] = mockConnection.execute.mock.calls[0]; //the [0] is the first execute

    expect(calledValues[0]).toBeInstanceOf(Date);
    expect(calledValues[1]).toBe(1000);
    expect(calledValues[2]).toBe('Unpaid');
    expect(calledValues[3]).toBe('Penalties');
    expect(calledValues[4]).toBe(2);

    expect(mockConnection.execute).toHaveBeenNthCalledWith(2, 'UPDATE kabuhayan_db.dues SET receipt_number = ? WHERE id = ?', ['00002', 2])

    expect(mockConnection.commit).toHaveBeenCalled();

    expect(result).toEqual({

      id: 2,
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      receipt_number: '00002',
      household_id: 2 
    });

    expect(mockConnection.release).toHaveBeenCalled();

  })

  test('Rolls back transaction and throw error if SQL fails', async() => {

    //test data 
    const data = {
      due_date: '2025-07-29',
      amount: 1000,
      status: 'Unpaid',
      due_type: 'Penalties',
      member_id: 1
    };

    //Mock connection queries
    mockConnection.query.mockResolvedValueOnce([[]]);
    mockConnection.execute.mockRejectedValueOnce('INSERT ERROR: foreign key household_id cannot be null');

    //run actual function
    await expect(DuesService.createDues(data)).rejects.toThrow('INSERT ERROR: foreign key household_id cannot be null')

    //Expect function to run properly
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.query).toHaveBeenNthCalledWith(1, 
    `
      SELECT
      f.household_id
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `, [1])

    expect(mockConnection.execute).toHaveBeenNthCalledWith(1,'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`,  `household_id`) VALUES (?, ?, ?, ?, ?)', expect.any(Array))

    const [calledQuery, calledValues] = mockConnection.execute.mock.calls[0]; //the [0] is the first execute

    expect(calledValues[0]).toBeInstanceOf(Date);
    expect(calledValues[1]).toBe(1000);
    expect(calledValues[2]).toBe('Unpaid');
    expect(calledValues[3]).toBe('Penalties');
    expect(calledValues[4]).toBeUndefined;

    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();



  })



})

describe('testing updateDues() functionalities', () =>{

  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks()
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
  test('Update Due record`s column and return the affected row if you try to update only 1 column', async() => {

    //Note: Create test data as the argument being passed to the function,
    //mock data of function argument
    const id = 1;
    const updates = {amount: 2000};

    //Simulate the execute() function on what's it supposed to return
    mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]); //the actual execute() funcion returns its entire metadata but function we are testing only use 'affectedRows' metadata so we fake a return of 'affectedRows'
    //Run the actual function with mock functions and test data
    const result = await DuesService.updateDues(id, updates);

    
    //Expect if execute was called with correct SQL
    expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.dues SET `amount` = ? WHERE id = ?', [2000, 1]);

    //Expect if function produces correct value
    expect(result).toEqual({affectedRows: 1 });

  });

  test('Throws error if you try to update 2 or more columns', async() => {

    //test data of function argument
    const id = 1;
    const updates = {amount: 2000, status: 'Paid'};


    //run the function and expect it to reject and throw an error
    await expect(DuesService.updateDues(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.');

  });

  test('Throws error if you try to update a column that is not valid', async() => {
    
    //test data of function argument
    const id = 1
    const updates = {Lolz: 'I AM GOING INSANE'};

    //run the function and expect it to reject and throw an error
    await expect(DuesService.updateDues(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.');

  });


})

describe('testing deleteDues() functionalities', () => {

  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks()
    mockDB = await getDB();

  });

  test('Deletes a due based on given id and returns affectedRows', async() => {

    //test data of function argument
    const id = 3;

    //Simulate the execute() function on what's it supposed to return
    mockDB.execute.mockResolvedValueOnce([{affectedRows:1}]); //the actual execute() funcion returns its entire metadata but function we are testing only use 'affectedRows' metadata so we fake a return of 'affectedRows'

    //run actual function
    const result = await DuesService.deleteDues(id);

    //Check if execute() uses correct SQL
    expect(mockDB.execute).toHaveBeenCalledWith('DELETE FROM kabuhayan_db.dues WHERE id = ?',[3]);

    //Check if the tested function returned correctly
    expect(result).toBe(1);
    
  });

});
