
import { describe, it, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as FamilyMembersService from '../../services/family_members.services.js';

vi.mock('../../config/connect.js', () => ({
  getDB: vi.fn().mockResolvedValue({
    execute: vi.fn(),
    query: vi.fn(),
  }),
}));

describe('Testing getFamilyMembers() functionalities', () => {

  let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

  test('Get all records of Family Members when function is called', async () => {
    //mock data
    const mockFamilyMembers = [

      {id: 1, family_id: 1, last_name: "Sensei", first_name: "Madly", middle_name: "Abydos", birth_date: '2004-12-13', gender: 'M', relation_to_member: 'Father', member_id: 2, educational_attainment: 'Undergraduate'},
      {id: 2, family_id: 1, last_name: "Takanashi", first_name: "Hoshino", middle_name: "Abydos", birth_date: '2008-01-02', gender: 'F', relation_to_member: 'Sister', member_id: 2, educational_attainment: 'Highschool'},
      {id: 3, family_id: 1, last_name: "Okusora", first_name: "Ayane", middle_name: "Abydos", birth_date: '2010-11-12', gender: 'F', relation_to_member: 'Sister', member_id: 2, educational_attainment: 'Highschool'},
      {id: 4, family_id: 1, last_name: "Kuromi", first_name: "Serika", middle_name: "Abydos", birth_date: '2010-06-25', gender: 'F', relation_to_member: 'Sister', member_id: 2, educational_attainment: 'Highschool'},
      {id: 5, family_id: 1, last_name: "Izayoi", first_name: "Nonomi", middle_name: "Abydos", birth_date: '2009-02-01', gender: 'F', relation_to_member: 'Sister', member_id: 2, educational_attainment: 'Highschool'},

    ]

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mockFamilyMembers])

    //run actual function
    const result = await FamilyMembersService.getFamilyMembers()

    //expect actual function logic to be correct
    expect(mockDB.query).toBeCalledWith('SELECT * FROM family_members')
    expect(result).toBe(mockFamilyMembers);

  })


})

describe('Testing getFamilyMemberById() functionalities', () => {

  let mockDB;

  beforeEach(async () => {

      vi.clearAllMocks();
      mockDB = await getDB();
  })

  test('Returns a familyMember record based on given id', async() => {

    //test data
    const id = 2

    //mock data
    const mockFamilyMember =  {id: 2, family_id: 1, last_name: "Takanashi", first_name: "Hoshino", middle_name: "Abydos", birth_date: '2008-01-02', gender: 'F', relation_to_member: 'Sister', member_id: 2, educational_attainment: 'Highschool'}

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mockFamilyMember]])

    //run actual function
    const result = await FamilyMembersService.getFamilyMemberById(2)

    //expect actual function logic to be correct
    expect(mockDB.query).toBeCalledWith('SELECT * FROM family_members WHERE id = ?', [2])
    expect(result).toBe(mockFamilyMember);

    

  })

  test('Returns a no record if given id is not found in database', async() => {

    //test data
    const id = 2

    //mock data

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[]])

    //run actual function
    const result = await FamilyMembersService.getFamilyMemberById(2)

    //expect actual function logic to be correct
    expect(mockDB.query).toBeCalledWith('SELECT * FROM family_members WHERE id = ?', [2])
    expect(result).toBe(null);

    

  })
  
})


