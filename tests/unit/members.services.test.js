import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';

import * as FamilyService from '../../services/families.services.js';
import * as HouseholdService from '../../services/households.services.js';
import * as MembersService from '../../services/members.services.js';
import * as FamilyMemberService from '../../services/family_members.services.js';

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

vi.mock('../../services/families.services.js', () => ({
  //mock functions of families.services that is used by deleteHousehold()

  updateFamiliesMultiple: vi.fn(),
  createFamilies: vi.fn(),
  getFamilyById: vi.fn(),
}));

vi.mock('../../services/households.services.js', () => ({
  updateHouseholdMultiple: vi.fn(),
  createHouseholds: vi.fn(),
  deleteHousehold: vi.fn(),
}));

vi.mock('../../services/family_members.services.js', () => ({
  updateFamilyMemberMultiple: vi.fn(),
  createFamilyMember: vi.fn(),
  deleteFamilyMembers: vi.fn(),
}));

describe('Testing getMembers() funtionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Should return all records of member when function is called', async () => {
    //mock data
    const mock_members = [
      {
        id: 1,
        last_name: 'Kobyla',
        first_name: 'Radzig',
        middle_name: 'Skalitz',
        birth_date: '1209-07-29',
        confirmity_signature: 'sign1.png',
        remarks: 'man of honor',
        family_id: 1,
      },
      {
        id: 2,
        last_name: 'De Santa',
        first_name: 'Michael',
        middle_name: 'Townley',
        birth_date: '1989-03-02',
        confirmity_signature: 'sign2.png',
        remarks: 'Misearable family man',
        family_id: 2,
      },
      {
        id: 3,
        last_name: 'Morgan',
        first_name: 'Arthur',
        middle_name: 'Van Der Linde',
        birth_date: '1880-06-02',
        confirmity_signature: 'sign3.png',
        remarks: 'You are a good man',
        family_id: 3,
      },
    ];

    //mock database functions
    mockDB.query.mockResolvedValueOnce([mock_members]);

    //run actual function
    const result = await MembersService.getMembers();

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM members');

    expect(result).toBe(mock_members);
  });
});

describe('Testing getMemberById() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns the Member record based on ID if it exist', async () => {
    //mock database
    const mock_member = {
      id: 3,
      last_name: 'Morgan',
      first_name: 'Arthur',
      middle_name: 'Van Der Linde',
      birth_date: '1880-06-02',
      confirmity_signature: 'sign3.png',
      remarks: 'You are a good man',
      family_id: 3,
    };

    //test data argumentz
    const id = 3;

    //mock database functions
    mockDB.query.mockResolvedValueOnce([[mock_member]]);

    //run actual function
    const result = await MembersService.getMemberById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM members WHERE id = ?',
      [3]
    );
    expect(result).toBe(mock_member);
  });

  test('Returns nothing if Member record is not found based on ID', async () => {
    //mock database
    const mock_member = null;

    //test data argument
    const id = 45;

    //mock database functions
    mockDB.query.mockResolvedValue([[mock_member]]);

    //run actual function
    const result = await MembersService.getMemberById(id);

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(
      'SELECT * FROM members WHERE id = ?',
      [45]
    );
    expect(result).toBe(null);
  });
});

describe('Testing getMembersHome() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns Members` Home records', async () => {
    //mock database
    const mock_members = [
      {
        id: 1,
        fullname: 'Kobyla Kobyla',
        head_position: 'Father',
        block_no: 'blk-123',
        lot_no: 'lt-123',
        tct_no: 'tct-123',
        family_id: 1,
        pfp: 'img',
      },
      {
        id: 2,
        fullname: 'Henry Kobyla',
        head_position: 'Son',
        block_no: 'blk-123',
        lot_no: 'lt-123',
        tct_no: 'tct-123',
        family_id: 1,
        pfp: 'img',
      },
      {
        id: 3,
        fullname: 'Michael De Santa',
        head_position: 'Father',
        block_no: 'blk-456',
        lot_no: 'lt-456',
        tct_no: 'tct-456',
        family_id: 2,
        pfp: 'img',
      },
    ];
    //mock database functions
    mockDB.query.mockResolvedValue([mock_members]);

    //run actual function
    const result = await MembersService.getMembersHome();

    //expect actual function logic to be correct
    expect(mockDB.query).toHaveBeenCalledWith(`
    SELECT 
      m.id AS member_id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullname,
      f.head_position,
      h.block_no,
      h.lot_no,
      h.tct_no,
      c.pfp
    FROM members m
    JOIN families f ON m.family_id = f.id
    JOIN households h ON f.household_id = h.id
    LEFT JOIN credentials c ON c.member_id = m.id
  `);

    expect(result).toBe(mock_members);
  });
});

