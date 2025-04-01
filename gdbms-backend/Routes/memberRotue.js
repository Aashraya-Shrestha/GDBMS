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
router.get("/inactiveMembers", auth, memberController.inactiveMembers);
router.get("/member-detail/:id", auth, memberController.getMemberDetail);
router.put("/changeStatus/:id", auth, memberController.changeStatus);
router.post("/updatePlan/:id", auth, memberController.updateMemberPlan);
router.put("/editMember/:id", auth, memberController.editMember);

// Attendance routes
router.post("/mark-attendance/:id", auth, memberController.markAttendance);
router.get("/attendance/:id", auth, memberController.getMemberAttendance);
router.get("/todays-attendance", auth, memberController.getTodaysAttendance);
router.post("/bulk-attendance", auth, memberController.bulkUpdateAttendance);
router.get(
  "/analyze-top-attendee-renewal",
  auth,
  memberController.analyzeTopAttendeeRenewal
);
router.post("/scan-qr", memberController.scanQRCode);

router.post("/freeze-account/:id", auth, memberController.freezeAccount);
router.post("/unfreeze-account/:id", auth, memberController.unfreezeAccount);

module.exports = router;
