const express = require('express');
const router = express.Router();

const controllers = require('../controllers/shopcontroller.js');
const fetchUserShopItems = require('../middleware/fetchUserShopItems.js')
const checkUserOwnsItem = require('../middleware/checkUserOwnsItem.js')
const getItemDetails = require('../middleware/getItemDetails.js')
const updateUserReputation = require('../middleware/updateUserReputation.js')
const insertUserShopItem = require('../middleware/insertUserShopItem.js')
const unequipOtherItems = require('../middleware/unequipOtherItems.js')
const equipItem = require('../middleware/equipItem.js')
const checkUserOwnsItemEquip = require('../middleware/checkUserOwnsItemEquip.js')
//ROUTES
router.get('/', controllers.getAllShopItems);
router.get("/user/:id/inventory", controllers.getUserShopItems,fetchUserShopItems);
router.post("/purchase", controllers.purchaseShopItem,checkUserOwnsItem,getItemDetails,updateUserReputation,insertUserShopItem);
router.put("/equip", controllers.equipShopItem,checkUserOwnsItemEquip,unequipOtherItems,equipItem);


module.exports = router;