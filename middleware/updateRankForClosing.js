const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
    const closer_id = res.locals.closer_id; // Set by previous middleware

    if (!closer_id) {
        console.error("closer_id not found in res.locals");
        return res.status(500).json({ error: "Missing closer information" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error updating user rank:", error);
            return res.status(500).json({ error: "Error updating user rank" });
        }

        console.log(`Updated rank for user ${closer_id}`);
        next();
    };

    model.updateRank(closer_id, callback);
};