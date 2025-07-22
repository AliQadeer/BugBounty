const model = require("../model/shopmodel.js");

module.exports = (req,res,next) => {
    const user_id = req.params.id;

    const callback = (error,results) => {
    if (error) {
        return res.status(500).json({ error: "Database error fetching shop items" });
      }
    else {
        return res.status(200).json(results);
    }}

    model.fetchUserShopItems(user_id,callback)

}