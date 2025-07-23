const pool = require('../services/db');

module.exports.fetchAllShopItems = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Shopitems
    `;

    pool.query(SQLSTATEMENT,callback)
}


//FETCH USER OWNED ITEMS
//For each row in UserShopItems, find the matching row in ShopItems where the shop_item_id in UserShopItems matches the id in ShopItems.
module.exports.fetchUserShopItems = (user_id, callback) => {
  const SQLSTATEMENT = `
    SELECT Shopitems.id as item_id, Shopitems.name, Shopitems.type, Shopitems.asset_url
    FROM Usershopitems
    JOIN Shopitems ON Usershopitems.shop_item_id = Shopitems.id
    WHERE Usershopitems.user_id = ?;
  `;
  const VALUES = [user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

//Purchase item for user
module.exports.insertUserShopItem = (userId, shopItemId, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO Usershopitems (user_id, shop_item_id)
    VALUES (?, ?);
  `;
  const VALUES = [userId, shopItemId];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

//Deduct reputation after buying
module.exports.updateUserReputation = (userId, cost, callback) => {
  const SQLSTATEMENT = `
    UPDATE User
    SET reputation = reputation - ?
    WHERE id = ? AND reputation >= ?;
  `;
  const VALUES = [cost, userId, cost];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


//Check if user own the item 
module.exports.checkUserOwnsItem = (userId, shopItemId, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Usershopitems
    WHERE user_id = ? AND shop_item_id = ?;
  `;
  const VALUES = [userId, shopItemId];
  pool.query(SQLSTATEMENT, VALUES, callback);
};




//Get the item type and cost 
module.exports.getItemDetails = (shopItemId, callback) => {
  const SQLSTATEMENT = `
    SELECT type, cost FROM Shopitems
    WHERE id = ?;
  `;
  const VALUES = [shopItemId];
  pool.query(SQLSTATEMENT, VALUES, callback);
};
