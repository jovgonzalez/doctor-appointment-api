// index.js
// Main Express server: registers routers + error handler

const express = require("express");
const app = express();
const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const yaml = require("js-yaml");
const path = require("path");

// Routers
const patientsRouter = require("./routes/patients");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");
const usersRouter = require("./routes/users");
const doctorAvailabilityRouter = require("./routes/doctorAvailability");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- Swagger Configuration -------------------- */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doctor Appointment API",
      version: "1.0.0",
      description: "REST API documentation for Doctor Appointment System",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],

    /* ---------- Schemas ---------- */
    components: {
      schemas: {

        /* ---------------- User Schemas ---------------- */
        User: {
          type: "object",
          properties: {
            user_id: { type: "integer", example: 1 },
            username: { type: "string", example: "jdoe" },
            role: {
              type: "string",
              enum: ["PATIENT", "DOCTOR", "ADMIN"],
              example: "PATIENT"
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2026-02-01T10:00:00Z"
            }
          }
        },

        UserInput: {
          type: "object",
          required: ["username", "password_hash", "role"],
          properties: {
            username: {
              type: "string",
              example: "jdoe"
            },
            password_hash: {
              type: "string",
              example: "$2b$10$hashedpasswordexample"
            },
            role: {
              type: "string",
              enum: ["PATIENT", "DOCTOR", "ADMIN"],
              example: "PATIENT"
            }
          }
        },

        UserUpdate: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "jdoe_updated"
            },
            password_hash: {
              type: "string",
              example: "$2b$10$newhashedpassword"
            },
            role: {
              type: "string",
              enum: ["PATIENT", "DOCTOR", "ADMIN"],
              example: "ADMIN"
            }
          }
        },

        /* ---------------- Patient Schemas ---------------- */
        Patient: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            email: { type: "string", example: "john.doe@email.com" },
            phone: { type: "string", example: "555-123-4567" },
            dateOfBirth: { type: "string", format: "date", example: "1990-05-15" },
            createdAt: { type: "string", format: "date-time", example: "2024-01-10T10:30:00Z" },
            updatedAt: { type: "string", format: "date-time", example: "2024-01-15T14:45:00Z" }
          }
        },

        PatientInput: {
          type: "object",
          required: ["firstName", "lastName"],
          properties: {
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            email: { type: "string", example: "john.doe@email.com" },
            phone: { type: "string", example: "555-123-4567" },
            dateOfBirth: { type: "string", format: "date", example: "1990-05-15" }
          }
        },

        /* ---------------- Doctor Schemas ---------------- */
        Doctor: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            firstName: { type: "string", example: "Sarah" },
            lastName: { type: "string", example: "Smith" },
            specialty: { type: "string", example: "Cardiology" },
            email: { type: "string", example: "sarah.smith@hospital.com" },
            phone: { type: "string", example: "555-222-3333" },
            createdAt: { type: "string", format: "date-time", example: "2026-01-01T09:00:00Z" },
            updatedAt: { type: "string", format: "date-time", example: "2026-01-02T10:00:00Z" }
          }
        },

        DoctorInput: {
          type: "object",
          required: ["firstName", "lastName", "specialty"],
          properties: {
            firstName: { type: "string", example: "Sarah" },
            lastName: { type: "string", example: "Smith" },
            specialty: { type: "string", example: "Dermatology" },
            email: { type: "string", example: "sarah.smith@hospital.com" },
            phone: { type: "string", example: "555-222-3333" }
          }
        },

        DoctorSchedule: {
          type: "object",
          properties: {
            doctorId: { type: "integer", example: 5 },
            appointments: {
              type: "array",
              items: { $ref: "#/components/schemas/Appointment" }
            }
          }
        },

        /* ---------------- Appointment Schemas ---------------- */
        Appointment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 101 },
            patientId: { type: "integer", example: 1 },
            doctorId: { type: "integer", example: 5 },
            appointmentDate: { type: "string", format: "date-time", example: "2026-03-10T14:00:00Z" },
            reason: { type: "string", example: "Annual physical checkup" },
            status: {
              type: "string",
              enum: ["BOOKED", "CANCELLED", "COMPLETED"],
              example: "BOOKED"
            },
            notes: { type: "string", example: "Patient requested morning appointment" },
            createdAt: { type: "string", format: "date-time", example: "2026-02-01T10:00:00Z" },
            updatedAt: { type: "string", format: "date-time", example: "2026-02-01T10:30:00Z" }
          }
        },

        AppointmentInput: {
          type: "object",
          required: ["patientId", "doctorId", "appointmentDate"],
          properties: {
            patientId: { type: "integer", example: 1 },
            doctorId: { type: "integer", example: 5 },
            appointmentDate: { type: "string", format: "date-time", example: "2026-03-10T14:00:00Z" },
            reason: { type: "string", example: "Routine checkup" },
            notes: { type: "string", example: "First visit" }
          }
        },

        AppointmentStatusUpdate: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["BOOKED", "CANCELLED", "COMPLETED"],
              example: "COMPLETED"
            }
          }
        },

        AppointmentCancel: {
          type: "object",
          properties: {
            reason: { type: "string", example: "Patient unavailable" }
          }
        },

        /* ---------------- Doctor Availability Schemas ---------------- */
        DoctorAvailability: {
          type: "object",
          properties: {
            id: { type: "integer", example: 20 },
            doctorId: { type: "integer", example: 5 },
            availableDate: { type: "string", format: "date", example: "2026-03-15" },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "17:00" },
            createdAt: { type: "string", format: "date-time", example: "2026-01-01T09:00:00Z" },
            updatedAt: { type: "string", format: "date-time", example: "2026-01-02T10:00:00Z" }
          }
        },

        DoctorAvailabilityInput: {
          type: "object",
          required: ["doctorId", "availableDate", "startTime", "endTime"],
          properties: {
            doctorId: { type: "integer", example: 5 },
            availableDate: { type: "string", format: "date", example: "2026-03-15" },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "17:00" }
          }
        }

      }
    }
  },

  apis: [path.join(__dirname, "./routes/*.js")]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/* Swagger UI */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/openapi.yaml", (req, res) => {
  const yamlSpec = yaml.dump(swaggerSpec);
  res.setHeader("Content-Type", "text/yaml");
  res.send(yamlSpec);
});

/* -------------------- Routes -------------------- */

app.get("/", (req, res) => {
  res.json({ message: "Doctor Appointment API is running" });
});

app.use("/patients", patientsRouter);
app.use("/doctors", doctorsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/users", usersRouter);
app.use("/doctor_availability", doctorAvailabilityRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
});
