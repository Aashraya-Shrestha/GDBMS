const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "membership",
      required: true,
    },
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "gym",
      required: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    joiningDate: {
      type: Date,
    },
    lastPayment: {
      type: Date,
      default: new Date(),
    },
    nextBillDate: {
      type: Date,
      required: true,
    },
    qrCodeUrl: {
      type: String, // Add this field to store the Cloudinary URL
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt
  }
);

const memberModal = mongoose.model("members", memberSchema);

module.exports = memberModal;
