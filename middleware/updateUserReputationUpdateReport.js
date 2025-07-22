const model = require("../model/reportmodel.js");

module.exports = (req,res,next) => {
    const id = req.params.id; // Get the report ID from the URL
    const status = req.body.status; // New status for the report
    const user_id = req.body.user_id; // User closing the report

    const callback = (error,results) => {
        if (error) {
            return res.status(500).json({ error: "Error updating user reputation" });
        }

        next();
    }


    model.updateUserReputation(user_id,res.locals.points,callback)

}