describe('Testing createMemberInfo() functionalities', () => {
  let mockDB;
  let mockConnection;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConnection = await mockDB.getConnection();
  });

  test('Creates Member info on Household, Families, and Members records and returns data given', async () => {
    //test data
    const data = {
      members: {
        last_name: 'Kobyla',
        first_name: 'Radzig',
        middle_name: 'Skalitz',
        birth_date: '1209-07-29',
        confirmity_signature: 'sign1.png',
        remarks: 'man of honor',
        contact_number: '097865789',
        gender: 'M',
      },

      families: {
        head_position: 'Father',
        land_acquisition: 'Auction',
        status_of_occupancy: 'Owner',
      },

      households: {
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

      family_members: [
        {
          id: 2,
          family_id: 1,
          last_name: 'Takanashi',
          first_name: 'Hoshino',
          middle_name: 'Abydos',
          birth_date: '2008-01-02',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
        {
          id: 3,
          family_id: 1,
          last_name: 'Okusora',
          first_name: 'Ayane',
          middle_name: 'Abydos',
          birth_date: '2010-11-12',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
      ],
    };

    //mock function dependencies
    HouseholdService.createHouseholds.mockResolvedValueOnce({
      id: 1,
      condition_type: 'Needs minor repair',
      tct_no: 'tct-123',
      block_no: 'blk-123',
      lot_no: 1,
      area: 'img1.png',
      open_space_share: 'house is fine',
      Meralco: 'True',
      Maynilad: 'True',
      Septic_Tank: 'True',
    });

    FamilyService.createFamilies.mockResolvedValueOnce({
      id: 1,
      head_position: 'Father',
      land_acquisition: 'Auction',
      status_of_occupancy: 'Owner',
      household_id: 1,
    });

    FamilyMemberService.createFamilyMember.mockResolvedValueOnce({
      id: 2,
      family_id: 1,
      last_name: 'Takanashi',
      first_name: 'Hoshino',
      middle_name: 'Abydos',
      birth_date: '2008-01-02',
      gender: 'F',
      relation_to_member: 'Sister',
      member_id: 2,
      educational_attainment: 'Highschool',
    });

    FamilyMemberService.createFamilyMember.mockResolvedValueOnce({
      id: 3,
      family_id: 1,
      last_name: 'Okusora',
      first_name: 'Ayane',
      middle_name: 'Abydos',
      birth_date: '2010-11-12',
      gender: 'F',
      relation_to_member: 'Sister',
      member_id: 2,
      educational_attainment: 'Highschool',
    });

    mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]); //Mock execute in createMembers

    //run function
    const result = await MembersService.createMemberInfo(data);

    //Expect function to run properly
    expect(mockConnection.beginTransaction).toBeCalled();

    expect(HouseholdService.createHouseholds).toBeCalledWith(
      data.households,
      mockConnection
    );
    expect(FamilyService.createFamilies).toHaveBeenCalledWith(
      { ...data.families, household_id: 1 },
      mockConnection
    );
    //expect(MembersService.createMembers).toHaveBeenCalledWith({...data.members, family_id: 1}, mockConnection) //note: can't mock a function that exist in the same file as the tested function, it's too complicated and requires to create separate file to do so
    expect(FamilyMemberService.createFamilyMember).toHaveBeenNthCalledWith(
      1,
      { ...data.family_members[0], family_id: 1, member_id: 1 },
      mockConnection
    );
    expect(FamilyMemberService.createFamilyMember).toHaveBeenNthCalledWith(
      2,
      { ...data.family_members[1], family_id: 1, member_id: 1 },
      mockConnection
    );

    expect(result).toEqual({
      household_data: {
        id: 1,
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

      family_data: {
        id: 1,
        head_position: 'Father',
        land_acquisition: 'Auction',
        status_of_occupancy: 'Owner',
        household_id: 1,
      },

      member_data: {
        id: 1,
        last_name: 'Kobyla',
        first_name: 'Radzig',
        middle_name: 'Skalitz',
        birth_date: '1209-07-29',
        confirmity_signature: 'sign1.png',
        remarks: 'man of honor',
        contact_number: '097865789',
        gender: 'M',
        family_id: 1,
      },

      family_members: [
        {
          id: 2,
          family_id: 1,
          last_name: 'Takanashi',
          first_name: 'Hoshino',
          middle_name: 'Abydos',
          birth_date: '2008-01-02',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
        {
          id: 3,
          family_id: 1,
          last_name: 'Okusora',
          first_name: 'Ayane',
          middle_name: 'Abydos',
          birth_date: '2010-11-12',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
      ],
    });

    expect(mockConnection.release).toBeCalled();
  });

  test('Should rollback when error happens', async () => {
    //test data
    const data = {
      members: {
        last_name: 'Kobyla',
        first_name: 'Radzig',
        middle_name: 'Skalitz',
        birth_date: '1209-07-29',
        confirmity_signature: 'sign1.png',
        remarks: 'man of honor',
        contact_number: '097865789',
        gender: 'M',
      },

      families: {
        head_position: 'Father',
        land_acquisition: 'Auction',
        status_of_occupancy: 'Owner',
      },

      households: {
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

      family_members: [
        {
          id: 2,
          family_id: 1,
          last_name: 'Takanashi',
          first_name: 'Hoshino',
          middle_name: 'Abydos',
          birth_date: '2008-01-02',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
        {
          id: 3,
          family_id: 1,
          last_name: 'Okusora',
          first_name: 'Ayane',
          middle_name: 'Abydos',
          birth_date: '2010-11-12',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
      ],
    };

    //mock function dependencies

    FamilyService.createFamilies.mockResolvedValueOnce({
      id: 1,
      head_position: 'Father',
      land_acquisition: 'Auction',
      status_of_occupancy: 'Owner',
      household_id: 1,
    });

    FamilyMemberService.createFamilyMember.mockResolvedValueOnce({
      id: 2,
      family_id: 1,
      last_name: 'Takanashi',
      first_name: 'Hoshino',
      middle_name: 'Abydos',
      birth_date: '2008-01-02',
      gender: 'F',
      relation_to_member: 'Sister',
      member_id: 2,
      educational_attainment: 'Highschool',
    });

    FamilyMemberService.createFamilyMember.mockResolvedValueOnce({
      id: 3,
      family_id: 1,
      last_name: 'Okusora',
      first_name: 'Ayane',
      middle_name: 'Abydos',
      birth_date: '2010-11-12',
      gender: 'F',
      relation_to_member: 'Sister',
      member_id: 2,
      educational_attainment: 'Highschool',
    });

    mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]); //Mock execute in createMembers
    vi.spyOn(HouseholdService, 'createHouseholds').mockRejectedValue(
      new Error('Test Error')
    ); //force error
    //run function
    await expect(MembersService.createMemberInfo(data)).rejects.toThrow(
      'Test Error'
    );

    //Expect function to run properly
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });
});

describe('Testing getMemberInfoById() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Gets Member Info with given ID', async () => {
    //test data
    const id = 2;

    const mockMembers = {
      id: 2,
      last_name: 'Rambo',
      first_name: 'John',
      middle_name: 'US',
      birth_date: '1990-12-10',
      age: 35,
      gender: 'M',
      position: 'Father',
      contact_number: '09781231',
      tct_no: 'tct-123',
      block_no: 'blk-123',
      lot_no: 'lot-123',
      open_space_share: 100,
      area: 100,
      total: 200,
      confirmity_signature: 'Sign.png',
      remarks: 'Good',
      family_id: 1,
      condition_type: 'Good',
      Meralco: 'True',
      Maynilad: 'False',
      Septic_Tank: 'True',
      land_acquisition: 'Auction',
      status_of_occupancy: 'Owner',
      pfp: 'image',
    };

    const mockFamilyMembers = [
      {
        id: 2,
        family_id: 1,
        last_name: 'Takanashi',
        first_name: 'Hoshino',
        middle_name: 'Abydos',
        gender: 'F',
        relation_to_member: 'Sister',
        birth_date: '2008-01-02',
        age: 17,
        member_id: 2,
        educational_attainment: 'Highschool',
      },
      {
        id: 3,
        family_id: 1,
        last_name: 'Okusora',
        first_name: 'Ayane',
        middle_name: 'Abydos',
        gender: 'F',
        relation_to_member: 'Sister',
        birth_date: '2010-11-12',
        age: 15,
        member_id: 2,
        educational_attainment: 'Highschool',
      },
    ];

    //mock database functions

    mockDB.query.mockResolvedValueOnce([[mockMembers]]);

    mockDB.query.mockResolvedValueOnce([mockFamilyMembers]);

    const result = await MembersService.getMemberInfoById(2);

    expect(mockDB.query).toHaveBeenNthCalledWith(
      1,
      `
      SELECT
        m.id AS member_id,
        m.last_name,
        m.first_name,
        m.middle_name,
        m.birth_date,
        TIMESTAMPDIFF(YEAR, m.birth_date, CURDATE()) AS age,
        m.gender,
        f.head_position as position,
        m.contact_number,
        h.tct_no,
        h.block_no,
        h.lot_no,
        h.open_space_share,
        h.area,
        (h.area + h.open_space_share) AS total,
        m.confirmity_signature,
        m.remarks,
        f.id AS family_id,
        h.condition_type,
        h.Meralco,
        h.Maynilad,
        h.Septic_Tank,
        f.land_acquisition,
        f.status_of_occupancy,
        c.pfp
      FROM members m
      JOIN families f ON m.family_id = f.id
      JOIN households h ON f.household_id = h.id
      LEFT JOIN credentials c ON c.member_id = m.id
      WHERE m.id = ?;
    `,
      [2]
    );

    expect(mockDB.query).toHaveBeenNthCalledWith(
      2,
      `
      SELECT
        id,
        last_name,
        first_name,
        middle_name,
        relation_to_member AS relation,
        birth_date,
        TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age,
        gender,
        educational_attainment
      FROM family_members
      WHERE member_id = ?
    `,
      [2]
    );

    expect(result).toEqual({
      ...mockMembers,
      family_members: mockFamilyMembers,
    });
  });

  test('Returns null if no member is found', async () => {
    const id = 2;

    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await MembersService.getMemberInfoById(2);

    expect(mockDB.query).toHaveBeenNthCalledWith(
      1,
      `
      SELECT
        m.id AS member_id,
        m.last_name,
        m.first_name,
        m.middle_name,
        m.birth_date,
        TIMESTAMPDIFF(YEAR, m.birth_date, CURDATE()) AS age,
        m.gender,
        f.head_position as position,
        m.contact_number,
        h.tct_no,
        h.block_no,
        h.lot_no,
        h.open_space_share,
        h.area,
        (h.area + h.open_space_share) AS total,
        m.confirmity_signature,
        m.remarks,
        f.id AS family_id,
        h.condition_type,
        h.Meralco,
        h.Maynilad,
        h.Septic_Tank,
        f.land_acquisition,
        f.status_of_occupancy,
        c.pfp
      FROM members m
      JOIN families f ON m.family_id = f.id
      JOIN households h ON f.household_id = h.id
      WHERE m.id = ?;
    `,
      [2]
    );

    expect(result).toBeNull();
  });
});

describe('Testing updateMemberInfo() functionalities', () => {
  let mockDB;
  let mockConnection;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConnection = await mockDB.getConnection();
  });

  test('Updates member, family, household, and creates family_members correctly', async () => {
    //test data
    const id = 2;

    const mock_payload = {
      members: {
        last_name: 'Kobyla',
        first_name: 'Radzig',
      },

      families: {
        head_position: 'Father',
      },

      households: {
        condition_type: 'Needs minor repair',
        tct_no: 'tct-123',
      },

      family_members: [
        {
          family_id: 1,
          update: true,
          last_name: 'Takanashi',
          first_name: 'Hoshino',
          middle_name: 'Abydos',
          birth_date: '2008-01-02',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
        {
          family_id: 1,
          update: true,
          last_name: 'Okusora',
          first_name: 'Ayane',
          middle_name: 'Abydos',
          birth_date: '2010-11-12',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
      ],
    };

    //mock database functions
    mockConnection.query.mockResolvedValueOnce([
      [{ family_id: 1, household_id: 2 }],
    ]);

    //run function
    const result = await MembersService.updateMemberInfo(id, mock_payload);

    //expect function to run properly
    expect(mockConnection.beginTransaction).toHaveBeenCalledWith();

    expect(mockConnection.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `last_name` = ?, `first_name` = ? WHERE id = ?',
      ['Kobyla', 'Radzig', 2]
    ); //checks if execute in updateMembersMultiple runs correctly

    expect(FamilyService.updateFamiliesMultiple).toBeCalledWith(
      1,
      mock_payload.families,
      mockConnection
    );

    expect(HouseholdService.updateHouseholdMultiple).toBeCalledWith(
      2,
      mock_payload.households,
      mockConnection
    );

    const { update, ...cleanedFamilyMember } = mock_payload.family_members[0]; //removes the update column
    const { update: _, ...cleanedFamilyMember2 } =
      mock_payload.family_members[1];

    expect(FamilyMemberService.createFamilyMember).toHaveBeenNthCalledWith(
      1,
      { ...cleanedFamilyMember, family_id: 1, member_id: id },
      mockConnection
    );

    expect(FamilyMemberService.createFamilyMember).toHaveBeenNthCalledWith(
      2,
      { ...cleanedFamilyMember2, family_id: 1, member_id: id },
      mockConnection
    );

    expect(mockConnection.commit).toBeCalled();
    expect(result).toEqual({ success: true });
  });

  test('Deletes a family member when update is false and existing member id exist', async () => {
    const id = 2;
    const mock_payload = {
      family_members: [
        {
          id: 1,
          family_id: 1,
          update: false,
          last_name: 'Takanashi',
          first_name: 'Hoshino',
          middle_name: 'Abydos',
          birth_date: '2008-01-02',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
      ],
    };

    mockConnection.query.mockResolvedValueOnce([
      [{ family_id: 1, household_id: 2 }],
    ]);

    const result = await MembersService.updateMemberInfo(id, mock_payload);

    expect(FamilyMemberService.createFamilyMember).not.toHaveBeenCalled();
    expect(FamilyMemberService.deleteFamilyMembers).toHaveBeenCalledWith(
      1,
      mockConnection
    );
    expect(result).toEqual({ success: true });
  });

  test('Updates a family member when id is present and has fields to update', async () => {
    const id = 2;
    const mock_payload = {
      family_members: [
        {
          id: 1,
          family_id: 1,
          update: true,
          last_name: 'Takanashi',
          first_name: 'Hoshino',
          middle_name: 'Abydos',
          birth_date: '2008-01-02',
          gender: 'F',
          relation_to_member: 'Sister',
          member_id: 2,
          educational_attainment: 'Highschool',
        },
      ],
    };

    mockConnection.query.mockResolvedValueOnce([
      [{ family_id: 1, household_id: 2 }],
    ]);

    const result = await MembersService.updateMemberInfo(id, mock_payload);

    expect(FamilyMemberService.updateFamilyMemberMultiple).toHaveBeenCalledWith(
      1,
      {
        family_id: 1,
        last_name: 'Takanashi',
        first_name: 'Hoshino',
        middle_name: 'Abydos',
        birth_date: '2008-01-02',
        gender: 'F',
        relation_to_member: 'Sister',
        member_id: 2,
        educational_attainment: 'Highschool',
      },
      mockConnection
    );

    expect(result).toEqual({ success: true });
  });

  test('Rolls back transaction if error occurs', async () => {
    const id = 2;
    const mock_payload = {
      members: { first_name: 'ErrorTest' },
    };

    mockConnection.query.mockResolvedValueOnce([
      [{ family_id: 1, household_id: 2 }],
    ]);
    mockConnection.execute.mockRejectedValueOnce(new Error('Simulated error')); //mock fail at updateMemberMultiple

    await expect(
      MembersService.updateMemberInfo(id, mock_payload)
    ).rejects.toThrow('Simulated error');

    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });

  test('Returns null if member not found in SELECT query', async () => {
    const id = 999;
    const mock_payload = {
      members: { first_name: 'Ghost' },
    };

    mockConnection.query.mockResolvedValueOnce([[]]);

    const result = await MembersService.updateMemberInfo(id, mock_payload);

    expect(result).toBeNull();
    expect(mockConnection.release).toHaveBeenCalled();
    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
  });
});

describe('Testing getMembersHomeByName() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Returns records of member`s home with given name', async () => {
    const name = 'Radzig';

    const mock_member = [
      {
        member_id: 1,
        fullname: 'Radzig, Kobyla',
        head_position: 'Father',
        block_no: 'blk-123',
        lot_no: 'lt-123',
        tct_no: 'tct-123',
      },
    ];

    mockDB.query.mockResolvedValueOnce([mock_member]);

    const result = await MembersService.getMembersHomeByName(name);

    expect(mockDB.query).toBeCalledWith(
      `
    SELECT 
      m.id AS member_id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullname,
      f.head_position,
      h.block_no,
      h.lot_no,
      h.tct_no
    FROM members m
    JOIN families f ON m.family_id = f.id
    JOIN households h ON f.household_id = h.id
    WHERE CONCAT(m.first_name, ' ', m.last_name) LIKE ?;
  `,
      ['%Radzig%']
    );

    expect(result).toEqual(mock_member);
  });

  test('Return nothing when record is not found', async () => {
    const name = 'Radzig';

    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await MembersService.getMembersHomeByName(name);

    expect(mockDB.query).toBeCalledWith(
      `
    SELECT 
      m.id AS member_id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullname,
      f.head_position,
      h.block_no,
      h.lot_no,
      h.tct_no
    FROM members m
    JOIN families f ON m.family_id = f.id
    JOIN households h ON f.household_id = h.id
    WHERE CONCAT(m.first_name, ' ', m.last_name) LIKE ?;
  `,
      ['%Radzig%']
    );

    expect(result).toEqual([]);
  });
});