describe('Testing createFamilyMembers() functionalities', () => {

  let mockDB;
  let mockConn;

  beforeEach(async () => {

      vi.clearAllMocks();
      mockDB = await getDB();
      mockConn = mockDB;
  })

  test('Inserts FamilyMember record in database and returns that record that was inserted', async() => {

    //test data
    const data =  {
      family_id: 1, 
      last_name: "Sorasaki", 
      first_name: "Hina", 
      middle_name: "Gehenna", 
      birth_date: '2008-02-17', 
      gender: 'F', 
      relation_to_member: 'Sister', 
      member_id: 2, 
      educational_attainment: 'Highschool'}

    //mock database functions
    const fakeInsertID = 6;
    mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

    //run actual function
    const result = await FamilyMembersService.createFamilyMember(data);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.family_members (`family_id`,`last_name`, `first_name`, `middle_name`, `birth_date`, `gender`, `relation_to_member`, `member_id`, `educational_attainment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', expect.any(Array))

    const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        
    expect(calledValues[0]).toBe(1);
    expect(calledValues[1]).toBe('Sorasaki');
    expect(calledValues[2]).toBe('Hina');
    expect(calledValues[3]).toBe('Gehenna');
    expect(calledValues[4]).toBe('2008-02-17');
    expect(calledValues[5]).toBe('F');
    expect(calledValues[6]).toBe('Sister');
    expect(calledValues[7]).toBe(2);
    expect(calledValues[8]).toBe('Highschool');

    expect(result).toEqual({

      id: 6,
      family_id: 1, 
      last_name: "Sorasaki", 
      first_name: "Hina", 
      middle_name: "Gehenna", 
      birth_date: '2008-02-17', 
      gender: 'F', 
      relation_to_member: 'Sister', 
      member_id: 2, 
      educational_attainment: 'Highschool'
    })


  })

  test('Inserts FamilyMember record in database and returns that record that was inserted WHILE using an existing connection', async() => {

    //test data
    const data =  {
      family_id: 1, 
      last_name: "Sorasaki", 
      first_name: "Hina", 
      middle_name: "Gehenna", 
      birth_date: '2008-02-17', 
      gender: 'F', 
      relation_to_member: 'Sister', 
      member_id: 2, 
      educational_attainment: 'Highschool'}

    //mock database functions
    const fakeInsertID = 6;
    mockConn.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

    //run actual function
    const result = await FamilyMembersService.createFamilyMember(data, mockConn);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.family_members (`family_id`,`last_name`, `first_name`, `middle_name`, `birth_date`, `gender`, `relation_to_member`, `member_id`, `educational_attainment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', expect.any(Array))

    const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        
    expect(calledValues[0]).toBe(1);
    expect(calledValues[1]).toBe('Sorasaki');
    expect(calledValues[2]).toBe('Hina');
    expect(calledValues[3]).toBe('Gehenna');
    expect(calledValues[4]).toBe('2008-02-17');
    expect(calledValues[5]).toBe('F');
    expect(calledValues[6]).toBe('Sister');
    expect(calledValues[7]).toBe(2);
    expect(calledValues[8]).toBe('Highschool');

    expect(result).toEqual({

      id: 6,
      family_id: 1, 
      last_name: "Sorasaki", 
      first_name: "Hina", 
      middle_name: "Gehenna", 
      birth_date: '2008-02-17', 
      gender: 'F', 
      relation_to_member: 'Sister', 
      member_id: 2, 
      educational_attainment: 'Highschool'
    })


  })

})

describe('Testing updateFamilyMember() functionalities', async() => {

  let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
        
    });

    test('Update Family record`s column and return number of affectedRows if you try to update only 1 column', async() => {
    
      //test data of function argument
      const id = 2
      const updates = {relation_to_member: 'Daughter'};

      //mock database functions
      mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

      //run actual function
      const result = await FamilyMembersService.updateFamilyMember(id, updates);

      //expect actual function logic to be correct
      expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.family_members SET `relation_to_member` = ? WHERE id = ?', ['Daughter', 2])

      expect(result).toEqual({affectedRows: 1});
      
    })

    test('Updates birth_date column when specified in updates and returns number of affectedRows', async() => {

      //test data of function argument
      const id = 2
      const updates = {birth_date: '2008-06-07'};

      //mock database functions
      mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

      //run actual function
      const result = await FamilyMembersService.updateFamilyMember(id, updates);

      //Expect function to run properly
      expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.family_members SET `birth_date` = ? WHERE id = ?', [new Date('2008-06-07'), 2])

      expect(result).toEqual({affectedRows: 1});
    })

    test('Updates birth_date column when specified but with invalid date format', async() => {

      //test data of function argument
      const id = 2
      const updates = {birth_date: 'invalid-date'};

      //mock database functions
      //mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

      //Expect function to run properly
      await expect(FamilyMembersService.updateFamilyMember(id, updates)).rejects.toThrow(`Invalid date format for birth_date: invalid`)
    })

    test('Updates birth_date column when specified but with invalid type', async() => {

      //test data of function argument
      const id = 2
      const updates = {birth_date: 20080607};

      //mock database functions
      //mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

      //Expect function to run properly
      await expect(FamilyMembersService.updateFamilyMember(id, updates)).rejects.toThrow(`Invalid type for birth_date`)
    })


    test('Updates birth_date column when specified but with null type', async() => {

      //test data of function argument
      const id = 2
      const updates = {birth_date: null};

      //mock database functions
      mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

      //Expect function to run properly
      const result = await FamilyMembersService.updateFamilyMember(id, updates);

      //Expect function to run properly
      expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.family_members SET `birth_date` = ? WHERE id = ?', [null, 2])
      expect(result).toEqual({affectedRows: 1});

    })

    test('Throws error if you try to update 2 or more columns', async() => {
    
        //test data of function argument
        const id = 2
        const updates = {relation_to_member: 'Daughter', educational_attainment: 'College'}

        //run actual function //expect actual function logic to be correct
        await expect(FamilyMembersService.updateFamilyMember(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Throws error if you try to update a column that does not exist', async() => {

        //test data of function argument
        const id = 2
        const updates = {Gacha: ' Please pray for my rolls'}

        //run actual function //expect actual function logic to be correct
        await expect(FamilyMembersService.updateFamilyMember(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

})

describe('Testing updateFamilyMemberMultiple() functionalities', async () => {

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
      relation_to_member: 'Daughter', 
      educational_attainment: 'College'
    }

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}])

    //Run actual function

    const result = await FamilyMembersService.updateFamilyMemberMultiple(id, updates)

    //Expect function to run properly
    expect(mockDB.execute).toHaveBeenCalledWith("UPDATE kabuhayan_db.family_members SET `relation_to_member` = ?, `educational_attainment` = ? WHERE id = ?", ['Daughter', 'College', 3])
    expect(result).toEqual({affectedRows: 1})
  })

  test('Updates birth_date column when specified in updates and returns number of affectedRows', async() => {

  //test data of function argument
  const id = 3
  const updates = {
    relation_to_member: 'Daughter', 
    educational_attainment: 'College',
    birth_date: '2008-06-07'
  };

  //mock database functions
  mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

  //run actual function
  const result = await FamilyMembersService.updateFamilyMemberMultiple(id, updates);

  //Expect function to run properly
  expect(mockDB.execute).toHaveBeenCalledWith("UPDATE kabuhayan_db.family_members SET `relation_to_member` = ?, `educational_attainment` = ?, `birth_date` = ? WHERE id = ?", ['Daughter', 'College', new Date('2008-06-07'),3])

  expect(result).toEqual({affectedRows: 1});
  })

  test('Updates birth_date column when specified but with invalid date format', async() => {

  //test data of function argument
  const id = 3
  const updates = {
    relation_to_member: 'Daughter', 
    educational_attainment: 'College',
    birth_date: 'invalid-date'
  };

  //run actual function //expect actual function logic to be correct
  await expect(FamilyMembersService.updateFamilyMemberMultiple(id, updates)).rejects.toThrow(`Invalid date format for birth_date: invalid-date`)

  })

  test('Updates birth_date column when specified but with invalid type', async() => {

  //test data of function argument
  const id = 3
  const updates = {
    relation_to_member: 'Daughter', 
    educational_attainment: 'College',
    birth_date: 20080607
  };

  //run actual function //expect actual function logic to be correct
  await expect(FamilyMembersService.updateFamilyMemberMultiple(id, updates)).rejects.toThrow(`Invalid type for birth_date`)

  })

  test('Updates birth_date column when specified but with null type', async() => {

  //test data of function argument
  const id = 3
  const updates = {
    relation_to_member: 'Daughter', 
    educational_attainment: 'College',
    birth_date: null
  };

  //mock database functions
  mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

  //run actual function
  const result = await FamilyMembersService.updateFamilyMemberMultiple(id, updates);

  expect(mockDB.execute).toHaveBeenCalledWith("UPDATE kabuhayan_db.family_members SET `relation_to_member` = ?, `educational_attainment` = ?, `birth_date` = ? WHERE id = ?", ['Daughter', 'College', null ,3])

  expect(result).toEqual({affectedRows: 1});
  })


  test("Throw error for updating unauthorized column", async() => {
  
    //test data
    const id = 3;
    const updates = {
      relation_to_member: 'Daughter', 
      educational_attainment: 'College',
      isAdmin: 'Yes'
    }

    await expect(FamilyMembersService.updateFamilyMemberMultiple(id, updates)).rejects.toThrow(`Attempted to update an unauthorized column: isAdmin`);
  })

  test('Throw error for trying to update no columns', async() => {

    //test data
    const id = 4
    const updates = {
    }

    //Run the function
    await expect(FamilyMembersService.updateFamilyMemberMultiple(id, updates)).rejects.toThrow(`No valid columns provided for update.`);

  })
})

