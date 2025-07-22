const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
  const id = req.params.id;

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error in getting vulnerability ID" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Vulnerability ID not found" });
    }

    res.locals.vulnerability_id = results[0].vulnerability_id;
    next();
  };

  model.getVulIdFromReport(id, callback);
};
