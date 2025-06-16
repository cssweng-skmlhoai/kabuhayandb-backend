CREATE DATABASE IF NOT EXISTS `csswengDB`;
USE csswengDB;

DROP TABLE IF EXISTS `csswengDB`.`dues`;
DROP TABLE IF EXISTS `csswengDB`.`households`;
DROP TABLE IF EXISTS `csswengDB`.`members`;
DROP TABLE IF EXISTS `csswengDB`.`families`;
DROP TABLE IF EXISTS `csswengDB`.`family_members`;

CREATE TABLE `csswengDB`.`dues` (
  `dues_id` int NOT NULL AUTO_INCREMENT,
  `Meralco` decimal(10,2) NOT NULL,
  `Maynilad` decimal(10,2) NOT NULL,
  `Septic_Tank` decimal(10,2) NOT NULL,
  PRIMARY KEY (`dues_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `csswengDB`.`households` (
  `household_id` int NOT NULL,
  `condition_type` ENUM (
    'Needs minor repair',        
    'Needs major repair',        
    'Dilapidated/Condemned',     
    'Under renovation/Being repaired', 
    'Unfinished construction',   
    'Under construction') NOT NULL,
  `tct_no` varchar(80) NOT NULL,
  `block_no` varchar(80) NOT NULL,
  `lot_no` int NOT NULL,
  `area` mediumblob NOT NULL,
  `open_space_share` text NOT NULL,
  `dues_id` INT NOT NULL,
  PRIMARY KEY (`household_id`),
  FOREIGN KEY (`dues_id`) REFERENCES `dues` (`dues_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `csswengDB`.`members` (
  `member_id` int NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `first_name` varchar(80) NOT NULL,
  `middle_name` varchar(80) NOT NULL,
  `birth_date` date NOT NULL,
  `confirmity_signature` mediumblob NOT NULL,
  `remarks` text NOT NULL,
  `family_id` INT NOT NULL,
  PRIMARY KEY (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `csswengDB`.`families` (
  `family_id` int NOT NULL AUTO_INCREMENT,
  `family_head_id` int NOT NULL,
  `head_position` varchar(80) NOT NULL,
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
  `household_id` int NOT NULL,
  PRIMARY KEY (`family_id`),
  FOREIGN KEY (`family_head_id`) REFERENCES `members` (`member_id`),
  FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `csswengDB`.`family_members` (
  `family_member_id` int NOT NULL,
  `family_id` int NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `first_name` varchar(80) NOT NULL,
  `middle_name` varchar(80) NOT NULL,
  `birth_date` date NOT NULL,
  `age` int NOT NULL,
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

ALTER TABLE `members` ADD FOREIGN KEY (`family_id`) REFERENCES families(`family_id`)