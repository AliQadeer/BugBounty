const model = require("../model/shopmodel.js");

module.exports = (req,res,next) => {
    const userId = req.body.user_id;
    const shopItemId = req.body.shop_item_id;
    const cost = res.locals.itemcost

    const callback = (error,results) => {
        if (error || results.affectedRows === 0) {
            return res.status(400).json({ error: "Not enough reputation" });
        }

        next();
    }

    model.updateUserReputation(userId,cost,callback)
}