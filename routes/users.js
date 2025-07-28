const express = require('express');
const router = express.Router();

const controllers = require('../controllers/usercontroller.js'); 
const validateusername = require('../middleware/validateusername.js');
const insertingSingleUser = require('../middleware/insertingSingleUser.js')
const checkDuplicateUsername =require('../middleware/checkDuplicateUsername.js')
const fetchDetailsFromId = require('../middleware/fetchDetailsFromId.js')
const updateById = require('../middleware/updateById.js')
const auth = require('../middleware/auth.js');
const getUserByUsername = require('../middleware/getUserByUsername.js');
//ROUTES
router.post('/', controllers.createNewPlayer, insertingSingleUser);
router.get('/', controllers.getAllUsers);
router.get('/:id',controllers.getUserById);
router.get('/:id/badges', controllers.getUserBadges);
router.put('/:id',controllers.updateUserById,checkDuplicateUsername,updateById,fetchDetailsFromId);

// AUTHENTICATION ROUTES
router.post('/register', controllers.registerUser, auth.hashPassword, controllers.createUserWithAuth, auth.generateToken, auth.sendToken);
router.post('/login', controllers.loginUser, getUserByUsername, auth.comparePassword, auth.generateToken, auth.sendToken);


module.exports = router;