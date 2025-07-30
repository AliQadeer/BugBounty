const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
    const reportId = req.params.id;
    const closer_id = req.body.closer_id;

    // First get the vulnerability ID from the report
    model.getVulIdFromReport(reportId, (error, results) => {
        if (error) {
            console.error("Error getting vulnerability ID from report:", error);
            return res.status(500).json({ error: "Error getting vulnerability information" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }

        const vulnerability_id = results[0].vulnerability_id;

        // Get vulnerability details to get points
        model.checkVulnerabilityExists(vulnerability_id, (error, vulnResults) => {
            if (error) {
                console.error("Error getting vulnerability details:", error);
                return res.status(500).json({ error: "Error getting vulnerability details" });
            }

            if (vulnResults.length === 0) {
                return res.status(404).json({ error: "Vulnerability not found" });
            }

            const points = vulnResults[0].points;

            // Update user reputation with the vulnerability points
            model.updateUserReputation(closer_id, points, (error, updateResults) => {
                if (error) {
                    console.error("Error updating user reputation:", error);
                    return res.status(500).json({ error: "Error updating user reputation" });
                }

                // Store points and user_id in locals for next middleware
                res.locals.points = points;
                res.locals.closer_id = closer_id;
                res.locals.vulnerability_id = vulnerability_id;

                console.log(`User ${closer_id} awarded ${points} points for closing report ${reportId}`);
                next();
            });
        });
    });
};