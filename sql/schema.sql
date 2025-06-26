CREATE DATABASE IF NOT EXISTS `kabuhayan_db`;
USE kabuhayan_db;

DROP TABLE IF EXISTS `kabuhayan_db`.`credentials`;
DROP TABLE IF EXISTS `kabuhayan_db`.`dues`;
DROP TABLE IF EXISTS `kabuhayan_db`.`households`;
DROP TABLE IF EXISTS `kabuhayan_db`.`members`;
DROP TABLE IF EXISTS `kabuhayan_db`.`families`;
DROP TABLE IF EXISTS `kabuhayan_db`.`family_members`;

CREATE TABLE `kabuhayan_db`.`dues` (
  `dues_id` INT NOT NULL AUTO_INCREMENT,
  `due_date` TIMESTAMP NOT NULL,
  `amount` FLOAT NOT NULL,
  `status` ENUM('Paid', 'Unpaid') NOT NULL,
  `due_type` ENUM(
    'Monthly Amortization', 
    'Monthly Dues', 
    'Taxes', 
    'Penalties', 
    'Others'
  ) NOT NULL,
  `receipt_number` VARCHAR(50),
  PRIMARY KEY (`dues_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`households` (
  `household_id` INT NOT NULL,
  `condition_type` ENUM (
    'Needs minor repair',        
    'Needs major repair',        
    'Dilapidated/Condemned',     
    'Under renovation/Being repaired', 
    'Unfinished construction',   
    'Under construction') NOT NULL,
  `tct_no` VARCHAR(80) NOT NULL,
  `block_no` VARCHAR(80) NOT NULL,
  `lot_no` INT NOT NULL,
  `area` MEDIUMBLOB NOT NULL,
  `open_space_share` TEXT NOT NULL,
  `Meralco` BOOLEAN NOT NULL,
  `Maynilad` BOOLEAN NOT NULL,
  `Septic_Tank` BOOLEAN NOT NULL,
  `dues_id` INT NOT NULL,
  PRIMARY KEY (`household_id`),
  FOREIGN KEY (`dues_id`) REFERENCES `dues` (`dues_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`members` (
  `member_id` INT NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `first_name` VARCHAR(80) NOT NULL,
  `middle_name` VARCHAR(80) NOT NULL,
  `birth_date` DATE NOT NULL,
  `confirmity_signature` MEDIUMBLOB NOT NULL,
  `remarks` TEXT NOT NULL,
  `family_id` INT NOT NULL,
  PRIMARY KEY (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`families` (
  `family_id` INT NOT NULL AUTO_INCREMENT,
  `family_head_id` INT NOT NULL,
  `head_position` VARCHAR(80) NOT NULL,
  `land_acquisition` ENUM(
    'CMP',
    'Direct Buying',
    'On Process',
    'Auction',
    'Organized Community',
    'Expropriation'
  ) NOT NULL,
  `status_of_occupancy` ENUM (
   'Owner',
   'Sharer',
   'Renter') NOT NULL,
  `household_id` INT NOT NULL,
  PRIMARY KEY (`family_id`),
  FOREIGN KEY (`family_head_id`) REFERENCES `members` (`member_id`),
  FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`family_members` (
  `family_member_id` INT NOT NULL,
  `family_id` INT NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `first_name` VARCHAR(80) NOT NULL,
  `middle_name` VARCHAR(80) NOT NULL,
  `birth_date` DATE NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM (
   'Male',
   'Female',
   'Prefer not to say') NOT NULL,
  `relation_to_family` VARCHAR(10) NOT NULL,
  `member_id` INT NOT NULL,
  PRIMARY KEY (`family_member_id`),
  FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`),
  FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`credentials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `member_id` INT NOT NULL,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `members` 
  ADD FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`);
