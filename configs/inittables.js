const pool = require("../services/db");

const SQLSTATEMENT = `
DROP TABLE IF EXISTS User;

DROP TABLE IF EXISTS Vulnerability;

DROP TABLE IF EXISTS Report;

CREATE TABLE User (
id INT AUTO_INCREMENT PRIMARY KEY,
username TEXT NOT NULL,
reputation INT DEFAULT 0
);

CREATE TABLE Vulnerability (
id INT AUTO_INCREMENT PRIMARY KEY,
type TEXT NOT NULL,
description TEXT NOT NULL,
points INT NOT NULL
);

CREATE TABLE Report (
id INT AUTO_INCREMENT PRIMARY KEY,
User_id INT NOT NULL,
Vulnerability_id INT NOT NULL,
status BOOLEAN NOT NULL DEFAULT 0,

FOREIGN KEY (User_id) REFERENCES User(id) ON DELETE CASCADE,
FOREIGN KEY (Vulnerability_id) REFERENCES Vulnerability(id) ON DELETE CASCADE

);


INSERT INTO User (username, reputation) VALUES 
('Testuser1' , 7 )
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully:", results);
  }
  process.exit();
});
