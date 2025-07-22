const express = require('express');
const router = express.Router();

const controllers = require('../controllers/leaderboardcontroller.js')

//ROUTES
router.get('/',controllers.getLeaderboard)

module.exports = router;