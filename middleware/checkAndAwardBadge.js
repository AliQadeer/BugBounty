const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
  const user_id = req.body.user_id;
  const vulnerability_id = res.locals.vulnerability_id;
  const IDSTATUS = res.locals.IDSTATUS;

  let awardedBadgeName = null;

  // Count user reports for this vulnerability
  model.countUserReportsByVulnerability(user_id, vulnerability_id, (error, results) => {
    if (error) {
      console.error("Error counting reports for badge", error);
      return sendResponse();
    }

    const reportCount = results[0].count;

    if (reportCount >= 15) {
      // Get badge linked to vulnerability
      model.getBadgeByVulnerabilityId(vulnerability_id, (error, results) => {
        if (error) {
          console.error("Error getting badge for vulnerability", error);
          return sendResponse();
        }

        if (results.length > 0) {
          const badge_id = results[0].id;

          // Check if user already has badge
          model.checkUserBadge(user_id, badge_id, (error, results) => {
            if (error) {
              console.error("Error checking user badge", error);
              return sendResponse();
            }

            if (results.length === 0) {
              // Insert badge for user
              model.insertUserBadge(user_id, badge_id, (error) => {
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
                    console.log(`User ${user_id} awarded badge ${awardedBadgeName}`);
                  }
                  return sendResponse();
                });
              });
            } else {
              return sendResponse(); // User already has badge
            }
          });
        } else {
          return sendResponse(); // No badge linked to vulnerability
        }
      });
    } else {
      return sendResponse(); // Report count below badge threshold
    }
  });

  function sendResponse() {
    model.getUserReputation(user_id, (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Error retrieving updated reputation" });
      }
      console.log("User reputation query results:", results);

      const updatedReputation = results[0].reputation;

      res.status(200).json({
        id: IDSTATUS.id,
        status: IDSTATUS.status,
        closer_id: user_id,
        reputation: updatedReputation,
        awarded_badge: awardedBadgeName
      });
    });
  }
};
