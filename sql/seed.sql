-- Sample Entries --


-- Household Entries --
INSERT INTO `households` (`id`, `condition_type`, `tct_no`, `block_no`, `lot_no`, `area`, `open_space_share`, `Meralco`, `Maynilad`, `Septic_Tank`) VALUES
(1, 'Needs minor repair', 'TCT123456', 'Block 1', 101, NULL, 'Shared access to park', TRUE, TRUE, FALSE),
(2, 'Under construction', 'TCT654321', 'Block 2', 102, NULL, 'None', TRUE, TRUE, FALSE),
(3, 'Dilapidated/Condemned', 'TCT287391', 'Block 3', 102, NULL, 'Shared access to park', FALSE, FALSE, TRUE),
(4, 'Under construction', 'TCT092638', 'Block 4', 103, NULL, 'None', FALSE, FALSE, FALSE),
(5, 'Unfinished construction', 'TCT123455', 'Block 5', 101, NULL, 'Shared access to park', TRUE, TRUE, TRUE),
(6, 'Under construction', 'TCT837492', 'Block 5', 101, NULL, 'None', FALSE, FALSE, TRUE),
(7, 'Dilapidated/Condemned', 'TCT098765', 'Block 2', 103, NULL, 'Shared access to park', FALSE, FALSE, TRUE),
(8, 'Under construction', 'TCT634829', 'Block 1', 102, NULL, 'None', TRUE, TRUE, TRUE),
(9, 'Needs major repair', 'TCT928374', 'Block 2', 102, NULL, 'Shared access to park', TRUE, TRUE, TRUE),
(10, 'Under construction', 'TCT674938', 'Block 2', 102, NULL, 'None', TRUE, TRUE, TRUE);

-- Family Entries --
INSERT INTO `families` (`id`, `head_position`, `land_acquisition`, `status_of_occupancy`, `household_id`) VALUES
(1, 'Father', 'CMP', 'Owner', 1),
(2, 'Mother', 'Direct Buying', 'Renter', 2),
(3, 'Grandfather', 'On Process', 'Sharer', 3),
(4, 'Aunt', 'Auction', 'Owner', 4),
(5, 'Uncle', 'Organized Community', 'Renter', 5),
(6, 'Sister', 'Expropriation', 'Owner', 6),
(7, 'Brother', 'CMP', 'Sharer', 7),
(8, 'Father', 'Direct Buying', 'Owner', 8),
(9, 'Mother', 'Organized Community', 'Sharer', 9),
(10, 'Grandmother', 'On Process', 'Renter', 10);

-- Member Entries --
INSERT INTO `members` (`id`, `last_name`, `first_name`, `middle_name`, `birth_date`, `age`, `gender`, `contact_number`, `confirmity_signature`, `remarks`, `family_id`)
VALUES
(1, 'Dela Cruz', 'Pau', 'Grace', '2005-10-14', 19, 'Female', '09174678392', NULL, 'N/A', 1),
(2, 'Reyes', 'Maria', 'Lopez', '1995-05-22', 30, 'Female', '09281234567', NULL, 'N/A', 2),
(3, 'Santos', 'Alex', 'Garcia', '2000-08-30', 24, 'Other', '09175551234', NULL, 'Vegetarian', 3),
(4, 'Gomez', 'Ana', 'Torres', '1987-12-10', 37, 'Female', '09081237654', NULL, 'N/A', 4),
(5, 'Cruz', 'Mark', 'David', '1975-03-05', 50, 'Male', '09172345678', NULL, 'Senior citizen', 5),
(6, 'Villanueva', 'Paolo', 'Fernandez', '2010-07-01', 15, 'Male', '09981237890', NULL, 'Student', 6),
(7, 'Tan', 'Elaine', 'Uy', '1999-11-11', 25, 'Female', '09391234567', NULL, 'N/A', 7),
(8, 'Lim', 'Carlo', 'Chan', '1985-09-25', 39, 'Male', '09181239876', NULL, 'N/A', 8),
(9, 'Rivera', 'Jasmine', 'Reyes', '2003-06-18', 22, 'Female', '09231238765', NULL, 'N/A', 9),
(10, 'Navarro', 'Taylor', 'Lee', '1990-02-14', 35, 'Other', '09999887766', NULL, 'N/A', 10);

