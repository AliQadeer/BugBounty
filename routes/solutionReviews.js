const express = require('express');
const router = express.Router();
const controller = require('../controllers/solutionReviewController');
const { verifyToken } = require('../middleware/auth');

// GET /api/solution-reviews/solutions - Get all closed reports with solutions
router.get('/solutions', controller.getClosedReportsWithSolutions);

// GET /api/solution-reviews/report/:reportId - Get reviews for a specific report
router.get('/report/:reportId', controller.getReviewsByReportId);

// GET /api/solution-reviews/my-reviews - Get current user's reviews
router.get('/my-reviews', verifyToken, controller.getUserReviews);

// POST /api/solution-reviews - Create a new review
router.post('/', verifyToken, controller.createReview);

// PUT /api/solution-reviews/:reviewId - Update a review
router.put('/:reviewId', verifyToken, controller.updateReview);

// DELETE /api/solution-reviews/:reviewId - Delete a review
router.delete('/:reviewId', verifyToken, controller.deleteReview);

module.exports = router;