const model = require("../model/reportmodel.js");

module.exports = (req, res, next) => {
  const user_id = req.body.user_id;

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error checking user ID" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User ID does not exist" });
    }
    next();
  };

  model.checkUserExists(user_id, callback);
};
