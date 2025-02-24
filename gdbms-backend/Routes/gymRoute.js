const express = require("express");
const router = express.Router();
const gymController = require("../Controllers/gymController");

router.post("/register", gymController.register);
router.post("/login", gymController.login);
router.post("/reset-password/sendOTP", gymController.sendOTP);
router.post("/reset-password/checkOTP", gymController.checkOTP);
router.post("/reset-password", gymController.resetPassword);
router.post("/logout", gymController.logout);

module.exports = router;
