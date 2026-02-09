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
    `SELECT availability_id, doctor_id, available_date, start_time, end_time
     FROM doctor_availability
     ORDER BY available_date ASC, start_time ASC
     LIMIT ?, ?`,
    [offset, config.listPerPage]
  );

  return { data: helper.emptyOrRows(rows), meta: { page: Number(page) } };
}

async function getById(id) {
  const rows = await db.query(
    `SELECT availability_id, doctor_id, available_date, start_time, end_time
     FROM doctor_availability WHERE availability_id=?`,
    [id]
  );
  return rows.length ? rows[0] : null;
}

async function create(s) {
  if (!s.doctor_id || !s.available_date || !s.start_time || !s.end_time) {
    throw badRequest("doctor_id, available_date, start_time, end_time are required");
  }
  if (s.start_time >= s.end_time) throw badRequest("start_time must be earlier than end_time");

  const d = await db.query(`SELECT doctor_id FROM doctors WHERE doctor_id=?`, [s.doctor_id]);
  if (!d.length) throw badRequest("Invalid doctor_id (doctor not found)");

  const result = await db.query(
    `INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time)
     VALUES (?, ?, ?, ?)`,
    [s.doctor_id, s.available_date, s.start_time, s.end_time]
  );

  return { message: "Availability slot created successfully", availability_id: result.insertId };
}

async function update(id, s) {
  const existing = await db.query(`SELECT * FROM doctor_availability WHERE availability_id=?`, [id]);
  if (!existing.length) {
    const err = new Error("Availability slot not found");
    err.statusCode = 404;
    throw err;
  }

  const cur = existing[0];
  const doctorId = s.doctor_id ?? cur.doctor_id;
  const availableDate = s.available_date ?? cur.available_date;
  const startTime = s.start_time ?? cur.start_time;
  const endTime = s.end_time ?? cur.end_time;

  if (startTime >= endTime) throw badRequest("start_time must be earlier than end_time");

  const result = await db.query(
    `UPDATE doctor_availability
     SET doctor_id=?, available_date=?, start_time=?, end_time=?
     WHERE availability_id=?`,
    [doctorId, availableDate, startTime, endTime, id]
  );

  return { message: result.affectedRows ? "Availability slot updated successfully" : "No availability updated" };
}

async function remove(id) {
  const result = await db.query(`DELETE FROM doctor_availability WHERE availability_id=?`, [id]);
  return { message: result.affectedRows ? "Availability slot deleted successfully" : "No availability deleted" };
}

// Used by GET /doctors/:id/availability?date=
async function getForDoctor(doctorId, date) {
  const d = await db.query(`SELECT doctor_id FROM doctors WHERE doctor_id=?`, [doctorId]);
  if (!d.length) throw badRequest("Invalid doctorId (doctor not found)");

  let sql = `
    SELECT availability_id, doctor_id, available_date, start_time, end_time
    FROM doctor_availability
    WHERE doctor_id = ?
  `;
  const params = [doctorId];

  if (date) {
    sql += ` AND available_date = ?`;
    params.push(date);
  } else {
    sql += ` AND available_date >= CURDATE()
             AND available_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`;
  }

  sql += ` ORDER BY available_date ASC, start_time ASC`;

  const rows = await db.query(sql, params);

  return {
    doctor_id: Number(doctorId),
    range: date ? { date } : { from: "TODAY", to: "TODAY+30 days" },
    availability: helper.emptyOrRows(rows)
  };
}

module.exports = { getMultiple, getById, create, update, remove, getForDoctor };
