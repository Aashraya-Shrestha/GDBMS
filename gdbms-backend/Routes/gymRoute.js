const express = require("express");
const router = express.Router();
const gymController = require("../Controllers/gymController");
const auth = require("../Auth/auth");

// Public Routes
router.post("/register", gymController.register);
router.post("/login", gymController.login);
router.post("/reset-password/sendOTP", gymController.sendOTP);
router.post("/reset-password/checkOTP", gymController.checkOTP);
router.post("/reset-password", gymController.resetPassword);
router.post("/logout", gymController.logout);
router.post("/contact", gymController.sendContactMail);

// Protected Route (requires authentication)
router.get("/gymInfo", auth, gymController.getLoggedInGym); // Add this route
router.put("/editInfo", auth, gymController.editLoggedInGym); // Edit logged-in gym's details
router.delete("/deleteGym", auth, gymController.deleteLoggedInGym); // Edit logged-in gym's details

module.exports = router;
