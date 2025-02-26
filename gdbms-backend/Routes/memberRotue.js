const express = require("express");
const router = express.Router();
const memberController = require("../Controllers/memberController");
const auth = require("../Auth/auth");

router.get("/all-members", auth, memberController.getAllMember);
router.post("/add-members", auth, memberController.addMember);

router.get("/monthly-members", auth, memberController.monthlyMembers);
router.get(
  "/expiring-within-3-days",
  auth,
  memberController.expiringWithin3Days
);
router.get(
  "/expiring-within-4to7-days",
  auth,
  memberController.expiringWithin4to7days
);

router.get("/expiredMemberships", auth, memberController.expiredMemberships);
module.exports = router;
