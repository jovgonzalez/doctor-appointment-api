// config.js
// Central configuration file (DB + pagination)
const config = {
  db: {
    host: "localhost",
    user: "root",
    password: "root",
    database: "doctor_appointment_db",
    connectTimeout: 60000
  },
  listPerPage: 20,
};

module.exports = config;
