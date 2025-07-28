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

// CLOSE REPORT - Validation step (first middleware)
module.exports.validateCloseReport = (req, res, next) => {
    const reportId = req.params.id;
    const closerId = req.body.closer_id;

    if (!closerId) {
        return res.status(400).json({ error: "Closer ID is required" });
    }

    // Check if report exists and is not already closed
    const checkCallback = (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error checking report" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }
        if (results[0].status === 1) {
            return res.status(400).json({ error: "Report is already closed" });
        }

        next(); // Proceed to next middleware
    };

    model.checkReportId(reportId, checkCallback);
};

// CLOSE REPORT - Close the report (second middleware)
module.exports.executeCloseReport = (req, res, next) => {
    const reportId = req.params.id;
    const closerId = req.body.closer_id;

    const closeCallback = (closeError) => {
        if (closeError) {
            return res.status(500).json({ error: "Database error closing report" });
        }
        next(); // Proceed to badge checking middleware
    };

    model.closeReport(reportId, closerId, closeCallback);
};

