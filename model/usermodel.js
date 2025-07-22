const pool = require('../services/db');

//INSERTING A SINGLE USER
module.exports.insertSingle = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO User (username, reputation)
    VALUES (?, ?);
  `;
  const VALUES = [data.username, data.reputation];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//INSERTING A SINGLE USER WITH EMAIL AND PASSWORD
module.exports.insertSingleWithAuth = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO User (username, email, password, reputation)
    VALUES (?, ?, ?, ?);
  `;
  const VALUES = [data.username, data.email, data.password, 0];

  pool.query(SQLSTATMENT, VALUES, callback);
};

//GET USER BY USERNAME FOR LOGIN
module.exports.getUserByUsername = (username, callback) => {
    const SQLSTATEMENT = `
        SELECT id, username, email, password, reputation, rank_id FROM User
        WHERE username = ?
    `;
    const VALUES = [username];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
//SELECTING ALL USERS
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User;`
    ;
    pool.query(SQLSTATEMENT, callback);
};
//Searching for duplicate username 
module.exports.duplicateUsername = (username, callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM User
        WHERE username = ?
    `;
    const VALUES = [username];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
// SEARCHING FOR PLAYER BY ID 
module.exports.searchUserById = (id, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User
    WHERE id = ?
    `;
    const VALUES = [id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// SEARCHING IF ID IS FOUND 
module.exports.checkForId = (id, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User
    WHERE id = ?
    `;
    const VALUES = [id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//UPDATING USER DETAILS 
module.exports.putById = (data,callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET username= ?, reputation= ?
     WHERE id = ?`;

     const VALUES = [data.username, data.reputation,data.id];

       pool.query(SQLSTATEMENT, VALUES, callback);  
}

//TAKING DETAILS FROM ID 
module.exports.detailsFromId = (id,callback) => {
    const SQLSTATEMENT = `
    SELECT id,username,reputation FROM User
    WHERE id = ?`;

    const VALUES = [id]

    pool.query(SQLSTATEMENT, VALUES, callback);


}
//GET USER DETAILS FROM ID
//Use u and r in place of user and rank
//use a left join to ensure all users a returned, even if they have no rank assigned yet
//EXAMPLE: if users rank id doesnt match the r.id, it will just return null instead of not showing the user at all
module.exports.fetchUserById = (id, callback) => {
  const SQLSTATEMENT = `
    SELECT 
      u.id,
      u.username,
      u.reputation,
      u.rank_id,
      r.name AS rank_name
    FROM User u
    LEFT JOIN Ranks r ON u.rank_id = r.id
    WHERE u.id = ?;
  `;

  const VALUES = [id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};
