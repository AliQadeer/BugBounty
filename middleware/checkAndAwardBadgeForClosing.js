const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
  const closer_id = req.body.closer_id;
  const reportId = req.params.id;

  let awardedBadgeName = null;

  // First get the vulnerability_id from the report
  model.getVulIdFromReport(reportId, (error, results) => {
    if (error) {
      console.error("Error getting vulnerability ID from report", error);
      return sendResponse();
    }

    if (results.length === 0) {
      console.error("Report not found");
      return sendResponse();
    }

    const vulnerability_id = results[0].vulnerability_id;

    // Count how many reports the user has CLOSED for this vulnerability type
    model.countUserClosedReportsByVulnerability(closer_id, vulnerability_id, (error, results) => {
      if (error) {
        console.error("Error counting closed reports for badge", error);
        return sendResponse();
      }

      const closedReportCount = results[0].count;
      console.log(`User ${closer_id} has closed ${closedReportCount} reports for vulnerability ${vulnerability_id}`);

      if (closedReportCount >= 15) {
        // Get badge linked to vulnerability
        model.getBadgeByVulnerabilityId(vulnerability_id, (error, results) => {
          if (error) {
            console.error("Error getting badge for vulnerability", error);
            return sendResponse();
          }

          if (results.length > 0) {
            const badge_id = results[0].id;

            // Check if user already has badge
            model.checkUserBadge(closer_id, badge_id, (error, results) => {
              if (error) {
                console.error("Error checking user badge", error);
                return sendResponse();
              }

              if (results.length === 0) {
                // Insert badge for user
                model.insertUserBadge(closer_id, badge_id, (error) => {
                  if (error) {
                    console.error("Error inserting user badge", error);
                    return sendResponse();
                  }

                  // Get badge name to show in response
                  model.getBadgeById(badge_id, (error, results) => {
                    if (error) {
                      console.error("Error fetching badge name", error);
                    } else if (results.length > 0) {
                      awardedBadgeName = results[0].name;
                      console.log(`User ${closer_id} awarded badge ${awardedBadgeName} for closing reports`);
                    }
                    return sendResponse();
                  });
                });
              } else {
                console.log(`User ${closer_id} already has badge for vulnerability ${vulnerability_id}`);
                return sendResponse(); // User already has badge
              }
            });
          } else {
            console.log(`No badge linked to vulnerability ${vulnerability_id}`);
            return sendResponse(); // No badge linked to vulnerability
          }
        });
      } else {
        console.log(`User ${closer_id} needs ${15 - closedReportCount} more closed reports for badge`);
        return sendResponse(); // Report count below badge threshold
      }
    });
  });

  function sendResponse() {
    res.status(200).json({
      message: "Report closed successfully",
      reportId: reportId,
      closerId: closer_id,
      badge_awarded: awardedBadgeName
    });
  }
};