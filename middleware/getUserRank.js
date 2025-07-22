const model = require("../model/reportmodel.js");

module.exports = (req,res,next) => {
    const { user_id, vulnerability_id } = req.body;

    const callback = (error,results) => {
         if (error) {
            return res.status(500).json({ error: "Error retrieving user rank" });
        }

        res.locals.updatedRank = results[0].rank_name;

        res.status(201).json({
        id: res.locals.report_id,
        user_id,
        vulnerability_id,
        status: 0,
        user_reputation: res.locals.updatedReputation,
        user_rank: res.locals.updatedRank
        });
    }

    model.getUserRank(user_id,callback)
}