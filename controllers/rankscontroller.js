const { getUserRank } = require('../model/reportmodel'); // adjust path as needed
const { checkforId } = require('../model/usermodel');

module.exports.fetchRankById = (req, res, next) => {
    const id = req.params.user_id;

    if (!id) {
        return res.status(400).json({ error: "Please provide a id" });
    }

    checkforId(id, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error in checking for id" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Provided id does not exist" });
        }

        getUserRank(id, (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Error in fetching users rank" });
            } else {
                const rankName = results[0]?.rank_name || null;
                return res.status(200).json({ rank_name: rankName });
            }
        });
    });
};
