const model = require("../model/shopmodel.js");

module.exports = (req,res,next) => {
    const userId = req.body.user_id;
    const shopItemId = req.body.shop_item_id;

    const callback = (error,results) => {
    
    if (error) return res.status(500).json({ error: "Error checking ownership" });
    if (results.length > 0) return res.status(400).json({ error: "Already owned" });
    


    next();
    }

    model.checkUserOwnsItem(userId,shopItemId,callback)
}