 const model = require("../model/usermodel.js");
 
module.exports.createNewPlayer = (req, res, next) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const callback = (error, results) => {
    if (error) {
      console.error("Error checking duplicate username:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

  
    next();
  };

  model.duplicateUsername(username, callback);
};



//GET ALL USERS 
module.exports.getAllUsers = (req, res, next) =>
    {
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error getAllUsers:", error);
                return res.status(500).json(error);
            } 
            else return res.status(200).json(results);
        }
    
        model.selectAll(callback);
    }

// GET USER BADGES
module.exports.getUserBadges = (req, res) => {
    const userId = req.params.id;

    const callback = (error, results) => {
        if (error) {
            console.error("Error getting user badges:", error);
            return res.status(500).json({ error: "Database error" });
        }
        
        return res.status(200).json(results);
    };

    model.getUserBadges(userId, callback);
};
//GET SINGLE USER BY ID 
module.exports.getUserById = (req, res, next) => {
  const id = req.params.id;

  const callback = (error, results) => {
    if (error) {
      console.error("Error checking for ID:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).send("Error: User ID is not found");
    }

    res.status(200).json(results);
  };

  model.fetchUserById(id, callback);
};

// UPDATING USER BY ID 
module.exports.updateUserById = (req, res, next) => {
    const data = {
        id: req.params.id,
        username: req.body.username,
        reputation: req.body.reputation,
    };

    const callbackCheckId = (error, results, fields) => {
        if (error) {
            console.error("Error checking for ID:", error);
            return res.status(500).json({ error: "Database error" });
        } 
        else if (results.length === 0) {
            return res.status(404).send("Error: User ID is not found");
        } 
        next();

    };

    model.checkForId(data.id, callbackCheckId);
};

// USER REGISTRATION
module.exports.registerUser = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking duplicate username:", error);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        next();
    };

    model.duplicateUsername(username, callback);
};

// CREATE USER WITH HASHED PASSWORD
module.exports.createUserWithAuth = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: res.locals.hash
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ error: "Database error" });
        }

        res.locals.userId = results.insertId;
        res.locals.message = "User registered successfully";
        next();
    };

    model.insertSingleWithAuth(data, callback);
};

// USER LOGIN
module.exports.loginUser = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    next();
};