describe('testing createMembers() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Inserts Member record in database and returns that record that was inserted', async () => {
    //test data of function argument
    const data = {
      last_name: 'Van der Linde',
      first_name: 'Dutch',
      middle_name: 'Gang',
      birth_date: '1870-12-21',
      confirmity_signature: 'sign4.png',
      remarks: 'WE NEED THE MONEY FOR TAHITI',
      family_id: 4,
      contact_number: '09670871244',
      gender: 'Female',
    };

    //mock database functions
    const fakeInsertID = 4;
    mockDB.execute.mockResolvedValueOnce([{ insertId: fakeInsertID }]);

    //run actual function
    const result = await MembersService.createMembers(data);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'INSERT INTO kabuhayan_db.members (`last_name`, `first_name`, `middle_name`, `birth_date`, `confirmity_signature`, `remarks`, `family_id`, `contact_number`, `gender`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      expect.any(Array)
    );

    const [calledQuery, calledValues] = mockDB.execute.mock.calls[0];

    expect(calledValues[0]).toBe('Van der Linde');
    expect(calledValues[1]).toBe('Dutch');
    expect(calledValues[2]).toBe('Gang');
    expect(calledValues[3]).toBeInstanceOf(Date);
    expect(calledValues[4]).toBe('sign4.png');
    expect(calledValues[5]).toBe('WE NEED THE MONEY FOR TAHITI');
    expect(calledValues[6]).toBe(4);

    expect(result).toEqual({
      id: fakeInsertID,
      last_name: 'Van der Linde',
      first_name: 'Dutch',
      middle_name: 'Gang',
      birth_date: '1870-12-21',
      confirmity_signature: 'sign4.png',
      remarks: 'WE NEED THE MONEY FOR TAHITI',
      family_id: 4,
      contact_number: '09670871244',
      gender: 'Female',
    });
  });
});

