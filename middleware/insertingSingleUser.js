const model = require("../model/usermodel.js");

module.exports = (req, res, next) => {
  const { username, reputation = 0 } = req.body;

  const data = { username, reputation };

  const callback = (error, results) => {
    if (error) {
      console.error("Error inserting new player:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const newPlayer = {
      id: results.insertId,
      username: data.username,
      reputation: data.reputation,
    };

    res.status(201).json(newPlayer);
  };

  model.insertSingle(data, callback);
};
