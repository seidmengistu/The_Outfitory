-- ===========================================
--  Database: outfitory
--  Schema: Outfitory Fashion Wardrobe
--  Author: Mattia
--  Description: Core database schema + sample data
-- ===========================================

CREATE DATABASE IF NOT EXISTS outfitory /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE outfitory;

SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
--  Table: Users
-- ===========================================
DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student','Fashion Enthusiast','Business Consultant','Development Team') DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Users (username, email, password_hash, role) VALUES
('mattia', 'mattia@example.com', 'hashed_password_123', 'Development Team'),
('giulia', 'giulia@example.com', 'hashed_password_abc', 'Fashion Enthusiast'),
('luca', 'luca@example.com', 'hashed_password_xyz', 'Student'),
('kevin', 'k.verdhi@studenti.unipi.it', '$2b$12$1o2juAtyuS0kv/wA3WwHMOogFhI8gShHRI6yG5aRxeEorAAm3xy.e', 'Development Team');

-- ===========================================
--  Table: Clothes
-- ===========================================
DROP TABLE IF EXISTS Clothes;

CREATE TABLE Clothes (
    cloth_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100),

    category VARCHAR(50),
    season VARCHAR(20),
    occasion VARCHAR(50),

    image_url TEXT,
    notes TEXT,

    pattern VARCHAR(50),
    primary_color VARCHAR(30),
    secondary_color VARCHAR(30),

    typeCloth VARCHAR(50),

    fit VARCHAR(50),        -- es: Regular, Oversized, Slim, Loose
    material VARCHAR(50),   -- es: Cotton, Wool, Denim, Polyester

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Clothes 
(user_id, name, category, season, occasion, image_url, notes, pattern, primary_color, secondary_color, typeCloth, fit, material)
VALUES
(1, 'White T-Shirt', 'Top', 'Summer', 'Casual', '/images/tshirt_white.jpg',
 'Basic cotton t-shirt', 'plain', 'white', NULL, 'tshirt', 'Regular', 'Cotton'),

(1, 'Blue Jeans', 'Pants', 'Autumn', 'Casual', '/images/jeans_blue.jpg',
 'Slim fit', 'plain', 'blue', NULL, 'jeans', 'Slim', 'Denim'),

(2, 'Red Dress', 'Dress', 'Spring', 'Formal', '/images/red_dress.jpg',
 'Ideal for evening events', 'plain', 'red', NULL, 'dress', 'Regular', 'Polyester'),

(3, 'Black Hoodie', 'Top', 'Winter', 'Casual', '/images/hoodie_black.jpg',
 'Soft fleece material', 'plain', 'black', NULL, 'hoodie', 'Oversized', 'Fleece');


-- ===========================================
--  Table: Outfits
-- ===========================================
DROP TABLE IF EXISTS Outfits;
CREATE TABLE Outfits (
    outfit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Outfits (user_id, name, description) VALUES
(1, 'Casual Day', 'A simple summer outfit with jeans and t-shirt.'),
(2, 'Elegant Night', 'Red dress with heels for formal events'),
(3, 'Comfy Winter', 'Warm hoodie with jeans');

-- ===========================================
--  Table: OutfitItems
-- ===========================================
DROP TABLE IF EXISTS OutfitItems;
CREATE TABLE OutfitItems (
    outfit_id INT NOT NULL,
    cloth_id INT NOT NULL,
    PRIMARY KEY (outfit_id, cloth_id),
    FOREIGN KEY (outfit_id) REFERENCES Outfits(outfit_id) ON DELETE CASCADE,
    FOREIGN KEY (cloth_id) REFERENCES Clothes(cloth_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO OutfitItems (outfit_id, cloth_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4);

-- ===========================================
--  Table: Calendar
-- ===========================================
DROP TABLE IF EXISTS Calendar;
CREATE TABLE Calendar (
    calendar_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    outfit_id INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (outfit_id) REFERENCES Outfits(outfit_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Calendar (user_id, outfit_id, date) VALUES
(1, 1, '2025-10-25'),
(2, 2, '2025-10-27'),
(3, 3, '2025-11-02');

-- ===========================================
--  Table: TravelList
-- ===========================================
DROP TABLE IF EXISTS TravelList;
CREATE TABLE TravelList (
    travel_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO TravelList (user_id, name, start_date, end_date) VALUES
(1, 'Paris Trip', '2025-12-20', '2025-12-27'),
(2, 'Milan Fashion Week', '2025-09-01', '2025-09-05');

-- ===========================================
--  Table: TravelItems
-- ===========================================
DROP TABLE IF EXISTS TravelItems;
CREATE TABLE TravelItems (
    travel_id INT NOT NULL,
    cloth_id INT NOT NULL,
    PRIMARY KEY (travel_id, cloth_id),
    FOREIGN KEY (travel_id) REFERENCES TravelList(travel_id) ON DELETE CASCADE,
    FOREIGN KEY (cloth_id) REFERENCES Clothes(cloth_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO TravelItems (travel_id, cloth_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- ===========================================
--  Table: Collections
-- ===========================================
DROP TABLE IF EXISTS Collections;
CREATE TABLE Collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Collections (user_id, name, description) VALUES
(1, 'Summer Essentials', 'Basic everyday outfits for warm weather'),
(2, 'Evening Wear', 'Formal dresses and accessories for events');

-- ===========================================
--  Table: CollectionOutfits
-- ===========================================
DROP TABLE IF EXISTS CollectionOutfits;
CREATE TABLE CollectionOutfits (
    collection_id INT NOT NULL,
    outfit_id INT NOT NULL,
    PRIMARY KEY (collection_id, outfit_id),
    FOREIGN KEY (collection_id) REFERENCES Collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (outfit_id) REFERENCES Outfits(outfit_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO CollectionOutfits (collection_id, outfit_id) VALUES
(1, 1),
(2, 2);

-- ===========================================
--  Table: Wishlist
-- ===========================================
DROP TABLE IF EXISTS Wishlist;
CREATE TABLE Wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cloth_name VARCHAR(100),
    estimated_price DECIMAL(8,2),
    link TEXT,
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Wishlist (user_id, cloth_name, estimated_price, link, priority) VALUES
(1, 'Leather Jacket', 149.99, 'https://example.com/jacket', 'High'),
(2, 'White Sneakers', 79.90, 'https://example.com/sneakers', 'Medium'),
(3, 'Denim Jacket', 99.50, 'https://example.com/denim', 'Low');

-- ===========================================
--  Finalize
-- ===========================================
SET FOREIGN_KEY_CHECKS = 1;
