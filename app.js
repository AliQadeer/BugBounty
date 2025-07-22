const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Main Routes
const mainRoutes = require('./routes/mainRoutes');
app.use("/api", mainRoutes);

//setup static files
app.use("/", express.static('public'));

// Optional: health check
app.get('/', (req, res) => {
  res.send('Bug Bounty API is running');
});

module.exports = app;
