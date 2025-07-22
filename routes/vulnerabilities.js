const express = require('express');
const router = express.Router();

const controllers = require('../controllers/vulnerabilitycontroller.js'); 
const validatevulnerability = require('../middleware/validatevulnerability.js');
// Define routes here...
router.post('/', validatevulnerability, controllers.createNewVulnerability);
router.get('/', controllers.getAllVulnerabilities);






module.exports = router;