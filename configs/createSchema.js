//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const mysql = require("mysql2");
require("dotenv").config();

//////////////////////////////////////////////////////
// GET DATABASE NAME FROM ENV
//////////////////////////////////////////////////////
const database = process.env.DB_DATABASE;

//////////////////////////////////////////////////////
// SETUP TEMP CONNECTION WITHOUT DB SELECTED
//////////////////////////////////////////////////////
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  dateStrings: true,
  connectionLimit: 10
});

//////////////////////////////////////////////////////
// DEFINE SQL STATEMENTS
//////////////////////////////////////////////////////
const CHECK_DB_SQL = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${database}'`;
const CREATE_DB_SQL = `CREATE DATABASE IF NOT EXISTS \`${database}\``;

//////////////////////////////////////////////////////
// EXECUTE LOGIC
//////////////////////////////////////////////////////
pool.query(CHECK_DB_SQL, (err, results) => {
  if (err) {
    console.error("❌ Error checking for database:", err);
    process.exit(1);
  }

  if (results.length === 0) {
    console.log(`🔧 Database "${database}" does not exist. Creating...`);
    pool.query(CREATE_DB_SQL, (err2) => {
      if (err2) {
        console.error("❌ Error creating database:", err2);
        process.exit(1);
      }
      console.log(`✅ Database "${database}" created.`);
      process.exit(0);
    });
  } else {
    console.log(`✅ Database "${database}" already exists.`);
    process.exit(0);
  }
});
