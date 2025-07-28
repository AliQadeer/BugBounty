const express = require('express');
const router = express.Router();

const controllers = require('../controllers/reportcontroller.js'); 
const validateReportID = require('../middleware/validateReportID.js');
const validateuserandvulIDS = require('../middleware/validateuserandvulIDS.js');
const checkVulnerabilityExists = require('../middleware/checkVulnerabilityExists.js')
const insertReport = require('../middleware/insertReport.js')
const updateUserReputationReport = require('../middleware/updateUserReputationReport.js')
const updateRank = require('../middleware/updateRank.js')
const getUserReputation = require('../middleware/getUserReputation.js')
const getUserRank = require('../middleware/getUserRank.js')
const checkUserExists = require('../middleware/checkUserExists.js')
const getVulIdFromReport = require('../middleware/getVulIdFromReport.js')
const putById = require('../middleware/putById.js')
const fetchIdandStatus = require('../middleware/fetchIdandStatus.js')
const updateUserReputationUpdateReport = require('../middleware/updateUserReputationUpdateReport.js')
const checkAndAwardBadge = require('../middleware/checkAndAwardBadge.js')
const checkVulnerabilityExistsUpdateReport = require('../middleware/checkVulnerabilityExistsUpdateReport.js')
// Define routes here...
router.get('/', controllers.getAllReports);
router.post('/', validateuserandvulIDS, controllers.createNewReport,checkVulnerabilityExists,insertReport,updateUserReputationReport,updateRank,getUserReputation,getUserRank);
router.put('/:id', validateReportID, controllers.updateReport,checkUserExists,getVulIdFromReport,checkVulnerabilityExistsUpdateReport,putById,fetchIdandStatus,updateUserReputationUpdateReport,checkAndAwardBadge);
router.patch('/:id/close', controllers.closeReport);
module.exports = router;