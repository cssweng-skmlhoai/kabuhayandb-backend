-- Sample Entries --

INSERT INTO `dues` (`Meralco`, `Maynilad`, `Septic_Tank`) VALUES
(1200.50, 850.75, 300.00),
(1300.00, 900.00, 350.00);

INSERT INTO `households` (`household_id`, `condition_type`, `tct_no`, `block_no`, `lot_no`, `area`, `open_space_share`, `dues_id`) VALUES
(1, 'Needs minor repair', 'TCT123456', 'Block 5', 101, LOAD_FILE('/path/to/sample_area1.png'), 'Shared access to park', 1),
(2, 'Under construction', 'TCT654321', 'Block 3', 102, LOAD_FILE('/path/to/sample_area2.png'), 'None', 2);

INSERT INTO `members` (`member_id`, `last_name`, `first_name`, `middle_name`, `birth_date`, `confirmity_signature`, `remarks`, `family_id`)
VALUES
(1, 'Dela Cruz', 'Juan', 'Santos', '1980-01-15', LOAD_FILE('/path/to/signature1.png'), 'N/A', 0),
(2, 'Reyes', 'Maria', 'Lopez', '1985-05-10', LOAD_FILE('/path/to/signature2.png'), 'Active participant', 0),
(3, 'Gomez', 'Carlos', 'Reyes', '1990-07-20', LOAD_FILE('/path/to/signature3.png'), 'Newly registered', 0);
UPDATE `members` SET `family_id` = 1 WHERE `member_id` = 1;
UPDATE `members` SET `family_id` = 2 WHERE `member_id` = 2;
UPDATE `members` SET `family_id` = 1 WHERE `member_id` = 3;

INSERT INTO `families` (`family_id`, `family_head_id`, `head_position`, `land_acquisition`, `status_of_occupancy`, `household_id`) VALUES
(1, 1, 'Father', 'CMP', 'Owner', 1),
(2, 2, 'Mother', 'Direct Buying', 'Renter', 2);

INSERT INTO `family_members` (`family_member_id`, `family_id`, `last_name`, `first_name`, `middle_name`, `birth_date`, `age`, `gender`, `relation_to_family`, `member_id`)
VALUES
(1, 1, 'Dela Cruz', 'Juan', 'Santos', '1980-01-15', 44, 'Male', 'Father', 1),
(2, 2, 'Reyes', 'Maria', 'Lopez', '1985-05-10', 39, 'Female', 'Mother', 2),
(3, 1, 'Gomez', 'Carlos', 'Reyes', '1990-07-20', 33, 'Male', 'Uncle', 3);