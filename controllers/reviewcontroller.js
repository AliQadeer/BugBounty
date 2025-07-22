const model = require("../model/reviewmodel.js");

// CREATE NEW REVIEW
module.exports.createReview = (req, res, next) => {
    const { rating, comment } = req.body;
    const user_id = res.locals.userId;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: "Comment is required" });
    }

    const data = {
        user_id: user_id,
        rating: rating,
        comment: comment.trim()
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error creating review:", error);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
            id: results.insertId,
            user_id: user_id,
            rating: rating,
            comment: comment.trim(),
            message: "Review created successfully"
        });
    };

    model.createReview(data, callback);
};

// GET ALL REVIEWS
module.exports.getAllReviews = (req, res, next) => {
    const callback = (error, results) => {
        if (error) {
            console.error("Error fetching reviews:", error);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json(results);
    };

    model.getAllReviews(callback);
};

// GET USER'S OWN REVIEWS
module.exports.getUserReviews = (req, res, next) => {
    const user_id = res.locals.userId;

    const callback = (error, results) => {
        if (error) {
            console.error("Error fetching user reviews:", error);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json(results);
    };

    model.getReviewsByUserId(user_id, callback);
};

// UPDATE REVIEW
module.exports.updateReview = (req, res, next) => {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;
    const user_id = res.locals.userId;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: "Comment is required" });
    }

    // First check if review exists and belongs to user
    const checkCallback = (error, results) => {
        if (error) {
            console.error("Error checking review ownership:", error);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Review not found or not owned by user" });
        }

        // Update the review
        const data = {
            id: reviewId,
            user_id: user_id,
            rating: rating,
            comment: comment.trim()
        };

        const updateCallback = (error, results) => {
            if (error) {
                console.error("Error updating review:", error);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: "Review not found or not owned by user" });
            }

            res.status(200).json({
                id: reviewId,
                rating: rating,
                comment: comment.trim(),
                message: "Review updated successfully"
            });
        };

        model.updateReview(data, updateCallback);
    };

    model.checkReviewOwnership(reviewId, user_id, checkCallback);
};

// DELETE REVIEW
module.exports.deleteReview = (req, res, next) => {
    const reviewId = req.params.id;
    const user_id = res.locals.userId;

    // First check if review exists and belongs to user
    const checkCallback = (error, results) => {
        if (error) {
            console.error("Error checking review ownership:", error);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Review not found or not owned by user" });
        }

        // Delete the review
        const deleteCallback = (error, results) => {
            if (error) {
                console.error("Error deleting review:", error);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: "Review not found or not owned by user" });
            }

            res.status(200).json({ message: "Review deleted successfully" });
        };

        model.deleteReview(reviewId, user_id, deleteCallback);
    };

    model.checkReviewOwnership(reviewId, user_id, checkCallback);
};