// services/db.js
const mysql = require("mysql2/promise");
const config = require("../config");

async function query(sql, params = []) {
  const connection = await mysql.createConnection(config.db);

  // Use query() instead of execute() to avoid strict prepared-statement issues
  const [results] = await connection.query(sql, params);

  await connection.end();
  return results;
}

module.exports = { query };

