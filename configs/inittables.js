const db = require("../services/db");

const schema = `
DROP TABLE IF EXISTS UserShopItems;
DROP TABLE IF EXISTS UserBadge;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS Report;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Badge;
DROP TABLE IF EXISTS Vulnerability;
DROP TABLE IF EXISTS ShopItems;
DROP TABLE IF EXISTS ranks;

-- -----------------------------
-- RANKS TABLE
-- -----------------------------
CREATE TABLE ranks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  points_needed INT NOT NULL
);

INSERT INTO ranks (id, name, points_needed) VALUES
(1, 'Bronze', 0),
(2, 'Silver', 101),
(3, 'Gold', 301),
(4, 'Expert', 601),
(5, 'Legend', 1000),
(6, 'Master', 1500),
(7, 'Grandmaster', 2000)
ON DUPLICATE KEY UPDATE name=VALUES(name), points_needed=VALUES(points_needed);

-- -----------------------------
-- SHOP ITEMS TABLE
-- -----------------------------
CREATE TABLE ShopItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('hat', 'cape', 'gloves', 'mask', 'boots', 'mystery') NOT NULL,
  asset_url VARCHAR(255) NULL,
  cost INT NOT NULL
);

INSERT INTO ShopItems (id, name, type, cost) VALUES
(1, 'Golden Crown', 'hat', 1200),
(2, 'Cyber Helmet', 'hat', 180),
(3, 'Wizard Hat', 'hat', 130),
(4, 'Samurai Headband', 'hat', 160),
(5, 'Phantom Cape', 'cape', 220),
(6, 'Inferno Cloak', 'cape', 200),
(7, 'Frost Cape', 'cape', 170),
(8, 'Royal Blue Cape', 'cape', 1200),
(9, 'Shadow Gloves', 'gloves', 120),
(10, 'Fire Gauntlets', 'gloves', 140),
(11, 'Diamond Knuckles', 'gloves', 1200),
(12, 'Silken Gloves', 'gloves', 100),
(13, 'Vigilante Mask', 'mask', 110),
(14, 'Gas Mask', 'mask', 130),
(15, 'Ninja Mask', 'mask', 160),
(16, 'Golden Skull Mask', 'mask', 1200),
(17, 'Speed Boots', 'boots', 120),
(18, 'Shadow Walkers', 'boots', 1200),
(19, 'Iron Stompers', 'boots', 150),
(20, 'Lava Boots', 'boots', 200),
(21, 'Mystery Quiz Item Box', 'mystery', 300)
ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), cost=VALUES(cost);

-- -----------------------------
-- VULNERABILITY TABLE
-- -----------------------------
CREATE TABLE Vulnerability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL
);

INSERT INTO Vulnerability (id, type, description, points) VALUES
(1, 'XSS', 'The search bar is vulnerable to Cross-Site Scripting.', 75),
(2, 'SQL Injection', 'Injection of malicious SQL code via input fields to access or manipulate the database.', 60),
(3, 'Cross Site Request Forgery', 'Tricking a user into performing unwanted actions while logged in to a web app.', 50),
(4, 'Security Misconfigurations', 'Exposing sensitive information or leaving default settings enabled on the server.', 50),
(5, 'File Upload Vulnerability', 'Uploading dangerous files like scripts due to poor validation on file types or contents.', 45),
(6, 'General Bugs', 'Flaw in the application’s behavior, design, or functionality that affects user experience or system stability but may not pose a direct security threat.', 20)
ON DUPLICATE KEY UPDATE type=VALUES(type), description=VALUES(description), points=VALUES(points);

-- -----------------------------
-- BADGE TABLE
-- -----------------------------
CREATE TABLE Badge (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  vulnerability_id INT
);

INSERT INTO Badge (id, name, vulnerability_id) VALUES
(1, 'XSS Expert', 1),
(2, 'SQL Injection Master', 2),
(3, 'CSRF Slasher', 3),
(4, 'Misconfiguration Sniffer', 4),
(5, 'File Upload Pro', 5),
(6, 'General Handyman', 6)
ON DUPLICATE KEY UPDATE name=VALUES(name), vulnerability_id=VALUES(vulnerability_id);

-- -----------------------------
-- USER TABLE (Updated for CA2 with email and password)
-- -----------------------------
CREATE TABLE User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  reputation INT DEFAULT 0,
  rank_id INT DEFAULT 1
);

INSERT INTO User (id, username, email, password, reputation, rank_id) VALUES
(1, 'testuser1', 'test1@example.com', '$2a$10$NLTZlKh/o2NHFz0iyo3vC.JzOshLKD9mpSAwKJoq1di21S8vkXE.e', 500, 1),
(2, 'testuser2', 'test2@example.com', '$2a$10$NLTZlKh/o2NHFz0iyo3vC.JzOshLKD9mpSAwKJoq1di21S8vkXE.e', 500, 2)
ON DUPLICATE KEY UPDATE username=VALUES(username), email=VALUES(email), reputation=VALUES(reputation), rank_id=VALUES(rank_id);

-- -----------------------------
-- REPORT TABLE
-- -----------------------------
CREATE TABLE IF NOT EXISTS Report (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  vulnerability_id INT,
  status BOOLEAN NOT NULL DEFAULT 0,
  closer_id INT NULL,
  closed_at DATETIME NULL,
  CHECK (status IN (0,1))
);

-- -----------------------------
-- USER BADGE TABLE
-- -----------------------------
CREATE TABLE UserBadge (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  badge_id INT,
  awarded_at DATETIME
);

-- -----------------------------
-- USER SHOP ITEMS TABLE
-- -----------------------------
CREATE TABLE UserShopItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  shop_item_id INT,
  equipped BOOLEAN DEFAULT FALSE
);

-- -----------------------------
-- REVIEWS TABLE (CA2 Feature)
-- -----------------------------
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Add sample reviews
INSERT INTO reviews (user_id, rating, comment) VALUES
(1, 5, 'Amazing platform! Love the gamification features and the ranking system.'),
(2, 4, 'Great bug bounty system. The shop items are really cool and motivating.')
ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment);
`;

db.query(schema, (err, results) => {
  if (err) {
    console.error("❌ Error initializing tables:", err);
    process.exit(1);
  }
  console.log("✅ All tables created and seeded successfully.");
  process.exit(0);
});
