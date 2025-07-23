const model = require("../model/reportmodel.js");
// CREATE NEW REPORT
module.exports.createNewReport = (req, res, next) => {
    const { user_id, vulnerability_id } = req.body;

    if(!user_id || !vulnerability_id) {
        return res.status(400).json({error: "Please provide required fields"});
    }

    const callback = (error, results, fields) => {
        if (error) {
            return res.status(500).json({ error: "Database error checking user" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        next();
    };

    model.checkUserExists(user_id, callback);
};


module.exports.updateReport = (req, res, next) => {
    const id = req.params.id;
    const status = req.body.status;
    const user_id = req.body.user_id;

    let IDSTATUS;
    let awardedBadgeName = null;

    const callback = (error, results, fields) => {
        if (error) {
            return res.status(500).json({ error: "Database error checking report ID" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Report ID does not exist" });
        }

        next();
    };

    model.checkReportId(id, callback);
};

// GET ALL REPORTS - CA1 Required Endpoint
module.exports.getAllReports = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error retrieving reports" });
        }

        // Return the reports array
        return res.status(200).json(results);
    };

    model.getAllReports(callback);
};

