const express = require('express');
const router = express.Router();

const controllers = require('../controllers/reviewcontroller.js');
const auth = require('../middleware/auth.js');

// ROUTES
router.post('/', auth.verifyToken, controllers.createReview);
router.get('/', controllers.getAllReviews);
router.get('/my-reviews', auth.verifyToken, controllers.getUserReviews);
router.put('/:id', auth.verifyToken, controllers.updateReview);
router.delete('/:id', auth.verifyToken, controllers.deleteReview);

module.exports = router;