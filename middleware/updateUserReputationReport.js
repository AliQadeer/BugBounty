const model = require("../model/reportmodel.js");

module.exports = (req,res,next) => {
    const { user_id, vulnerability_id } = req.body;

    const callback = (error,results) => {
        if (error) {
            return res.status(500).json({ error: "Error updating user reputation" });
        }

        next();
    }

    model.updateUserReputation(user_id,res.locals.points,callback)
}