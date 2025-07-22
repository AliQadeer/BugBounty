const model = require("../model/usermodel.js");

module.exports = (req,res,next) => {
    const data = {
        id: req.params.id,
        username: req.body.username,
        reputation: req.body.reputation,
    };

    const callback = (error,results) => {
        if (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ error: "Database error" });
        } 
        
        next();
    }

    model.putById(data,callback);


}