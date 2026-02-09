const express = require("express");
const router = express.Router();
const patients = require("../services/patients");

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management APIs
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get a paginated list of patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Page number (default is 1)
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 */
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
    res.json(await patients.getMultiple(page));
  } catch (err) {
    console.error("Error while getting patients", err.message);
    next(err);
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 */
router.get("/:id", async (req, res, next) => {
  try {
    const row = await patients.getById(req.params.id);
    res.json(row || {});
  } catch (err) {
    console.error("Error while getting patient by id", err.message);
    next(err);
  }
});

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       200:
 *         description: Patient created successfully
 */
router.post("/", async (req, res, next) => {
  try {
    res.json(await patients.create(req.body));
  } catch (err) {
    console.error("Error while creating patient", err.message);
    next(err);
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update an existing patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 */
router.put("/:id", async (req, res, next) => {
  try {
    res.json(await patients.update(req.params.id, req.body));
  } catch (err) {
    console.error("Error while updating patient", err.message);
    next(err);
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 */
router.delete("/:id", async (req, res, next) => {
  try {
    res.json(await patients.remove(req.params.id));
  } catch (err) {
    console.error("Error while deleting patient", err.message);
    next(err);
  }
});

module.exports = router;
