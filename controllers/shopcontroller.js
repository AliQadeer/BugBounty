const model = require("../model/shopmodel.js");
const modeluser = require("../model/usermodel.js");

module.exports.getAllShopItems = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        } else {
            return res.status(200).json(results);
        }
    };

    model.fetchAllShopItems(callback);
};



// Get user's owned shop items
module.exports.getUserShopItems = (req, res, next) => {
  const user_id = req.params.id;
  if (!user_id) {
    return res.status(400).json({ error: "Please provide the required fields" });
  }

  const callback = (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: "Database error during user check" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User id does not exist" });
    }

    next();
  };

  modeluser.checkForId(user_id, callback);
};



//purchase shop item
module.exports.purchaseShopItem = (req, res, next) => {
  const userId = req.body.user_id;
  const shopItemId = req.body.shop_item_id;

  //validate req body
  if (!userId || !shopItemId) {
    return res.status(400).json({ error: "Missing required fields!" });
  }

  const callback = (error, userResults, fields) => {
    if (error) return res.status(500).json({ error: "Database error checking user" });
    if (userResults.length === 0) return res.status(404).json({ error: "User does not exist" });

    next();
  };

  modeluser.checkForId(userId, callback);
};


//equip item
module.exports.equipShopItem = (req, res, next) => {
  const userId = req.body.user_id;
  const shopItemId = req.body.shop_item_id;

  //validate request body
  if (!userId || !shopItemId) {
    return res.status(400).json({ error: "Missing required fields!" });
  }

  const callback = (error, itemResults, fields) => {
    if (error) return res.status(500).json({ error: "Error checking item" });
    if (itemResults.length === 0) return res.status(404).json({ error: "Item not found" });

    res.locals.itemtype = itemResults[0].type;

    next();
  };

  model.getItemDetails(shopItemId, callback);
};
