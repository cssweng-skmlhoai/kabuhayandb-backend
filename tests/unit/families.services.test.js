import{describe, test, expect, vi, beforeEach} from 'vitest';
import { getDB } from '../../config/connect.js';
import * as FamiliesService from '../../services/families.services.js'

vi.mock('../../config/connect.js', () => ({

    getDB: vi.fn().mockResolvedValue({

        execute: vi.fn(),
        query: vi.fn()
    })

}));

describe('Testing getFamilies() funtionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })


    test('Should return all records of families when function is called', async () => {
        //mock data
        const mock_families = [

            {family_id: 1, head_position: 'Father', land_acquisition: 'Auction', status_of_occupancy: 'Owner', household_id: 1},
            {family_id: 2, head_position: 'Mother', land_acquisition: 'On Process', status_of_occupancy: 'Sharer', household_id: 2},
            {family_id: 3, head_position: 'Uncle', land_acquisition: 'Expropriation', status_of_occupancy: 'Renter', household_id: 3}
        ];

        //mock database functions
        mockDB.query.mockResolvedValueOnce([mock_families]);

        //run actual function
        const result = await FamiliesService.getFamilies();

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM families');

        expect(result).toEqual(mock_families);
    })


})

describe('Testing getFamilyById() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the Family record based on ID if it exist', async() => {

        //mock database
        const mock_family = {id: 3, head_position: 'Uncle', land_acquisition: 'Expropriation', status_of_occupancy: 'Renter', household_id: 3};
        
        //test data argument
        const id = 3

         //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_family]]);

        //run actual function
        const result = await FamiliesService.getFamilyById(id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM families WHERE id = ?', [3]);
        expect(result).toBe(mock_family);

    })

    test('Returns nothing if Family record is not found based on ID', async() => {

        //mock database

        //test data argument
        const id = 45

        //mock database functions
        mockDB.query.mockResolvedValueOnce([[]])

        //run actual function
        const result = await FamiliesService.getFamilyById(id)

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM families WHERE id = ?', [45])
        expect(result).toBe(null)

    });
});


describe('testing getFamilyGivenHousehold() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the Family record`s id based on household_id', async() => {

        //mock database
        const mock_family = {id: 2, head_position: 'Uncle', land_acquisition: 'Expropriation', status_of_occupancy: 'Renter', household_id: 3};

        //test data
        const household_id = 3;

        //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_family]]);

        //run actual function
        const result = await FamiliesService.getFamilyGivenHousehold(household_id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM Families WHERE household_id = ?',[3])
        expect(result).toEqual(mock_family);

    })

    test('Returns nothing if family record is not found based on household_id', async() => {

        //mock database

        //test data
        const household_id = 45;

        //mock database functions
        mockDB.query.mockResolvedValueOnce([[]]);

        //run actual function
        const result = await FamiliesService.getFamilyGivenHousehold(household_id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM Families WHERE household_id = ?',[45])
        expect(result).toEqual(null);        
    })

})


describe('testing createFamilies() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Inserts Family record in database and returns that record that was inserted', async() => {

        //test data of function argument
        const data = {
            head_position: 'Father',
            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner',
            household_id: 4
        }

        //mock database functions
        const fakeInsertID = 4;
        mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

        //run actual function
        const result = await FamiliesService.createFamilies(data);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.families (`head_position`, `land_acquisition`, `status_of_occupancy`, `household_id`) VALUES (?, ?, ?, ?)', expect.any(Array))

        const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        
        expect(calledValues[0]).toBe('Father');
        expect(calledValues[1]).toBe('Direct Buying');
        expect(calledValues[2]).toBe('Owner');
        expect(calledValues[3]).toBe(4);

        expect(result).toEqual({

            id: fakeInsertID,
            head_position: 'Father',
            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner',
            household_id: 4
        });
    });


})

