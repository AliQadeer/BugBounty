module.exports = (req,res,next) => {
    const data = {
        status: req.body.status,
        user_id: req.body.user_id,
    }

    if(!data.status) {
        res.status(400).send("Error: Please provide status ");
    }

    if(!data.user_id) {
        res.status(400).send("Error: Please provide user id");
    }

    next();


}