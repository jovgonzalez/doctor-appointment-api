const express = require("express");
const router = express.Router();
const users = require("../services/users");

router.get("/", async (req, res, next) => {
  try { res.json(await users.getMultiple(req.query.page)); }
  catch (err) { console.error("Error while getting users", err.message); next(err); }
});

router.get("/:id", async (req, res, next) => {
  try { res.json((await users.getById(req.params.id)) || {}); }
  catch (err) { console.error("Error while getting user by id", err.message); next(err); }
});

router.post("/", async (req, res, next) => {
  try { res.json(await users.create(req.body)); }
  catch (err) { console.error("Error while creating user", err.message); next(err); }
});

router.put("/:id", async (req, res, next) => {
  try { res.json(await users.update(req.params.id, req.body)); }
  catch (err) { console.error("Error while updating user", err.message); next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try { res.json(await users.remove(req.params.id)); }
  catch (err) { console.error("Error while deleting user", err.message); next(err); }
});

module.exports = router;
