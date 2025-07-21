import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as HouseholdServices from '../../services/households.services.js';
import * as familyServices from '../../services/families.services.js';

vi.mock('../../config/connect.js', () => ({
  getDB: vi.fn().mockResolvedValue({
    execute: vi.fn(),
    query: vi.fn(),
  }),
}));

vi.mock('../../services/families.services.js', () => ({ //mock functions of families.services that is used by deleteHousehold()

  getFamilyGivenHousehold: vi.fn(),
  deleteFamily: vi.fn()


}));

describe('Testing getHouseholds() funtionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Should return all records of households when function is called', async () => {
    //mock data
    const mock_households = [
      {
        household_id: 1,
        condition_type: 'Needs minor repair',
        tct_no: 'tct-123',
        block_no: 'blk-123',
        lot_no: 1,
        area: 'img1.png',
        open_space_share: 'house is fine',
        Meralco: 'True',
        Maynilad: 'True',
        Septic_Tank: 'True',
      },
      {
        household_id: 2,
        condition_type: 'Needs major repair',
        tct_no: 'tct-456',
        block_no: 'blk-456',
        lot_no: 2,
        area: 'img2.png',
        open_space_share: 'house is not fine',
        Meralco: 'True',
        Maynilad: 'False',
        Septic_Tank: 'False',
      },
      {
        household_id: 3,
        condition_type: 'Unfinished construction',
        tct_no: 'tct-789',
        block_no: 'blk-789',
        lot_no: 3,
        area: 'img3.png',
        open_space_share: 'There is no house',
        Meralco: 'False',
        Maynilad: 'False',
        Septic_Tank: 'False',
      },
    ];

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mock_households]);

    //run actual function
    const result = await HouseholdServices.getHouseholds();

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM households');

    expect(result).toBe(mock_households);
  });
});

describe('Testing getHouseholdById() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns the household record based on ID if it exist', async () => {
    //mock database
    const mock_household = {
      household_id: 2,
      condition_type: 'Needs major repair',
      tct_no: 'tct-456',
      block_no: 'blk-456',
      lot_no: 2,
      area: 'img2.png',
      open_space_share: 'house is not fine',
      Meralco: 'True',
      Maynilad: 'False',
      Septic_Tank: 'False',
    };

    //test data argument
    const id = 2;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_household]]);

    //run actual function
    const result = await HouseholdServices.getHouseholdById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM households WHERE id = ?',
      [2]
    );
    expect(result).toBe(mock_household);
  });

  test('Returns nothing if household record is not found based on ID', async () => {
    //mock database
    const mock_household = null;

    //test data argument
    const id = 45;

    //mock database functions
    mockDB.query.mockResolvedValue([[mock_household]]);

    //run actual function
    const result = await HouseholdServices.getHouseholdById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM households WHERE id = ?',
      [45]
    );
    expect(result).toBe(null);
  });
});

