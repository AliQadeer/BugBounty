const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const tokenAlgorithm = 'HS256';
const tokenDuration = '1h';
const saltRounds = 10;

module.exports.generateToken = (req, res, next) => {
    const payload = {
        userId: res.locals.userId,
        timestamp: new Date()
    };
    
    const options = {
        algorithm: tokenAlgorithm,
        expiresIn: tokenDuration,
    };
    
    const callback = (err, token) => {
        if (err) {
            console.error("Error jwt:", err);
            res.status(500).json(err);
        } else {
            res.locals.token = token;
            next();
        }
    };
    
    jwt.sign(payload, secretKey, options, callback);
};

module.exports.sendToken = (req, res, next) => {
    res.status(200).json({
        message: res.locals.message,
        token: res.locals.token,
    });
};

module.exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    
    const callback = (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        
        res.locals.userId = decoded.userId;
        res.locals.tokenTimestamp = decoded.timestamp;
        next();
    };
    
    jwt.verify(token, secretKey, callback);
};

module.exports.comparePassword = (req, res, next) => {
    const callback = (err, isMatch) => {
        if (err) {
            console.error("Error bcrypt:", err);
            res.status(500).json(err);
        } else {
            if (isMatch) {
                next();
            } else {
                res.status(401).json({
                    message: "Wrong password",
                });
            }
        }
    };
    
    bcrypt.compare(req.body.password, res.locals.hash, callback);
};

module.exports.hashPassword = (req, res, next) => {
    const callback = (err, hash) => {
        if (err) {
            console.error("Error bcrypt:", err);
            res.status(500).json(err);
        } else {
            res.locals.hash = hash;
            next();
        }
    };
    
    bcrypt.hash(req.body.password, saltRounds, callback);
};