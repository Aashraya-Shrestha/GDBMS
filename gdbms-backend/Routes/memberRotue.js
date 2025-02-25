const express = require("express");
const router = express.Router();
const memberController = require("../Controllers/memberController");
const auth = require("../Auth/auth");

router.get("/all-members", auth, memberController.getAllMember);
router.post("/add-members", auth, memberController.addMember);

module.exports = router;
