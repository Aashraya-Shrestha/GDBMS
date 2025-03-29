const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["hasnt checked in", "present", "absent"],
    default: "hasnt checked in",
  },
});

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
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
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
      type: String,
    },
    attendance: [attendanceSchema], // Array of daily attendance records
    currentMonthAttendance: {
      type: Map,
      of: String, // "hasnt checked in", "present", "absent"
      default: {},
    },
    freeze: {
      isFrozen: { type: Boolean, default: false },
      freezeStartDate: { type: Date },
      freezeEndDate: { type: Date },
      freezeReason: { type: String },
      originalNextBillDate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const memberModal = mongoose.model("members", memberSchema);

module.exports = memberModal;
