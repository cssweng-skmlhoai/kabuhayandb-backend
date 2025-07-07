CREATE DATABASE IF NOT EXISTS `kabuhayan_db`;
USE kabuhayan_db;

DROP TABLE IF EXISTS `kabuhayan_db`.`credentials`;
DROP TABLE IF EXISTS `kabuhayan_db`.`family_members`;
DROP TABLE IF EXISTS `kabuhayan_db`.`members`;
DROP TABLE IF EXISTS `kabuhayan_db`.`dues`;
DROP TABLE IF EXISTS `kabuhayan_db`.`families`;
DROP TABLE IF EXISTS `kabuhayan_db`.`households`;

CREATE TABLE `kabuhayan_db`.`households` (
  `id` INT NOT NULL AUTO_INCREMENT,
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
  `area` MEDIUMBLOB,
  `open_space_share` TEXT NOT NULL,
  `Meralco` BOOLEAN NOT NULL,
  `Maynilad` BOOLEAN NOT NULL,
  `Septic_Tank` BOOLEAN NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`families` (
  `id` INT NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  FOREIGN KEY (`household_id`) REFERENCES `households` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`members` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `last_name` VARCHAR(80) NOT NULL,
  `first_name` VARCHAR(80) NOT NULL,
  `middle_name` VARCHAR(80) NOT NULL,
  `birth_date` DATE NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM (
    'Male',
    'Female',
    'Other'
  ),
  `contact_number` VARCHAR(30) NOT NULL,
  `confirmity_signature` MEDIUMBLOB, -- CAN BE NULL MUNA PARA WE CAN WORK WITH IT --
  `remarks` TEXT NOT NULL,
  `family_id` INT NOT NULL, -- Each member here is automatically the head --
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`family_members` (
  `id` INT NOT NULL AUTO_INCREMENT,
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
  `relation_to_member` VARCHAR(10) NOT NULL,
  `member_id` INT NOT NULL, -- head --
  `educational_attainment` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`dues` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `due_date` TIMESTAMP NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('Paid', 'Unpaid') NOT NULL,
  `due_type` ENUM(
    'Monthly Amortization', 
    'Monthly Dues', 
    'Taxes', 
    'Penalties', 
    'Others'
  ) NOT NULL,
  `receipt_number` VARCHAR(50),
  `household_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kabuhayan_db`.`credentials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `member_id` INT NOT NULL,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `is_admin` TINYINT(1),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;