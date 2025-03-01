const Gym = require("../Modals/gym");
const bcrypt = require("bcryptjs");
const { error } = require("console");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
      console.log(gymName, username, email, password);
      newGym = new Gym({ gymName, username, email, password: hashPassword });
      await newGym.save();

      res.status(201).json({
        message: "Sucessfully Registered",
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

      const maileOptions = {
        from: "aashraya8@gmail.com",
        to: email,
        subject: "Password reset",
        text: `You have requested a password reset, your OTP is: ${token}`,
      };

      transporter.sendMail(maileOptions, (error, info) => {
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

exports.logout = async (req, res) => {
  res
    .clearCookie("cookie_token", cookieOptions)
    .json({ message: "You have logged out successfully " });
};
