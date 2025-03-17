const Trainer = require("../Modals/trainer");
const gym = require("../Modals/gym");

exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({});
    const totalTrainers = trainers.length;

    res.status(200).json({
      message: trainers.length
        ? "Trainers fetched successfully"
        : "No trainers have been added yet",
      trainers: trainers,
      totalTrainers: totalTrainers,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.addTrainer = async (req, res) => {
  try {
    const {
      name,
      contact,
      experience,
      description,
      gym,
      imageUrl,
      joiningDate,
    } = req.body;

    // Check if a trainer with the same contact number already exists
    const trainer = await Trainer.findOne({ contact });
    if (trainer) {
      return res.status(409).json({
        error: "A trainer has already been registered with this contact number",
      });
    }

    // Create the new trainer
    const newTrainer = new Trainer({
      name,
      contact,
      experience,
      description,
      gym: gym || null, // Use the gym ID if provided, otherwise set to null
      imageUrl: imageUrl || null, // Use the image URL if provided, otherwise set to null
      joiningDate: joiningDate || new Date(), // Use the provided joining date or default to the current date
    });
    await newTrainer.save();

    res.status(200).json({
      message: "Trainer has been successfully added",
      newTrainer,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.getTrainerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findOne({ _id: id });
    if (!trainer) {
      return res.status(409).json({
        error: "No such trainer found",
      });
    }

    res.status(200).json({
      message: "Trainer Fetched",
      trainer: trainer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.editTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, experience, description, imageUrl, joiningDate } =
      req.body;

    const trainer = await Trainer.findOne({ _id: id });
    if (!trainer) {
      return res.status(404).json({ error: "No such trainer found" });
    }

    // Check if the new contact number is already taken by another trainer
    if (contact && contact !== trainer.contact) {
      const existingTrainer = await Trainer.findOne({ contact });
      if (existingTrainer) {
        return res
          .status(409)
          .json({ error: "A trainer with this contact number already exists" });
      }
    }

    // Update the trainer's details
    trainer.name = name || trainer.name;
    trainer.contact = contact || trainer.contact;
    trainer.experience = experience || trainer.experience;
    trainer.description = description || trainer.description;
    trainer.imageUrl = imageUrl || trainer.imageUrl;
    trainer.joiningDate = joiningDate || trainer.joiningDate; // Update joiningDate

    await trainer.save();

    res.status(200).json({
      message: "Trainer details updated successfully",
      trainer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
exports.deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findOneAndDelete({ _id: id });
    if (!trainer) {
      return res.status(404).json({ error: "No such trainer found" });
    }

    res.status(200).json({
      message: "Trainer deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
