const model = require("../model/shopmodel.js");

module.exports = (req,res,next) => {
    const userId = req.body.user_id;
    const shopItemId = req.body.shop_item_id;

    const callback = (error,results) => {

        if (error || results.length === 0) return res.status(404).json({ error: "Item not found" });

        res.locals.itemcost = results[0].cost;
        

        next();

    };

    model.getItemDetails(shopItemId,callback);;

};