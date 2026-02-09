const db = require("./db");
const helper = require("../helper");
const config = require("../config");

function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}


async function getMultiple(page = 1) {
  // Sanitize page to be an integer >= 1
  const pageNum = Math.max(parseInt(page ?? "1", 10) || 1, 1);

  // Sanitize listPerPage to be an integer >= 1
  const perPage = Math.max(parseInt(config.listPerPage ?? "20", 10) || 20, 1);

  // Compute offset locally (avoids NaN / undefined issues)
  const offset = (pageNum - 1) * perPage;

// Debug log (temporary)
console.log("getMultiple() debug => page:", pageNum, "perPage:", perPage, "offset:", offset);

  const rows = await db.query(
    `SELECT patient_id, first_name, last_name, date_of_birth, gender, phone, email, created_at
     FROM patients
     ORDER BY patient_id ASC
     LIMIT ?, ?`,
    [offset, perPage]
  );

  return { data: helper.emptyOrRows(rows), meta: { page: pageNum } };
}


async function getById(id) {
  const rows = await db.query(
    `SELECT patient_id, first_name, last_name, date_of_birth, gender, phone, email, created_at
     FROM patients WHERE patient_id = ?`,
    [id]
  );
  return rows.length ? rows[0] : null;
}

async function create(p) {
  if (!p.first_name || !p.last_name || !p.date_of_birth) {
    throw badRequest("first_name, last_name, date_of_birth are required");
  }

  const result = await db.query(
    `INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [p.first_name, p.last_name, p.date_of_birth, p.gender || null, p.phone || null, p.email || null]
  );

  return { message: "Patient created successfully", patient_id: result.insertId };
}

async function update(id, p) {
  const result = await db.query(
    `UPDATE patients
     SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?
     WHERE patient_id = ?`,
    [p.first_name || null, p.last_name || null, p.date_of_birth || null, p.gender || null, p.phone || null, p.email || null, id]
  );

  return { message: result.affectedRows ? "Patient updated successfully" : "No patient updated" };
}

async function remove(id) {
  const result = await db.query(`DELETE FROM patients WHERE patient_id = ?`, [id]);
  return { message: result.affectedRows ? "Patient deleted successfully" : "No patient deleted" };
}

module.exports = { getMultiple, getById, create, update, remove };
