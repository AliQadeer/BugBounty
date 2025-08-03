const model = require("../model/reportmodel.js");

module.exports = (req,res,next) => {
    const { user_id, vulnerability_id, description } = req.body;

    const callback = (error,results) => {
         if (error) {
                return res.status(500).json({ error: "Error inserting report" });
        }

        res.locals.report_id = results.insertId;

        next();
    }

    model.insertReport(user_id, vulnerability_id, description, callback)
}