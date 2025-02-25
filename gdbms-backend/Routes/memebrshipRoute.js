const express = require("express");
const router = express.Router();
const memebrshipController = require("../Controllers/memebrshipController");
const auth = require("../Auth/auth");

router.post("/add-membership", auth, memebrshipController.addMemberships);
router.get("/get-membership", auth, memebrshipController.getMemberships);

module.exports = router;
