const express = require("express");
const router = express.Router();
const doctors = require("../services/doctors");
const appointments = require("../services/appointments");
const doctorAvailability = require("../services/doctorAvailability");

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get list of doctors
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of doctors
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res, next) => {
  try { res.json(await doctors.getMultiple(req.query.page)); }
  catch (err) { console.error("Error while getting doctors", err.message); next(err); }
});

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res, next) => {
  try { res.json((await doctors.getById(req.params.id)) || {}); }
  catch (err) { console.error("Error while getting doctor by id", err.message); next(err); }
});

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - specialty
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Sarah
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               specialty:
 *                 type: string
 *                 example: Cardiology
 *               email:
 *                 type: string
 *                 example: sarah.smith@hospital.com
 *               phone:
 *                 type: string
 *                 example: 555-222-3333
 *     responses:
 *       200:
 *         description: Doctor created successfully
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res, next) => {
  try { res.json(await doctors.create(req.body)); }
  catch (err) { console.error("Error while creating doctor", err.message); next(err); }
});

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Sarah
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               specialty:
 *                 type: string
 *                 example: Neurology
 *               email:
 *                 type: string
 *                 example: sarah.smith@hospital.com
 *               phone:
 *                 type: string
 *                 example: 555-222-3333
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res, next) => {
  try { res.json(await doctors.update(req.params.id, req.body)); }
  catch (err) { console.error("Error while updating doctor", err.message); next(err); }
});

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res, next) => {
  try { res.json(await doctors.remove(req.params.id)); }
  catch (err) { console.error("Error while deleting doctor", err.message); next(err); }
});

/**
 * @swagger
 * /doctors/{id}/schedule:
 *   get:
 *     summary: Get doctor appointment schedule
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Doctor appointment schedule
 *       500:
 *         description: Server error
 */
router.get("/:id/schedule", async (req, res, next) => {
  try {
    res.json(await appointments.getDoctorSchedule(req.params.id, req.query.from, req.query.to));
  } catch (err) {
    console.error("Error while fetching doctor schedule", err.message);
    next(err);
  }
});

/**
 * @swagger
 * /doctors/{id}/availability:
 *   get:
 *     summary: Get doctor availability
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Availability date
 *     responses:
 *       200:
 *         description: Doctor availability schedule
 *       500:
 *         description: Server error
 */
router.get("/:id/availability", async (req, res, next) => {
  try {
    res.json(await doctorAvailability.getForDoctor(req.params.id, req.query.date));
  } catch (err) {
    console.error("Error while fetching doctor availability", err.message);
    next(err);
  }
});

module.exports = router;
