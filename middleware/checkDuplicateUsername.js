 const model = require("../model/usermodel.js");

module.exports = (req,res,next) => {
        const data = {
        id: req.params.id,
        username: req.body.username,
        reputation: req.body.reputation,
    };

    const callback= (error,results) => {
        if (error) {
            console.error("Error checking duplicate username:", error);
            return res.status(500).json({ error: "Database error" });
            } 

        if (results.length > 0) {
            // Username exists anywhere
            return res.status(409).send("Error: username already exists");
            }

            next();
    }

    model.duplicateUsername(data.username,callback)




}