describe('Testing updateMembers() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Update Member record`s column and return the affected row if you try to update only 1 column', async () => {
    //test data of function argument
    const id = 3;
    const updates = { remarks: 'Im Scared...' };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await MembersService.updateMembers(id, updates);

    //expect actual function logic to be correct
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `remarks` = ? WHERE id = ?',
      ['Im Scared...', 3]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Updates birth_date column when specified in updates and returns number of affectedRows', async () => {
    //test data of function argument
    const id = 2;
    const updates = { birth_date: '2008-06-07' };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await MembersService.updateMembers(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `birth_date` = ? WHERE id = ?',
      [new Date('2008-06-07'), 2]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Updates birth_date column when specified but with invalid date format', async () => {
    //test data of function argument
    const id = 2;
    const updates = { birth_date: 'invalid-date' };

    //mock database functions
    //mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

    //Expect function to run properly
    await expect(MembersService.updateMembers(id, updates)).rejects.toThrow(
      `Invalid date format for birth_date: invalid`
    );
  });

  test('Updates birth_date column when specified but with invalid type', async () => {
    //test data of function argument
    const id = 2;
    const updates = { birth_date: 20080607 };

    //mock database functions
    //mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

    //Expect function to run properly
    await expect(MembersService.updateMembers(id, updates)).rejects.toThrow(
      `Invalid type for birth_date`
    );
  });

  test('Updates birth_date column when specified but with null type', async () => {
    //test data of function argument
    const id = 2;
    const updates = { birth_date: null };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //Expect function to run properly
    const result = await MembersService.updateMembers(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `birth_date` = ? WHERE id = ?',
      [null, 2]
    );
    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 2;
    const updates = {
      last_name: 'De Santa',
      confirmity_signature: 'sign6.png',
    };

    //run actual function //expect actual function logic to be correct
    await expect(MembersService.updateMembers(id, updates)).rejects.toThrow(
      'Only one valid column can be updated at a time.'
    );
  });

  test('Throws error if you try to update 2 or more columns', async () => {
    //test data of function argument
    const id = 3;
    const updates = { Quote: 'Im dying sister' };

    //run actual function //expect actual function logic to be correct
    await expect(MembersService.updateMembers(id, updates)).rejects.toThrow(
      'Only one valid column can be updated at a time.'
    );
  });
});

