const model = require("../model/reportmodel.js");

module.exports = (req,res,next) => {
    const { user_id, vulnerability_id } = req.body;

    const callback = (error,results) => {
        if (error) {
            return res.status(500).json({ error: "Error retrieving updated reputation" });
        }

        res.locals.updatedReputation = results[0].reputation;

        next();
    }

    model.getUserReputation(user_id,callback)
}