const pool = require('../services/db');

// Check user exists
module.exports.checkUserExists = (user_id, callback) => {
    pool.query("SELECT * FROM User WHERE id = ?", [user_id], callback);
};

// Check vulnerability exists
module.exports.checkVulnerabilityExists = (vulnerability_id, callback) => {
    pool.query("SELECT * FROM Vulnerability WHERE id = ?", [vulnerability_id], callback);
};

// Insert report
module.exports.insertReport = (user_id,vulnerability_id, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Report (user_id, vulnerability_id, status) 
    VALUES (?, ?, 0)`;
    const VALUES = [user_id, vulnerability_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update user reputation
module.exports.updateUserReputation = (user_id, points, callback) => {
    const SQLSTATEMENT = `UPDATE User SET reputation = reputation + ? WHERE id = ?`;
    const VALUES = [points,user_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get user's updated reputation
module.exports.getUserReputation = (user_id, callback) => {
    const SQLSTATEMENT = `
    SELECT reputation FROM User WHERE id = ?`
    ;
    pool.query(SQLSTATEMENT,user_id,callback)
};

//UPDATING REPORT
module.exports.putById = (status, user_id, id, callback) => {
    const SQLSTATEMENT = `
    UPDATE Report
    SET status = ? , user_id = ?
    WHERE id = ? `;

    const VALUES = [status,user_id,id]

    pool.query(SQLSTATEMENT,VALUES,callback)
}

//CLOSING REPORT (New function for closing with closer_id)
module.exports.closeReport = (id, closer_id, callback) => {
    const SQLSTATEMENT = `
    UPDATE Report
    SET status = 1, closer_id = ?, closed_at = NOW()
    WHERE id = ? `;

    const VALUES = [closer_id, id]

    pool.query(SQLSTATEMENT,VALUES,callback)
}


//CHECKING IF REPORT ID EXISTS 
module.exports.checkReportId = (id,callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Report 
    WHERE id = ?
    `;
    const VALUES = [id]

    pool.query(SQLSTATEMENT,VALUES,callback)
}
//GET ID AND STATUS
module.exports.fetchIdandStatus = (id, callback) => {
    const SQLSTATEMENT = `
    SELECT id, status FROM Report
    WHERE id = ?`;
    const VALUES = [id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

//GET VULNERABILITY ID FROM REPORT 
module.exports.getVulIdFromReport = (id,callback) => {
    const SQLSTATEMENT = `
    SELECT vulnerability_id FROM Report
    WHERE id = ?
    `;

    const VALUES =[id]

    pool.query(SQLSTATEMENT,VALUES,callback)
}
//UPDATING USER RANK
//Used SET at first, however found out that set cannot be used to refer to outer tables, so have to use the join clause.
module.exports.updateRank = (user_id, callback) => {
  const SQLSTATEMENT = `
    UPDATE User u
    JOIN (
      SELECT id FROM ranks
      WHERE points_needed <= (SELECT reputation FROM User WHERE id = ?)
      ORDER BY points_needed DESC
      LIMIT 1
    ) r ON 1=1
    SET u.rank_id = r.id
    WHERE u.id = ?;
  `;

  const VALUES = [user_id, user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

//GET USER RANK (Couldnt do it the normal way)
  // SQL statement to join the User and Ranks tables
  // 'u' is an alias for the User table
  // 'r' is an alias for the Ranks table
module.exports.getUserRank = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT r.name AS rank_name, r.points_needed
    FROM User u
    JOIN Ranks r ON u.rank_id = r.id
    WHERE u.id = ?
  `;
  pool.query(SQLSTATEMENT, [user_id], callback);
};


// COUNT how many reports a user has for a specific vulnerability with status = 1 (accepted)
module.exports.countUserReportsByVulnerability = (user_id, vulnerability_id, callback) => {
    const SQLSTATEMENT = `
    SELECT COUNT(*) AS count FROM Report
    WHERE user_id = ? AND vulnerability_id = ? AND status = 1
    `;

    const VALUES = [user_id, vulnerability_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// COUNT how many reports a user has CLOSED for a specific vulnerability
module.exports.countUserClosedReportsByVulnerability = (closer_id, vulnerability_id, callback) => {
    const SQLSTATEMENT = `
    SELECT COUNT(*) AS count FROM Report
    WHERE closer_id = ? AND vulnerability_id = ? AND status = 1
    `;

    const VALUES = [closer_id, vulnerability_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// CHECK if user already has a badge for that vulnerability
module.exports.checkUserBadge = (user_id, badge_id, callback) => {
    const SQLSTATEMENT = `
    SELECT id FROM UserBadge
    WHERE user_id = ? AND badge_id = ?
    `;

    const VALUES = [user_id, badge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// INSERT a badge for the user (award badge)
module.exports.insertUserBadge = (user_id, badge_id, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO UserBadge (user_id, badge_id)
    VALUES (?, ?)
    `;

    const VALUES = [user_id, badge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};


// GET badge info by vulnerability_id
module.exports.getBadgeByVulnerabilityId = (vulnerability_id, callback) => {
    const SQLSTATEMENT = `
    SELECT id, name FROM Badge
    WHERE vulnerability_id = ?
    `;

    const VALUES = [vulnerability_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get badge name by badge ID
module.exports.getBadgeById = (badge_id, callback) => {
    const SQLSTATEMENT = `
        SELECT name FROM badge WHERE id = ?
    `;
    const VALUES = [badge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// GET ALL REPORTS - CA1 Required Endpoint
module.exports.getAllReports = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.id,
            r.user_id,
            r.vulnerability_id,
            r.status,
            r.closer_id,
            r.closed_at,
            u.username as reporter_username,
            closer.username as closer_username,
            v.type,
            v.description,
            v.points
        FROM report r
        JOIN user u ON r.user_id = u.id
        LEFT JOIN user closer ON r.closer_id = closer.id
        JOIN vulnerability v ON r.vulnerability_id = v.id
        ORDER BY r.id DESC
    `;
    pool.query(SQLSTATEMENT, callback);
};