describe('testing createHouseholds() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Inserts Household record in database and returns that record that was inserted', async () => {
    //test data of function argument
    const data = {
      condition_type: 'Needs major repair',
      tct_no: 'tct-456',
      block_no: 'blk-456',
      lot_no: 2,
      area: 'img2.png',
      open_space_share: 'house is not fine',
      Meralco: false,
      Maynilad: false,
      Septic_Tank: true,
      //dues_id: 2
    };

    //mock database functions
    const fakeInsertID = 2;
    mockDB.execute.mockResolvedValueOnce([{ insertId: fakeInsertID }]);

    //run actual function
    const result = await HouseholdServices.createHouseholds(data);

    //expect actual function logic to be correct
    /* REMOVE REPLACE OLD CODE WITH NEW COMMENTS WHEN CREATEHOUSEHOLDS() FUNCTION GETS UPDATED
    expect(mockDB.execute).toHaveBeenCalledWith(
      'INSERT INTO kabuhayan_db.households (`condition_type`, `tct_no`, `block_no`, `lot_no`, `area`, `open_space_share`, `Meralco`, `Maynilad`, `Septic_Tank`, `dues_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', expect.any(Array)
    );
    */

    expect(mockDB.execute).toHaveBeenCalledWith(
      'INSERT INTO kabuhayan_db.households (`condition_type`, `tct_no`, `block_no`, `lot_no`, `area`, `open_space_share`, `Meralco`, `Maynilad`, `Septic_Tank`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)', expect.any(Array)
    );

    const [calledQuery, calledValues] = mockDB.execute.mock.calls[0];

    expect(calledValues[0]).toBe('Needs major repair');
    expect(calledValues[1]).toBe('tct-456');
    expect(calledValues[2]).toBe('blk-456');
    expect(calledValues[3]).toBe(2);
    expect(calledValues[4]).toBe('img2.png');
    expect(calledValues[5]).toBe('house is not fine');
    expect(calledValues[6]).toBe(false);
    expect(calledValues[7]).toBe(false);
    expect(calledValues[8]).toBe(true);
    //expect(calledValues[9]).toBe(2);

    expect(result).toEqual({
      id: fakeInsertID,
      condition_type: 'Needs major repair',
      tct_no: 'tct-456',
      block_no: 'blk-456',
      lot_no: 2,
      area: 'img2.png',
      open_space_share: 'house is not fine',
      Meralco: false,
      Maynilad: false,
      Septic_Tank: true,
      //dues_id: 2
    });
  });
});

describe('Testing updateHouseholds() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Update Houshold record`s column and return the affected row if you try to update only 1 column', async () => {
    //test data of function argument
    const id = 2;
    const updates = { condition_type: 'Needs major repair' };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await HouseholdServices.updateHouseholds(id, updates);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.households SET `condition_type` = ? WHERE id = ?',
      ['Needs major repair', 2]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 2;
    const updates = { condition_type: 'Needs major repair', Meralco: 'True' };

    //run actual function //expect actual function logic to be correct
    await expect(
      HouseholdServices.updateHouseholds(id, updates)
    ).rejects.toThrow('Only one valid column can be updated at a time.');
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 2;
    const updates = { HouseCondition: 'My House..... It goner :`[ ' };

    //run actual function //expect actual function logic to be correct
    await expect(
      HouseholdServices.updateHouseholds(id, updates)
    ).rejects.toThrow('Only one valid column can be updated at a time.');
  });
});

describe('Testing updateHouseholdMultiple() functionalities', () => {

    let mockDB;
    let mockConn

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
        mockConn = mockDB;
    });

     test('Updates multiple columns and returns the number of affected rows', async() => {

        //test data
        const id = 3;
        const updates = {

          condition_type: 'Needs major repair', 
          Meralco: 'True' 
        }

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}])

        //Run actual function

        const result = await HouseholdServices.updateHouseholdMultiple(id, updates)

        //Expect function to run properly
        expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.households SET `condition_type` = ?, `Meralco` = ? WHERE id = ?', ['Needs major repair', 'True', 3])
        expect(result).toEqual({affectedRows: 1})
     })

     test("Throw error for updating unauthorized column", async() => {

        //test data
        const id = 3;
        const updates = {
          condition_type: 'Needs major repair', 
          Meralco: 'True',
          Drugs: 'Shabu-Shabu',
        }

        await expect(HouseholdServices.updateHouseholdMultiple(id, updates)).rejects.toThrow(`Attempted to update an unauthorized column: Drugs`);
     })

     test('Throw error for trying to update no columns', async() => {

        //test data
        const id = 4
        const updates = {
        }

        //Run the function
        await expect(HouseholdServices.updateHouseholdMultiple(id, updates)).rejects.toThrow(`No valid columns provided for update.`);

     })
     test('Updates multiple columns and returns the number of affected rows by using an existing connection to database', async() => {

        //test data
        const id = 3;
        const updates = {

            condition_type: 'Needs major repair', 
            Meralco: 'True', 
        }

        //mock database functions
        mockConn.execute.mockResolvedValueOnce([{affectedRows: 1}])

        //Run actual function

        const result = await HouseholdServices.updateHouseholdMultiple(id, updates, mockConn)

        //Expect function to run properly
        expect(mockConn.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.households SET `condition_type` = ?, `Meralco` = ? WHERE id = ?', ['Needs major repair', 'True', 3])
        expect(result).toEqual({affectedRows: 1})
     })
})



