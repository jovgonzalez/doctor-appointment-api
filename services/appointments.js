const db = require("./db");
const helper = require("../helper");
const config = require("../config");

function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}

// List appointments
async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT appointment_id, patient_id, doctor_id, start_time, end_time, status, reason, cancel_reason
     FROM appointments
     ORDER BY start_time ASC
     LIMIT ?, ?`,
    [offset, config.listPerPage]
  );
  return { data: helper.emptyOrRows(rows), meta: { page: Number(page) } };
}

async function getById(id) {
  const rows = await db.query(
    `SELECT appointment_id, patient_id, doctor_id, start_time, end_time, status, reason, cancel_reason
     FROM appointments WHERE appointment_id = ?`,
    [id]
  );
  return rows.length ? rows[0] : null;
}

// Book Appointment API
async function book(a) {
  if (!a.patient_id || !a.doctor_id || !a.start_time || !a.end_time) {
    throw badRequest("patient_id, doctor_id, start_time, end_time are required");
  }

  // validate foreign keys
  const p = await db.query(`SELECT patient_id FROM patients WHERE patient_id=?`, [a.patient_id]);
  if (!p.length) throw badRequest("Invalid patient_id (patient not found)");

  const d = await db.query(`SELECT doctor_id FROM doctors WHERE doctor_id=?`, [a.doctor_id]);
  if (!d.length) throw badRequest("Invalid doctor_id (doctor not found)");

  // prevent time overlap (simple overlap rule)
  const conflicts = await db.query(
    `SELECT appointment_id FROM appointments
     WHERE doctor_id = ?
       AND status <> 'CANCELLED'
       AND (? < end_time) AND (? > start_time)
     LIMIT 1`,
    [a.doctor_id, a.start_time, a.end_time]
  );

  if (conflicts.length) {
    const err = new Error("Doctor is not available for the requested time slot");
    err.statusCode = 409;
    throw err;
  }

  const result = await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, start_time, end_time, status, reason)
     VALUES (?, ?, ?, ?, 'BOOKED', ?)`,
    [a.patient_id, a.doctor_id, a.start_time, a.end_time, a.reason || null]
  );

  return { message: "Appointment booked successfully", appointment_id: result.insertId };
}

// Cancel Appointment API
async function cancel(id, body) {
  const cancelReason = body?.cancel_reason || null;

  const result = await db.query(
    `UPDATE appointments SET status='CANCELLED', cancel_reason=? WHERE appointment_id=?`,
    [cancelReason, id]
  );

  return { message: result.affectedRows ? "Appointment cancelled successfully" : "No appointment cancelled" };
}

// Update Appointment Status API
async function updateStatus(id, body) {
  const allowed = new Set(["BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);
  const status = body?.status;

  if (!status || !allowed.has(status)) {
    throw badRequest("Valid status is required: BOOKED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW");
  }

  const result = await db.query(
    `UPDATE appointments SET status=? WHERE appointment_id=?`,
    [status, id]
  );

  return { message: result.affectedRows ? "Appointment status updated successfully" : "No appointment updated" };
}

// Fetch Doctor Schedule API
async function getDoctorSchedule(doctorId, from, to) {
  let sql = `
    SELECT appointment_id, patient_id, doctor_id, start_time, end_time, status, reason, cancel_reason
    FROM appointments
    WHERE doctor_id = ?
  `;
  const params = [doctorId];

  if (from && to) {
    sql += ` AND start_time BETWEEN ? AND ?`;
    params.push(`${from} 00:00:00`, `${to} 23:59:59`);
  } else {
    sql += ` AND start_time >= NOW() AND start_time <= DATE_ADD(NOW(), INTERVAL 30 DAY)`;
  }

  sql += ` ORDER BY start_time ASC`;

  const rows = await db.query(sql, params);

  return {
    doctor_id: Number(doctorId),
    range: from && to ? { from, to } : { from: "NOW", to: "NOW+30 days" },
    appointments: helper.emptyOrRows(rows)
  };
}

module.exports = {
  getMultiple,
  getById,
  book,
  cancel,
  updateStatus,
  getDoctorSchedule
};
