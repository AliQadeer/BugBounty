const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
    const closer_id = res.locals.closer_id; // Set by previous middleware

    if (!closer_id) {
        console.error("closer_id not found in res.locals");
        return res.status(500).json({ error: "Missing closer information" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error getting user reputation:", error);
            return res.status(500).json({ error: "Error getting user reputation" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.locals.user_reputation = results[0].reputation;
        console.log(`User ${closer_id} now has ${results[0].reputation} reputation points`);
        next();
    };

    model.getUserReputation(closer_id, callback);
};