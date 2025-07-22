const model = require("../model/leaderboardmodel.js");

module.exports.getLeaderboard = (req,res,next) => {

    const callback = (error,results) => {
        if(error) {
            return res.status(500).json({error: "Could not retrieve leaderboard"})
        }
        else {
            return res.status(200).json(results)
        }
    }
    model.fetchLeaderboard(callback)
}