-- Family Member Entries --
INSERT INTO `family_members` (`id`, `family_id`, `last_name`, `first_name`, `middle_name`, `birth_date`, `age`, `gender`, `relation_to_member`, `member_id`, `educational_attainment`)
VALUES
(1, 1, 'Dela Cruz', 'Juan', 'Santos', '1980-01-15', 44, 'Male', 'Father', 1, 'College Graduate'),
(2, 2, 'Reyes', 'Maria', 'Lopez', '1985-05-10', 39, 'Female', 'Mother', 2, 'High School Graduate'),
(3, 1, 'Gomez', 'Carlos', 'Reyes', '1990-07-20', 33, 'Male', 'Uncle', 1, 'Vocational Graduate'),
(4, 3, 'Santos', 'Ana', 'Delos', '2000-03-15', 25, 'Female', 'Sister', 3, 'College Level'),
(5, 4, 'Lopez', 'Miguel', 'Cruz', '1995-11-05', 29, 'Male', 'Brother', 4, 'College Graduate'),
(6, 5, 'Torres', 'Elena', 'Gomez', '1978-08-18', 46, 'Female', 'Mother', 5, 'Elementary Graduate'),
(7, 6, 'Rivera', 'Leo', 'Mendez', '1965-02-28', 59, 'Male', 'Father', 6, 'High School Graduate'),
(8, 7, 'Navarro', 'Isabel', 'Fernandez', '2003-10-10', 21, 'Female', 'Sister', 7, 'Senior High Graduate'),
(9, 8, 'Castillo', 'Tomas', 'Reyes', '1970-09-09', 54, 'Male', 'Father', 8, 'College Graduate'),
(10, 9, 'Ramos', 'Grace', 'Torralba', '1988-04-22', 36, 'Female', 'Mother', 9, 'College Graduate');

-- Due Entries --
INSERT INTO `dues` (`id`, `due_date`, `amount`, `status`, `due_type`, `receipt_number`, `household_id`) VALUES
(1, '2025-01-15 08:30:00', 1200.50, 'Paid', 'Monthly Amortization', 'R123', 1),
(2, '2025-02-01 09:00:00', 800.00, 'Unpaid', 'Monthly Dues', 'R246', 2),
(3, '2025-03-10 14:15:00', 450.75, 'Paid', 'Taxes', 'R124', 8),
(4, '2025-04-05 11:30:00', 300.00, 'Unpaid', 'Penalties', 'R235', 1),
(5, '2025-05-20 17:45:00', 1000.00, 'Paid', 'Monthly Amortization', 'R125', 6),
(6, '2025-06-01 08:00:00', 850.25, 'Unpaid', 'Monthly Dues', 'R326', 4),
(7, '2025-07-07 10:30:00', 600.00, 'Paid', 'Others', 'R126', 5),
(8, '2025-08-12 13:20:00', 1500.00, 'Unpaid', 'Taxes', 'R456', 3),
(9, '2025-09-30 15:00:00', 1250.50, 'Paid', 'Monthly Amortization', 'R127', 4),
(10, '2025-10-25 19:10:00', 500.00, 'Unpaid', 'Penalties', 'R999', 10);

INSERT INTO `credentials` (`member_id`, `username`, `password`, `is_admin`) VALUES
(1, 'juan.dc', 'password123', 0),
(2, 'maria.reyes', 'maria2024', 0),
(3, 'carlos.gomez', 'gomezPass!', 0),
(4, 'ana.santos', 'anaStrong1', 0),
(5, 'miguel.lopez', 'lopezSecure', 0),
(6, 'elena.torres', 'elenaKey', 0),
(7, 'leo.rivera', 'riveraLock', 1),
(8, 'isabel.navarro', 'isabel321', 0),
(9, 'tomas.castillo', 'castillo@pw', 0),
(10, 'grace.ramos', 'graceSafe', 1);