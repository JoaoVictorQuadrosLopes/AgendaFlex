const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
