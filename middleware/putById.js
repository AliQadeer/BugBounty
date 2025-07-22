const model = require("../model/reportmodel.js");

module.exports = (req,res,next) => {
    const id = req.params.id; // Get the report ID from the URL
    const status = req.body.status; // New status for the report
    const user_id = req.body.user_id; // User closing the report

    const callback = (error,results) => {
        if (error) {
            return res.status(500).json({ error: "There was an error updating the report" });
        }

        next();
    }

    model.putById(status, user_id, id,callback)
}