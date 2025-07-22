module.exports = (req,res,next) => {
    if(!req.body.username) {
        res.status(400).send("Error: username is required")
        return;
    }
    next();
}