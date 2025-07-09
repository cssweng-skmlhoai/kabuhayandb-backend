import{describe, test, expect, vi, beforeEach} from 'vitest';
import { getDB } from '../../config/connect.js';
import * as CredentialsService from '../../services/credentials.services.js'
import bcrypt from 'bcrypt';

vi.mock('../../config/connect.js', () => ({

    getDB: vi.fn().mockResolvedValue({

        execute: vi.fn(),
        query: vi.fn()
    })

}));

//For mocking the hash function
vi.mock('bcrypt', () => ({
    default:{
        hash: vi.fn(),
        compare: vi.fn()

    }
    

}));

describe('Testing getCredentials() funtionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })


    test('Should return all records of families when function is called', async () => {
        //mock data
        const mock_credentials = [

            {id: 1, member_id: 1, username: 'Dovahkin', password: 'Dragonborn'},
            {id: 2, member_id: 2, username: 'Trevor', password: 'IloveDrugs'},
            {id: 3, member_id: 3, username: 'Henya', password: 'BestKettle'}
        ];

        //mock database functions
        mockDB.query.mockResolvedValueOnce([mock_credentials]);

        //run actual function
        const result = await CredentialsService.getCredentials();

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM credentials');

        expect(result).toBe(mock_credentials);
    })


})

describe('Testing getCredentialsById() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the Credential record based on ID if it exist', async() => {

        //mock database
        const mock_credential = {id: 3, member_id: 3, username: 'Henya', password: 'BestKettle'};
        
        //test data argument
        const id = 3

         //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_credential]]);

        //run actual function
        const result = await CredentialsService.getCredentialsById(id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM credentials WHERE id = ?', [3]);
        expect(result).toBe(mock_credential);

    })

    test('Returns nothing if Credential record is not found based on ID', async() => {

        //mock database

        //test data argument
        const id = 45

        //mock database functions
        mockDB.query.mockResolvedValue([[]])

        //run actual function
        const result = await CredentialsService.getCredentialsById(id)

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM credentials WHERE id = ?', [45])
        expect(result).toBe(null)

    });
});

describe('Testing getCredentialsByName() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the Credential record based on Name if it exist', async() => {

        //mock database
        const mock_credential = {id: 3, member_id: 3, username: 'Henya', password: 'BestKettle'};
        
        //test data argument
        const name = 'Henya'

        //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_credential]]);

        //run actual function
        const result = await CredentialsService.getCredentialsByName(name);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM credentials WHERE username = ?', 'Henya');
        expect(result).toBe(mock_credential);

    })

    test('Returns nothing if Credential record is not found based on Name', async() => {

        //mock database

        //test data argument
        const name = 'Pikamee'

        //mock database functions
        mockDB.query.mockResolvedValue([[]])

        //run actual function
        const result = await CredentialsService.getCredentialsByName(name)

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM credentials WHERE username = ?', 'Pikamee')
        expect(result).toBe(null)

    });
});    



describe('testing createCredentials() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Inserts Credential record in database and returns that record that was inserted', async() => {

        //test data of function argument
        const data = {
            member_id: 4, 
            username: 'Carthethyia', 
            password: 'MyCurrentWaifu'
        }

        //mock database functions
        const fakeInsertID = 4;
        mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

        //mock hash functions
        const fakeHashedPassword = 'KeepMyWaifuASecret'
        bcrypt.hash.mockResolvedValueOnce(fakeHashedPassword);

        //run actual function
        const result = await CredentialsService.createCredentials(data);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.credentials (`member_id`, `username`, `password`) VALUES (?, ?, ?)', expect.any(Array))

        const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        

        expect(bcrypt.hash).toHaveBeenCalledWith('MyCurrentWaifu', expect.any(Number));

        expect(calledValues[0]).toBe(4);
        expect(calledValues[1]).toBe('Carthethyia');
        expect(calledValues[2]).toBe('KeepMyWaifuASecret');

        expect(result).toEqual({

            id: fakeInsertID,
            member_id: 4, 
            username: 'Carthethyia', 
        });
    });


})

describe('Testing updateCredentials() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Update Credential record`s column except password column and return the affected row if you try to update only 1 column', async() => {

        //test data of function argument
        const id = 2
        const updates = {username: 'Franklin'};

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

        //run actual function
        const result = await CredentialsService.updateCredentials(id, updates);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.credentials SET `username` = ? WHERE id = ?', ['Franklin', 2])

        expect(result).toEqual({affectedRows: 1});
        
    })

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {username: 'Franklin', password: 'YeeYeeAssHaircut'}

        //run actual function //expect actual function logic to be correct
        await expect(CredentialsService.updateCredentials(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Throws error if you try to update column that is not allowed', async() => {

        //test data of function argument
        const id = 2
        const updates = {pet: 'Chop'}

        //run actual function //expect actual function logic to be correct
        await expect(CredentialsService.updateCredentials(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Updates credential record`s password and returns affectedRows', async() => {

        //test data of function argument
        const id = 2
        const updates = {password: 'SayWhat?'}

        //mock hash functions
        const fakeHashedPassword = 'SecretStash';
        bcrypt.hash.mockResolvedValueOnce(fakeHashedPassword);

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

        //run actual function
        const result = await CredentialsService.updateCredentials(id, updates);

        //expect actual function logic to be correct
        expect(bcrypt.hash).toHaveBeenCalledWith('SayWhat?', expect.any(Number));
        expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.credentials SET `password` = ? WHERE id = ?', ['SecretStash', 2]);

        expect(result).toEqual({affectedRows: 1});

    })

})

describe('Testing deleteCredentials() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Deletes a credential record based on given id and returns affectedRows', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValue([{affectedRows: 1}]);

    //run actual functio
    const result = await CredentialsService.deleteCredentials(id);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith('DELETE FROM kabuhayan_db.credentials WHERE id = ?',[2]);
    expect(result).toBe(1);

    })
})

describe('Testing verifyLogin() functionalities', ()=>{

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('returns user if username exists and password matches', async() => {


        //test data of function argument
        const username = 'Henya';
        const password = 'BestKettle';

        //mock database
        const mock_credential = {id: 3, member_id: 3, username: 'Henya', password: 'HashedBestKettle'};

        //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_credential]]);

        //mock hash functions
        bcrypt.compare.mockResolvedValueOnce(true);

        //run actual function
        const result = await CredentialsService.verifyLogin(username, password);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM kabuhayan_db.credentials WHERE username = ?', ['Henya'])
        expect(bcrypt.compare).toHaveBeenCalledWith(password, 'HashedBestKettle');
        expect(result).toEqual({id: 3, member_id: 3, username: 'Henya'})

    })

    test('returns null if no account is found', async() => {


        //test data of function argument
        const username = 'GawrGura';
        const password = 'A';

        //mock database

        //mock database functions
        mockDB.query.mockResolvedValueOnce([[]]);

        //run actual function
        const result = await CredentialsService.verifyLogin(username, password);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM kabuhayan_db.credentials WHERE username = ?', ['GawrGura'])
        expect(result).toBe(null);

    })

    test('returns null if password does not match', async() => {
        //test data of function argument
        const username = 'Henya';
        const password = 'StinkyKettle';

        //mock database
        const mock_credential = {id: 3, member_id: 3, username: 'Henya', password: 'HashedBestKettle'};


        //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_credential]]);
        
        //mock hash functions
        bcrypt.compare.mockResolvedValueOnce(false);

        //run actual function
        const result = await CredentialsService.verifyLogin(username, password);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM kabuhayan_db.credentials WHERE username = ?', ['Henya'])
        expect(result).toBe(null);
    })

})