describe('Testing deleteFamilyMembers() functionalities', () => {

    let mockDB;
    let mockConn;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
        mockConn = mockDB
    });

    test('Deletes a family member record and returns affectedRows to be 1', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]); //mocks a return for the first execute delete

    //run actual function
    const result = await FamilyMembersService.deleteFamilyMembers(id);

    expect(mockDB.execute).toHaveBeenCalledWith('DELETE FROM kabuhayan_db.family_members WHERE id = ?',[2]);
    //expect actual function logic to be correct
    expect(result).toBe(1);

    })

    test('Deletes a family member record and returns affectedRows to be 0 if record does not exist', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{affectedRows: 0}]); //mocks a return for the first execute delete

    //run actual function
    const result = await FamilyMembersService.deleteFamilyMembers(id);

    expect(mockDB.execute).toHaveBeenCalledWith('DELETE FROM kabuhayan_db.family_members WHERE id = ?',[2]);
    //expect actual function logic to be correct
    expect(result).toBe(0);

    })

    test('Deletes a family member record and returns affectedRows to be 1 using an existing connection', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockConn.execute.mockResolvedValueOnce([{affectedRows: 1}]); //mocks a return for the first execute delete

    //run actual function
    const result = await FamilyMembersService.deleteFamilyMembers(id);

    expect(mockConn.execute).toHaveBeenCalledWith('DELETE FROM kabuhayan_db.family_members WHERE id = ?',[2]);
    //expect actual function logic to be correct
    expect(result).toBe(1);

    })

})