describe('Testing updateMemberMultiple() functionalities', async () => {
  let mockDB;
  let mockConn;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
    mockConn = mockDB;
  });

  test('Updates multiple columns and returns the number of affected rows', async () => {
    //test data
    const id = 3;
    const updates = {
      last_name: 'Cena',
      first_name: 'John',
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //Run actual function

    const result = await MembersService.updateMemberMultiple(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `last_name` = ?, `first_name` = ? WHERE id = ?',
      ['Cena', 'John', 3]
    );
    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Updates birth_date column when specified in updates and returns number of affectedRows', async () => {
    //test data of function argument
    const id = 3;
    const updates = {
      last_name: 'Cena',
      first_name: 'John',
      birth_date: '2008-06-07',
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await MembersService.updateMemberMultiple(id, updates);

    //Expect function to run properly
    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `last_name` = ?, `first_name` = ?, `birth_date` = ? WHERE id = ?',
      ['Cena', 'John', new Date('2008-06-07'), 3]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Updates birth_date column when specified but with invalid date format', async () => {
    //test data of function argument
    const id = 3;
    const updates = {
      last_name: 'Cena',
      first_name: 'John',
      birth_date: 'invalid-date',
    };

    //run actual function //expect actual function logic to be correct
    await expect(
      MembersService.updateMemberMultiple(id, updates)
    ).rejects.toThrow(
      `Invalid date format for birth_date: "invalid-date". Expected a valid date string (e.g., "YYYY-MM-DD") or a Date object.`
    );
  });

  test('Updates birth_date column when specified but with invalid type', async () => {
    //test data of function argument
    const id = 3;
    const updates = {
      last_name: 'Cena',
      first_name: 'John',
      birth_date: 20080607,
    };

    //run actual function //expect actual function logic to be correct
    await expect(
      MembersService.updateMemberMultiple(id, updates)
    ).rejects.toThrow(`Invalid type for birth_date`);
  });

  test('Updates birth_date column when specified but with null type', async () => {
    //test data of function argument
    const id = 3;
    const updates = {
      last_name: 'Cena',
      first_name: 'John',
      birth_date: null,
    };

    //mock database functions
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //run actual function
    const result = await MembersService.updateMemberMultiple(id, updates);

    expect(mockDB.execute).toHaveBeenCalledWith(
      'UPDATE kabuhayan_db.members SET `last_name` = ?, `first_name` = ?, `birth_date` = ? WHERE id = ?',
      ['Cena', 'John', null, 3]
    );

    expect(result).toEqual({ affectedRows: 1 });
  });

  test('Throw error for updating unauthorized column', async () => {
    //test data
    const id = 3;
    const updates = {
      last_name: 'Cena',
      first_name: 'John',
      isAdmin: 'Yes',
    };

    await expect(
      MembersService.updateMemberMultiple(id, updates)
    ).rejects.toThrow(`Attempted to update an unauthorized column: isAdmin`);
  });

  test('Throw error for trying to update no columns', async () => {
    //test data
    const id = 4;
    const updates = {};

    //Run the function
    await expect(
      MembersService.updateMemberMultiple(id, updates)
    ).rejects.toThrow(`No valid columns provided for update.`);
  });
});

