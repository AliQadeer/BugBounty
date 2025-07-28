const model = require("../model/shopmodel.js");

module.exports = (req,res,next) => {
    const userId = req.body.user_id;
    const shopItemId = req.body.shop_item_id;
    const type = res.locals.itemtype

    const callback = (error,results) => {
        if (error) return res.status(500).json({ error: "Error unequipping" });

        next();
    }

    model.unequipOtherItems(userId,type,callback)


}