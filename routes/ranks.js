const express = require('express');
const router = express.Router();
const controllers = require('../controllers/rankscontroller.js'); 

// Define routes here...
router.get('/:user_id', controllers.fetchRankById)
module.exports = router;