describe('Testing deleteMembers() functionalities', () => {
  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDB = await getDB();
  });

  test('Deletes a Member record its Household, family, family_member, and families records and returns affectedRows to be 5', async () => {
    //test data
    const id = 3;

    //mock database functions //mock the query inside getMembersbyId()
    mockDB.query.mockResolvedValueOnce([
      [
        {
          id: 2,
          last_name: 'Morgan',
          first_name: 'Arthur',
          middle_name: 'Van Der Linde',
          birth_date: '1880-06-02',
          confirmity_signature: 'sign3.png',
          remarks: 'You are a good man',
          family_id: 3,
        },
      ],
    ]);

    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //first delete query
    mockDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); //2nd delete query

    FamilyService.getFamilyById.mockResolvedValueOnce({
      id: 2,
      head_position: 'Uncle',
      land_acquisition: 'Expropriation',
      status_of_occupancy: 'Renter',
      household_id: 4,
    });

    HouseholdService.deleteHousehold.mockResolvedValueOnce(1);

    //Run function
    const result = await MembersService.deleteMembers(id);

    //expect function to run properly
    expect(FamilyService.getFamilyById).toHaveBeenCalledWith(3);
    expect(HouseholdService.deleteHousehold).toHaveBeenCalledWith(4);

    expect(mockDB.execute).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM kabuhayan_db.credentials WHERE id = ?',
      [2]
    );

    expect(mockDB.execute).toHaveBeenNthCalledWith(
      2,
      'DELETE FROM kabuhayan_db.members WHERE id = ?',
      [3]
    );

    expect(result).toEqual(2);
  });
});
