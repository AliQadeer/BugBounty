const pool = require('../services/db');

// Get all solution reviews for a specific report
module.exports.getReviewsByReportId = (report_id, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            sr.id,
            sr.user_id,
            sr.report_id,
            sr.rating,
            sr.comment,
            sr.created_at,
            sr.updated_at,
            u.username
        FROM solution_reviews sr
        JOIN user u ON sr.user_id = u.id
        WHERE sr.report_id = ?
        ORDER BY sr.created_at DESC
    `;
    pool.query(SQLSTATEMENT, [report_id], callback);
};

// Get all reviews by a specific user
module.exports.getReviewsByUserId = (user_id, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            sr.id,
            sr.user_id,
            sr.report_id,
            sr.rating,
            sr.comment,
            sr.created_at,
            sr.updated_at,
            u.username,
            r.solution,
            v.type as vulnerability_type
        FROM solution_reviews sr
        JOIN user u ON sr.user_id = u.id
        JOIN report r ON sr.report_id = r.id
        JOIN vulnerability v ON r.vulnerability_id = v.id
        WHERE sr.user_id = ?
        ORDER BY sr.created_at DESC
    `;
    pool.query(SQLSTATEMENT, [user_id], callback);
};

// Create a new review
module.exports.createReview = (user_id, report_id, rating, comment, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO solution_reviews (user_id, report_id, rating, comment)
        VALUES (?, ?, ?, ?)
    `;
    const VALUES = [user_id, report_id, rating, comment];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Update a review
module.exports.updateReview = (review_id, rating, comment, callback) => {
    const SQLSTATEMENT = `
        UPDATE solution_reviews 
        SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const VALUES = [rating, comment, review_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Delete a review
module.exports.deleteReview = (review_id, callback) => {
    const SQLSTATEMENT = `DELETE FROM solution_reviews WHERE id = ?`;
    pool.query(SQLSTATEMENT, [review_id], callback);
};

// Check if user already reviewed a specific report
module.exports.checkExistingReview = (user_id, report_id, callback) => {
    const SQLSTATEMENT = `
        SELECT id FROM solution_reviews 
        WHERE user_id = ? AND report_id = ?
    `;
    const VALUES = [user_id, report_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get a specific review by ID
module.exports.getReviewById = (review_id, callback) => {
    const SQLSTATEMENT = `
        SELECT * FROM solution_reviews WHERE id = ?
    `;
    pool.query(SQLSTATEMENT, [review_id], callback);
};

// Get closed reports with solutions for public display
module.exports.getClosedReportsWithSolutions = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.id,
            r.user_id,
            r.vulnerability_id,
            r.status,
            r.closer_id,
            r.closed_at,
            r.description,
            r.solution,
            u.username as reporter_username,
            closer.username as closer_username,
            v.type,
            v.description as vulnerability_description,
            v.points,
            AVG(sr.rating) as avg_rating,
            COUNT(sr.id) as review_count
        FROM report r
        JOIN user u ON r.user_id = u.id
        LEFT JOIN user closer ON r.closer_id = closer.id
        JOIN vulnerability v ON r.vulnerability_id = v.id
        LEFT JOIN solution_reviews sr ON r.id = sr.report_id
        WHERE r.status = 1 AND r.solution IS NOT NULL
        GROUP BY r.id, r.user_id, r.vulnerability_id, r.status, r.closer_id, r.closed_at, r.description, r.solution, u.username, closer.username, v.type, v.description, v.points
        ORDER BY r.closed_at DESC
    `;
    pool.query(SQLSTATEMENT, callback);
};