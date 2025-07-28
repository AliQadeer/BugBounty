const model = require("../model/shopmodel.js");

module.exports = (req,res,next) => {
    const userId = req.body.user_id;
    const shopItemId = req.body.shop_item_id;

    const callback = (error,results) => {
        if (error) return res.status(500).json({ error: "Error unequipping item" });
        res.status(200).json({ message: "Unequipped successfully" });
    }

    model.unequipItem(userId,shopItemId,callback)
}