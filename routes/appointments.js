const express = require("express");
const router = express.Router();
const appointments = require("../services/appointments");

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management APIs
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get a paginated list of appointments
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get("/", async (req, res, next) => {
  try { 
    res.json(await appointments.getMultiple(req.query.page)); 
  }
  catch (err) { 
    console.error("Error while getting appointments", err.message); 
    next(err); 
  }
});

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 */
router.get("/:id", async (req, res, next) => {
  try { 
    res.json((await appointments.getById(req.params.id)) || {}); 
  }
  catch (err) { 
    console.error("Error while getting appointment by id", err.message); 
    next(err); 
  }
});

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment booked successfully
 */
router.post("/", async (req, res, next) => {
  try { 
    res.json(await appointments.book(req.body)); 
  }
  catch (err) { 
    console.error("Error while booking appointment", err.message); 
    next(err); 
  }
});

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   put:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Patient unavailable
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 */
router.put("/:id/cancel", async (req, res, next) => {
  try { 
    res.json(await appointments.cancel(req.params.id, req.body)); 
  }
  catch (err) { 
    console.error("Error while cancelling appointment", err.message); 
    next(err); 
  }
});

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: Completed
 *     responses:
 *       200:
 *         description: Appointment status updated
 */
router.put("/:id/status", async (req, res, next) => {
  try { 
    res.json(await appointments.updateStatus(req.params.id, req.body)); 
  }
  catch (err) { 
    console.error("Error while updating appointment status", err.message); 
    next(err); 
  }
});

module.exports = router;
