const db = require("./db");
const helper = require("../helper");
const config = require("../config");

function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT doctor_id, first_name, last_name, specialty, phone, email, created_at
     FROM doctors ORDER BY doctor_id ASC LIMIT ?, ?`,
    [offset, config.listPerPage]
  );
  return { data: helper.emptyOrRows(rows), meta: { page: Number(page) } };
}

async function getById(id) {
  const rows = await db.query(
    `SELECT doctor_id, first_name, last_name, specialty, phone, email, created_at
     FROM doctors WHERE doctor_id = ?`,
    [id]
  );
  return rows.length ? rows[0] : null;
}

// Register Doctor API
async function create(d) {
  if (!d.first_name || !d.last_name || !d.specialty) {
    throw badRequest("first_name, last_name, specialty are required");
  }

  const result = await db.query(
    `INSERT INTO doctors (first_name, last_name, specialty, phone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [d.first_name, d.last_name, d.specialty, d.phone || null, d.email || null]
  );

  return { message: "Doctor registered successfully", doctor_id: result.insertId };
}

async function update(id, d) {
  const result = await db.query(
    `UPDATE doctors SET first_name=?, last_name=?, specialty=?, phone=?, email=? WHERE doctor_id=?`,
    [d.first_name || null, d.last_name || null, d.specialty || null, d.phone || null, d.email || null, id]
  );
  return { message: result.affectedRows ? "Doctor updated successfully" : "No doctor updated" };
}

async function remove(id) {
  const result = await db.query(`DELETE FROM doctors WHERE doctor_id = ?`, [id]);
  return { message: result.affectedRows ? "Doctor deleted successfully" : "No doctor deleted" };
}

module.exports = { getMultiple, getById, create, update, remove };