describe('Testing deleteHouseholds() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Deletes a Household record , its due record, its family record, and return totalAffectedFamilyMembers to be 1', async () => {
    //test data of function argument
    const id = 2;

    //spy console.log
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //mocks a return for the first execute delete on dues
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //mocks a return for the second execute delete on households

    //Mock family Service functions
    familyServices.getFamilyGivenHousehold.mockResolvedValueOnce({id: 3, head_position: 'Uncle', land_acquisition: 'Expropriation', status_of_occupancy: 'Renter', household_id: 2}); //Assume family record exist with given household_id
    familyServices.deleteFamily.mockResolvedValueOnce(1)//Assume deleteFamily deletes successfully

    //run actual functio
    const result = await HouseholdServices.deleteHousehold(id);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenNthCalledWith(1,'DELETE FROM kabuhayan_db.dues WHERE household_id = ?',[2]);
    expect(familyServices.getFamilyGivenHousehold).toHaveBeenCalledWith(2)
    expect(familyServices.deleteFamily).toHaveBeenCalledWith(3)
    expect(logSpy).toHaveBeenNthCalledWith(1, 'Family (ID: 3) and its members deleted. Affected members: 1')
    expect(mockDB.execute).toHaveBeenNthCalledWith(2,'DELETE FROM kabuhayan_db.households WHERE id = ?',[2]);
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Total Family Members Affected: 1')
    expect(result).toBe(1);
  });

  test('Deletes a Household record and its due record but cannot find the family record to delete and return totalAffectedFamilyMembers to be 0', async() => {
    //test data of function argument
    const id = 2;

    //spy console.log
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});


    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //mocks a return for the first execute delete on dues
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //mocks a return for the second execute delete on households

    //Mock family Service functions
    familyServices.getFamilyGivenHousehold.mockResolvedValueOnce(null); //Assume family record exist with given household_id
    //familyServices.deleteFamily.mockResolvedValueOnce(1)//Assume deleteFamily deletes successfully

    //run actual functio
    const result = await HouseholdServices.deleteHousehold(id);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenNthCalledWith(1,'DELETE FROM kabuhayan_db.dues WHERE household_id = ?',[2]);
    expect(familyServices.getFamilyGivenHousehold).toHaveBeenCalledWith(2)
    expect(familyServices.deleteFamily).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenNthCalledWith(1, 'No family found for household 2 to delete.')
    expect(mockDB.execute).toHaveBeenNthCalledWith(2,'DELETE FROM kabuhayan_db.households WHERE id = ?',[2]);
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Total Family Members Affected: 0')
    expect(result).toBe(0);

  })

  test('Handling of errors', async() => {

    //test data of function argument
    const id = 4

    //mock database functions
    mockDB.execute.mockImplementationOnce(() => { //mock the first time an .execute() is called, it will throw an error

      throw new Error('DB Failure')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(()=> {}); //vi.spyOn(console, 'error') - tracks whenever console.error() is called //.mockImplementation(() => {}) - Replaces original function behavior of console.error to do nothing so you can track it properly

    //run actual function
    const result = await HouseholdServices.deleteHousehold(4);

    //expect actual function logic to be correct
    expect(consoleSpy).toHaveBeenCalledWith('An error occurred:', 'DB Failure')
    expect(result).toBeUndefined();

    consoleSpy.mockRestore();//Restore original console behavior

  })


});



