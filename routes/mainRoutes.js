const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const vulnerabilityRoutes = require('./vulnerabilities');
const reportRoutes = require('./reports');
const ranksRoutes = require('./ranks');
const shopRoutes = require('./shop');
const leaderboardRoutes = require('./leaderboard');
const reviewRoutes = require('./reviews');


router.use('/users', userRoutes);
router.use('/vulnerabilities', vulnerabilityRoutes);
router.use('/reports', reportRoutes);
router.use('/ranks', ranksRoutes);
router.use('/shop', shopRoutes);
router.use('/leaderboard',leaderboardRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
