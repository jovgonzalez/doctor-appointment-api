const express = require("express");
const router = express.Router();
const doctorAvailability = require("../services/doctorAvailability");

/**
 * @swagger
 * /doctor_availability:
 *   get:
 *     summary: Get doctor availability list
 *     tags: [Doctor Availability]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of doctor availability records
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res, next) => {
  try { res.json(await doctorAvailability.getMultiple(req.query.page)); }
  catch (err) { console.error("Error while getting availability", err.message); next(err); }
});

/**
 * @swagger
 * /doctor_availability/{id}:
 *   get:
 *     summary: Get doctor availability by ID
 *     tags: [Doctor Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Availability ID
 *     responses:
 *       200:
 *         description: Doctor availability record
 *       404:
 *         description: Availability not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res, next) => {
  try { res.json((await doctorAvailability.getById(req.params.id)) || {}); }
  catch (err) { console.error("Error while getting availability by id", err.message); next(err); }
});

/**
 * @swagger
 * /doctor_availability:
 *   post:
 *     summary: Create doctor availability
 *     tags: [Doctor Availability]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - availableDate
 *               - startTime
 *               - endTime
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 example: 5
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-15
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       200:
 *         description: Availability created successfully
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res, next) => {
  try { res.json(await doctorAvailability.create(req.body)); }
  catch (err) { console.error("Error while creating availability", err.message); next(err); }
});

/**
 * @swagger
 * /doctor_availability/{id}:
 *   put:
 *     summary: Update doctor availability
 *     tags: [Doctor Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Availability ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-15
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 example: "18:00"
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res, next) => {
  try { res.json(await doctorAvailability.update(req.params.id, req.body)); }
  catch (err) { console.error("Error while updating availability", err.message); next(err); }
});

/**
 * @swagger
 * /doctor_availability/{id}:
 *   delete:
 *     summary: Delete doctor availability
 *     tags: [Doctor Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Availability ID
 *     responses:
 *       200:
 *         description: Availability deleted successfully
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res, next) => {
  try { res.json(await doctorAvailability.remove(req.params.id)); }
  catch (err) { console.error("Error while deleting availability", err.message); next(err); }
});

module.exports = router;
