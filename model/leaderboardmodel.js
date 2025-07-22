const pool = require('../services/db');

module.exports.fetchLeaderboard = (callback) => {
  const SQLSTATEMENT = `
    SELECT id, username, reputation
    FROM User
    ORDER BY reputation DESC
    LIMIT 10
  `;

  pool.query(SQLSTATEMENT, callback);
};
