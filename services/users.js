const db = require("./db");
const helper = require("../helper");
const config = require("../config");

/**
 * Creates a 400 Bad Request error
 * @param {string} msg - Error message
 * @returns {Error}
 */
function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}

/**
 * Retrieve paginated list of users (excluding password hash)
 *
 * @async
 * @function getMultiple
 * @param {number} [page=1] - Page number for pagination
 * @returns {Promise<Object>} Paginated users response
 * @returns {Array<Object>} returns.data - Array of users
 * @returns {Object} returns.meta - Pagination metadata
 */
async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);

  // Do not return password_hash in list
  const rows = await db.query(
    `SELECT user_id, username, role, created_at
     FROM users ORDER BY user_id ASC LIMIT ?, ?`,
    [offset, config.listPerPage]
  );

  return { data: helper.emptyOrRows(rows), meta: { page: Number(page) } };
}

/**
 * Retrieve a single user by ID (excluding password hash)
 *
 * @async
 * @function getById
 * @param {number|string} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getById(id) {
  const rows = await db.query(
    `SELECT user_id, username, role, created_at FROM users WHERE user_id=?`,
    [id]
  );
  return rows.length ? rows[0] : null;
}

/**
 * Create a new user
 *
 * Required Fields:
 * - username
 * - password_hash
 * - role
 *
 * Allowed Roles:
 * - PATIENT
 * - DOCTOR
 * - ADMIN
 *
 * @async
 * @function create
 * @param {Object} u - User payload
 * @param {string} u.username - Username
 * @param {string} u.password_hash - Hashed password
 * @param {string} u.role - User role
 * @throws {Error} 400 if required fields missing or invalid role
 * @returns {Promise<Object>} Creation result
 */
async function create(u) {
  if (!u.username || !u.password_hash || !u.role) {
    throw badRequest("username, password_hash, role are required");
  }

  const roles = new Set(["PATIENT", "DOCTOR", "ADMIN"]);
  if (!roles.has(u.role)) throw badRequest("role must be PATIENT, DOCTOR, or ADMIN");

  const result = await db.query(
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    [u.username, u.password_hash, u.role]
  );

  return { message: "User created successfully", user_id: result.insertId };
}

/**
 * Update an existing user
 *
 * Fields are merged with current values if omitted.
 *
 * @async
 * @function update
 * @param {number|string} id - User ID
 * @param {Object} u - Updated user payload
 * @param {string} [u.username]
 * @param {string} [u.password_hash]
 * @param {string} [u.role]
 * @throws {Error} 404 if user not found
 * @throws {Error} 400 if invalid role provided
 * @returns {Promise<Object>} Update result message
 */
async function update(id, u) {
  const existing = await db.query(`SELECT * FROM users WHERE user_id=?`, [id]);

  if (!existing.length) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const current = existing[0];

  const username = u.username ?? current.username;
  const passwordHash = u.password_hash ?? current.password_hash;
  const role = u.role ?? current.role;

  const roles = new Set(["PATIENT", "DOCTOR", "ADMIN"]);
  if (!roles.has(role)) throw badRequest("role must be PATIENT, DOCTOR, or ADMIN");

  const result = await db.query(
    `UPDATE users SET username=?, password_hash=?, role=? WHERE user_id=?`,
    [username, passwordHash, role, id]
  );

  return {
    message: result.affectedRows
      ? "User updated successfully"
      : "No user updated"
  };
}

/**
 * Delete a user by ID
 *
 * @async
 * @function remove
 * @param {number|string} id - User ID
 * @returns {Promise<Object>} Deletion result message
 */
async function remove(id) {
  const result = await db.query(`DELETE FROM users WHERE user_id=?`, [id]);

  return {
    message: result.affectedRows
      ? "User deleted successfully"
      : "No user deleted"
  };
}

module.exports = { getMultiple, getById, create, update, remove };
