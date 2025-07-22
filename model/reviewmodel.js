const pool = require('../services/db');

// CREATE NEW REVIEW
module.exports.createReview = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO reviews (user_id, rating, comment)
        VALUES (?, ?, ?)
    `;
    const VALUES = [data.user_id, data.rating, data.comment];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// GET ALL REVIEWS WITH USER INFORMATION
module.exports.getAllReviews = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.username
        FROM reviews r
        JOIN user u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

// GET REVIEWS BY USER ID
module.exports.getReviewsByUserId = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.username
        FROM reviews r
        JOIN user u ON r.user_id = u.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;
    const VALUES = [userId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// UPDATE REVIEW
module.exports.updateReview = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE reviews 
        SET rating = ?, comment = ?
        WHERE id = ? AND user_id = ?
    `;
    const VALUES = [data.rating, data.comment, data.id, data.user_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// DELETE REVIEW
module.exports.deleteReview = (reviewId, userId, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM reviews 
        WHERE id = ? AND user_id = ?
    `;
    const VALUES = [reviewId, userId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// CHECK IF REVIEW EXISTS AND BELONGS TO USER
module.exports.checkReviewOwnership = (reviewId, userId, callback) => {
    const SQLSTATEMENT = `
        SELECT id FROM reviews 
        WHERE id = ? AND user_id = ?
    `;
    const VALUES = [reviewId, userId];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
};