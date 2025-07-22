module.exports = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        vulnerability_id: req.body.vulnerability_id,
    };

    if (!data.user_id) {
        res.status(400).send("Error: User id is not provided");
        return;
    }

    if (!data.vulnerability_id) {
        res.status(400).send("Error: Vulnerability id is not provided");
        return;
    }

    next();
}
