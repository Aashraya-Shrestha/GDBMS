const mongoose = require("mongoose");

const gymSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    gymName: {
      type: String,
      required: true,
    },
    uername: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const modal = mongoose.mode("gym", gymSchema);

module.exports = modal;
