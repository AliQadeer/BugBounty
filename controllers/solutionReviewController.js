const model = require("../model/solutionReviewModel.js");

// Get all closed reports with solutions
module.exports.getClosedReportsWithSolutions = (req, res) => {
    const callback = (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error retrieving solutions" });
        }
        return res.status(200).json(results);
    };

    model.getClosedReportsWithSolutions(callback);
};

// Get reviews for a specific report
module.exports.getReviewsByReportId = (req, res) => {
    const report_id = req.params.reportId;

    const callback = (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error retrieving reviews" });
        }
        return res.status(200).json(results);
    };

    model.getReviewsByReportId(report_id, callback);
};

// Get reviews by current user
module.exports.getUserReviews = (req, res) => {
    const user_id = res.locals.userId; // Auth middleware sets res.locals.userId

    const callback = (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error retrieving user reviews" });
        }
        return res.status(200).json(results);
    };

    model.getReviewsByUserId(user_id, callback);
};

// Create a new review
module.exports.createReview = (req, res) => {
    const { report_id, rating, comment } = req.body;
    const user_id = res.locals.userId;

    if (!report_id || !rating || !comment) {
        return res.status(400).json({ error: "Missing required fields: report_id, rating, comment" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this report
    const checkCallback = (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error checking existing review" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "You have already reviewed this solution" });
        }

        // Create the review
        const createCallback = (createError, createResults) => {
            if (createError) {
                console.error("Database error:", createError);
                return res.status(500).json({ error: "Database error creating review" });
            }

            return res.status(201).json({
                id: createResults.insertId,
                user_id,
                report_id,
                rating,
                comment,
                message: "Review created successfully"
            });
        };

        model.createReview(user_id, report_id, rating, comment, createCallback);
    };

    model.checkExistingReview(user_id, report_id, checkCallback);
};

// Update a review
module.exports.updateReview = (req, res) => {
    const review_id = req.params.reviewId;
    const { rating, comment } = req.body;
    const user_id = res.locals.userId;

    if (!rating || !comment) {
        return res.status(400).json({ error: "Missing required fields: rating, comment" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if review exists and belongs to user
    const checkCallback = (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error checking review" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (results[0].user_id !== user_id) {
            return res.status(403).json({ error: "You can only edit your own reviews" });
        }

        // Update the review
        const updateCallback = (updateError) => {
            if (updateError) {
                console.error("Database error:", updateError);
                return res.status(500).json({ error: "Database error updating review" });
            }

            return res.status(200).json({
                id: review_id,
                rating,
                comment,
                message: "Review updated successfully"
            });
        };

        model.updateReview(review_id, rating, comment, updateCallback);
    };

    model.getReviewById(review_id, checkCallback);
};

// Delete a review
module.exports.deleteReview = (req, res) => {
    const review_id = req.params.reviewId;
    const user_id = res.locals.userId;

    // Check if review exists and belongs to user
    const checkCallback = (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error checking review" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (results[0].user_id !== user_id) {
            return res.status(403).json({ error: "You can only delete your own reviews" });
        }

        // Delete the review
        const deleteCallback = (deleteError) => {
            if (deleteError) {
                console.error("Database error:", deleteError);
                return res.status(500).json({ error: "Database error deleting review" });
            }

            return res.status(200).json({ message: "Review deleted successfully" });
        };

        model.deleteReview(review_id, deleteCallback);
    };

    model.getReviewById(review_id, checkCallback);
};