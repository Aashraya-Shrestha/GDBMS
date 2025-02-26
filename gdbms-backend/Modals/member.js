const mongoose = require("mongoose");

const memebrSchema = mongoose.Schema(
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

    lastPayment: {
      type: Date,
      default: new Date(),
    },

    nextBillDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const memberModal = mongoose.model("members", memebrSchema);

module.exports = memberModal;
