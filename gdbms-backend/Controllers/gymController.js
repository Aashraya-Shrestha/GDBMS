const Gym = require("../Modals/gym");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register a new gym
exports.register = async (req, res) => {
  try {
    const { gymName, username, email, password } = req.body;

    const isExist = await Gym.findOne({ email });

    if (isExist) {
      res.status(400).json({
        error: "Email already in use, try another email",
      });
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const newGym = new Gym({
        gymName,
        username,
        email,
        password: hashPassword,
      });
      await newGym.save();

      res.status(201).json({
        message: "Successfully Registered",
        success: "yes",
        data: newGym,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
// Login a gym
const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const gym = await Gym.findOne({ email });

    if (gym && (await bcrypt.compare(password, gym.password))) {
      const token = jwt.sign({ gym_id: gym._id }, process.env.JWT_SECRET);
      res.cookie("cookie_token", token, cookieOptions);

      res
        .status(201)
        .json({ message: "Logged in Successfully", success: true, gym, token });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
// Send OTP for password reset
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const gym = await Gym.findOne({ email });

    if (gym) {
      const buffer = crypto.randomBytes(4);
      const token = (buffer.readUInt32BE(0) % 900000) + 100000;

      gym.resetPasswordToken = token;
      gym.resetPasswordExpires = Date.now() + 600000;

      await gym.save();

      const mailOptions = {
        from: "aashraya8@gmail.com",
        to: email,
        subject: "Password reset",
        text: `You have requested a password reset, your OTP is: ${token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ error: "Server Error", errMsg: error });
        } else {
          res.status(200).json({ message: "OTP has been sent to your mail" });
        }
      });
    } else {
      res.status(400).json("Email not found");
    }
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
// Check OTP for password reset
exports.checkOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const gym = await Gym.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!gym) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }
    res.status(200).json({ message: "OTP has been successfully verified" });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const gym = await Gym.findOne({ email });

    if (!email) {
      return res
        .status(400)
        .json({ message: "Some technical issue, please try again later" });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    gym.password = hashPassword;
    gym.resetPasswordToken = undefined;
    gym.resetPasswordExpires = undefined;

    await gym.save();
    res.status(200).json({ message: "Your password has successfully changed" });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
// Logout a gym
exports.logout = async (req, res) => {
  res
    .clearCookie("cookie_token", cookieOptions)
    .json({ message: "You have logged out successfully " });
};

// Get logged-in gym's details
exports.getLoggedInGym = async (req, res) => {
  try {
    // Fetch the gym details using the gym ID from the request (set by the auth middleware)
    const gym = await Gym.findById(req.gym._id).select("-password"); // Exclude the password field

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    res.status(200).json({
      message: "Gym details fetched successfully",
      gym,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Edit logged-in gym's details
exports.editLoggedInGym = async (req, res) => {
  try {
    const { gymName, username, email } = req.body;

    // Find the logged-in gym using the gym ID from the request (set by the auth middleware)
    const gym = await Gym.findById(req.gym._id);

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    // Check if the new email is already taken by another gym
    if (email && email !== gym.email) {
      const existingGym = await Gym.findOne({ email });
      if (existingGym) {
        return res.status(409).json({ error: "Email is already in use" });
      }
    }

    // Update the gym's details
    gym.gymName = gymName || gym.gymName;
    gym.username = username || gym.username;
    gym.email = email || gym.email;

    await gym.save();

    res.status(200).json({
      message: "Gym details updated successfully",
      gym,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Delete logged-in gym's account
exports.deleteLoggedInGym = async (req, res) => {
  try {
    // Find the logged-in gym using the gym ID from the request (set by the auth middleware)
    const gym = await Gym.findById(req.gym._id);

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    // Delete the gym's account
    await Gym.findByIdAndDelete(req.gym._id);

    // Clear the cookie (if using cookies for authentication)
    res.clearCookie("cookie_token", cookieOptions);

    res.status(200).json({
      message: "Gym account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
