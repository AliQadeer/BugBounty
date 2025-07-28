const pool = require('../services/db');

module.exports.fetchLeaderboard = (callback) => {
  const SQLSTATEMENT = `
    SELECT u.id, u.username, u.reputation, r.name as rank_name
    FROM User u
    LEFT JOIN Ranks r ON u.rank_id = r.id
    ORDER BY u.reputation DESC
    LIMIT 10
  `;

  pool.query(SQLSTATEMENT, callback);
};