describe('Testing updateFamilies() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
        
    });

    test('Update Family record`s column and return the affected row if you try to update only 1 column', async() => {

        //test data of function argument
        const id = 2
        const updates = {land_acquisition: 'Direct Buying'};

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

        //run actual function
        const result = await FamiliesService.updateFamilies(id, updates);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.families SET `land_acquisition` = ? WHERE id = ?', ['Direct Buying', 2])

        expect(result).toEqual({affectedRows: 1});
        
    })

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {land_acquisition: 'Direct Buying', status_of_occupancy: 'Owner'}

        //run actual function //expect actual function logic to be correct
        await expect(FamiliesService.updateFamilies(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Throws error if you try to update a column that does not exist', async() => {

        //test data of function argument
        const id = 2
        const updates = {WhereIsMyHouse: ' :`( '}

        //run actual function //expect actual function logic to be correct
        await expect(FamiliesService.updateFamilies(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });



})

describe('Testing updateFamiliesMultiple() functionalities', () => {

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

            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner'
        }

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}])

        //Run actual function

        const result = await FamiliesService.updateFamiliesMultiple(id, updates)

        //Expect function to run properly
        expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.families SET `land_acquisition` = ?, `status_of_occupancy` = ? WHERE id = ?', ['Direct Buying', 'Owner', 3])
        expect(result).toEqual({affectedRows: 1})
     })

     test("Throw error for updating unauthorized column", async() => {

        //test data
        const id = 3;
        const updates = {
            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner',
            Loan_Sharker: 'Pablo Escobar',
        }

        await expect(FamiliesService.updateFamiliesMultiple(id, updates)).rejects.toThrow(`Attempted to update an unauthorized column: Loan_Sharker`);
     })

     test('Throw error for trying to update no columns', async() => {

        //test data
        const id = 4
        const updates = {
        }

        //Run the function
        await expect(FamiliesService.updateFamiliesMultiple(id, updates)).rejects.toThrow(`No valid columns provided for update.`);

     })
     test('Updates multiple columns and returns the number of affected rows by using an existing connection to database', async() => {

        //test data
        const id = 3;
        const updates = {

            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner'
        }

        //mock database functions
        mockConn.execute.mockResolvedValueOnce([{affectedRows: 1}])

        //Run actual function

        const result = await FamiliesService.updateFamiliesMultiple(id, updates, mockConn)

        //Expect function to run properly
        expect(mockConn.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.families SET `land_acquisition` = ?, `status_of_occupancy` = ? WHERE id = ?', ['Direct Buying', 'Owner', 3])
        expect(result).toEqual({affectedRows: 1})
     })
})
     

describe('Testing deleteFamily() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Deletes a family record and its family members records based on given id and returns affectedRows to be 2', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]); //mocks a return for the first execute delete
    mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]); //mocks a return for the second execute delete

    //run actual functio
    const result = await FamiliesService.deleteFamily(id);

    expect(mockDB.execute).toHaveBeenNthCalledWith(1,'DELETE FROM kabuhayan_db.family_members WHERE family_id = ?',[2]); //Checks if first .execute query was called properly
    expect(mockDB.execute).toHaveBeenNthCalledWith(2,'DELETE FROM kabuhayan_db.families WHERE id = ?', [2]) //Checks if second .execute query was called properly

    //expect actual function logic to be correct
    expect(result).toBe(1);

    })

    test('Deletes no record and returns affected rows to be 0 if family record does not exist based on id', async() => {

        //test data of function argument
        const id = 20;

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 0}]); //mocks a return for the first execute delete on family_members
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 0}]); //mocks a return for the second execute delete on families

        //run actual functio
        const result = await FamiliesService.deleteFamily(id);

        expect(mockDB.execute).toHaveBeenNthCalledWith(1,'DELETE FROM kabuhayan_db.family_members WHERE family_id = ?',[20]); //Checks if first .execute query was called properly
        expect(mockDB.execute).toHaveBeenNthCalledWith(2,'DELETE FROM kabuhayan_db.families WHERE id = ?', [20]) //Checks if second .execute query was called properly

        //expect actual function logic to be correct
        expect(result).toBe(0);
    })

})