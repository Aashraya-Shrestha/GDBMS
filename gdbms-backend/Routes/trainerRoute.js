const express = require("express");
const router = express.Router();
const trainerController = require("../Controllers/trainerController");

router.get("/all-trainers", trainerController.getAllTrainers);
router.post("/addTrainer", trainerController.addTrainer);
router.get("/trainer-detail/:id", trainerController.getTrainerDetail);
router.put("/edit-trainer/:id", trainerController.editTrainer);
router.delete("/delete-trainer/:id", trainerController.deleteTrainer);

module.exports = router;
