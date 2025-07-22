const model = require("../model/usermodel.js");

module.exports = (req, res, next) => {
    const username = req.body.username;
    
    const callback = (error, results) => {
        if (error) {
            console.error("Error fetching user by username:", error);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }
        
        res.locals.user = results[0];
        res.locals.hash = results[0].password;
        res.locals.userId = results[0].id;
        next();
    };
    
    model.getUserByUsername(username, callback);
};