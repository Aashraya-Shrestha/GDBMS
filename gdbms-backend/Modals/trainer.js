const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  experience: {
    type: Number,
  },
  description: {
    type: String,
  },
  joiningDate: {
    type: Date,
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "gym", // Optional reference to the gym
  },
});

const modalTrainer = mongoose.model("trainer", trainerSchema);

module.exports = modalTrainer;
