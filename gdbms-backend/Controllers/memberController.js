const Member = require("../Modals/member");
const Membership = require("../Modals/membership");
const qr = require("qr-image");
const axios = require("axios");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send QR code email
const sendQRCodeEmail = async (email, name, qrCodeUrl) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Your Gym Membership QR Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Our Gym, ${name}!</h2>
          <p>Your membership QR code is attached below. Please present this QR code when checking in at the gym.</p>
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCodeUrl}" alt="Membership QR Code" style="max-width: 200px;"/>
          </div>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br/>The Gym Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending QR code email:", error);
    return { success: false, error: "Failed to send email" };
  }
};

exports.getAllMember = async (req, res) => {
  try {
    const members = await Member.find({ gym: req.gym._id });
    const totalMembers = members.length;

    res.status(200).json({
      message: members.length
        ? "Members fetched successfully"
        : "No memebrs have been added yet",
      members: members,
      totalMembers: totalMembers,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { name, address, phoneNumber, email, membership, joiningDate } =
      req.body;

    // Check if a member with the same phone number or email already exists
    const existingMember = await Member.findOne({
      gym: req.gym._id,
      $or: [{ phoneNumber }, { email }],
    });

    if (existingMember) {
      if (existingMember.phoneNumber === phoneNumber) {
        return res.status(409).json({
          error: "A member has already been registered with this number",
        });
      }
      if (existingMember.email === email) {
        return res.status(409).json({
          error: "A member has already been registered with this email",
        });
      }
    }

    // Check if the selected membership exists
    const memberShip = await Membership.findOne({
      _id: membership,
      gym: req.gym._id,
    });

    if (!memberShip) {
      return res.status(409).json({
        error: "No such membership exists",
      });
    }

    // Parse the joiningDate from the request body
    const parsedJoiningDate = new Date(joiningDate);

    // Calculate the nextBillDate
    const membershipMonth = memberShip.months;
    const nextBillDate = addMonthsToDate(membershipMonth, parsedJoiningDate);

    // Create the new member
    const newMember = new Member({
      name,
      address,
      phoneNumber,
      email,
      membership,
      gym: req.gym._id,
      joiningDate: parsedJoiningDate,
      lastPayment: parsedJoiningDate,
      nextBillDate,
    });

    // Save the new member to the database
    await newMember.save();

    // Generate QR code
    const qrCodeData = JSON.stringify({
      memberId: newMember._id,
      name: newMember.name,
      phoneNumber: newMember.phoneNumber,
      email: newMember.email,
      gymId: newMember.gym,
    });

    const qrCode = qr.imageSync(qrCodeData, { type: "png" });

    // Upload the QR code to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(qrCode);

    // Save the Cloudinary URL in the member document
    newMember.qrCodeUrl = cloudinaryUrl;
    await newMember.save();

    // Send email with QR code
    const emailResult = await sendQRCodeEmail(email, name, cloudinaryUrl);
    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Continue even if email fails
    }

    res.status(200).json({
      message: "Member has been successfully added",
      newMember,
      qrCodeUrl: cloudinaryUrl,
      emailSent: emailResult.success,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Function to upload QR code to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  try {
    const data = new FormData();
    data.append(
      "file",
      `data:image/png;base64,${fileBuffer.toString("base64")}`
    );
    data.append("upload_preset", "gym-management"); // Replace with your Cloudinary upload preset
    data.append("folder", "qr-codes"); // Optional: Organize QR codes in a folder

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dilliqjeq/image/upload", // Replace with your Cloudinary cloud name
      data
    );

    return response.data.secure_url; // Return the uploaded image URL
  } catch (err) {
    console.error("Error uploading QR code to Cloudinary:", err);
    throw new Error("Failed to upload QR code to Cloudinary");
  }
};

exports.monthlyMembers = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ); // End of the current month

    // Fetch members who joined this month
    const members = await Member.find({
      gym: req.gym._id,
      joiningDate: {
        $gte: startOfMonth, // Joining date is greater than or equal to the start of the month
        $lte: endOfMonth, // Joining date is less than or equal to the end of the month
      },
    }).sort({ joiningDate: -1 }); // Sort by joiningDate in descending order

    res.status(200).json({
      message: members.length
        ? "Members fetched successfully"
        : "No members have joined this month",
      members: members,
      totalMembers: members.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
exports.expiringWithin3Days = async (req, res) => {
  const today = new Date();
  const nextThreeDays = new Date();
  nextThreeDays.setDate(today.getDate() + 3);

  const member = await Member.find({
    gym: req.gym._id,
    nextBillDate: {
      $gte: today,
      $lte: nextThreeDays,
    },
  });
  res.status(200).json({
    message: member.length
      ? "Members fetched successfully"
      : "No memebrship expires in the next 3 days",
    members: member,
    totalMembers: member.length,
  });
};

exports.expiringWithin4to7days = async (req, res) => {
  try {
    const today = new Date();
    const next4days = new Date();
    next4days.setDate(today.getDate() + 4);
    next7days = new Date();
    next7days.setDate(today.getDate() + 7);

    const member = await Member.find({
      gym: req.gym._id,
      nextBillDate: {
        $gte: next4days,
        $lte: next7days,
      },
    });
    res.status(200).json({
      message: member.length
        ? "Members fetched successfully"
        : "No memebrship expires in the next 4 to 7 days",
      members: member,
      totalMembers: member.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.expiredMemberships = async (req, res) => {
  try {
    const today = new Date();
    const member = await Member.find({
      gym: req.gym._id,
      status: "Active",
      nextBillDate: {
        $lt: today,
      },
    });
    res.status(200).json({
      message: member.length
        ? "Members fetched successfully"
        : "No expired membership",
      members: member,
      totalMembers: member.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.inactiveMembers = async (req, res) => {
  try {
    const member = await Member.find({ gym: req.gym._id, status: "Inactive" });

    res.status(200).json({
      message: member.length
        ? "Members fetched successfully"
        : "No inactive members",
      members: member,
      totalMembers: member.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.getMemberDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(409).json({
        error: "No such member found",
      });
    }

    // Fetch membership details to display the membership type
    const membership = await Membership.findById(member.membership);

    // Calculate the membership duration
    const membershipType = `${membership.months} ${
      membership.months === 1 ? "Month" : "Months"
    }`;

    res.status(200).json({
      message: "Member Fetched",
      member: {
        ...member.toObject(),
        membershipType, // Add membershipType to the member data
        qrCodeUrl: member.qrCodeUrl, // Include the QR code URL
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(409).json({
        message: "No such member found",
      });
    }

    member.status = status;

    await member.save();
    res.status(200).json({
      message: "Status changed successfully",
      member: member,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.updateMemberPlan = async (req, res) => {
  try {
    const { membership } = req.body;
    const { id } = req.params;

    const membershipData = await Membership.findOne({
      gym: req.gym._id,
      _id: membership,
    });

    if (!membershipData) {
      return res.status(404).json({ error: "No such membership found" });
    }

    const member = await Member.findOne({ gym: req.gym._id, _id: id });
    if (!member) {
      return res.status(404).json({ error: "No such member found" });
    }

    const renewalDate = new Date();
    const nextBillDate = addMonthsToDate(membershipData.months, renewalDate);

    // Calculate days late (if renewal is after the original nextBillDate)
    const daysLate =
      member.nextBillDate < renewalDate
        ? Math.ceil((renewalDate - member.nextBillDate) / (1000 * 60 * 60 * 24))
        : 0;

    // Add to renewal history
    member.renewalHistory = member.renewalHistory || [];
    member.renewalHistory.push({
      date: renewalDate,
      daysLate: daysLate,
      membership: membership,
    });

    member.membership = membership;
    member.nextBillDate = nextBillDate;
    member.lastPayment = renewalDate;
    member.status = "Active";

    await member.save();

    res.status(200).json({
      message: "Member renewed successfully",
      member,
      daysLate: daysLate,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.editMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, email, address, joiningDate } = req.body;

    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(404).json({ error: "No such member found" });
    }

    // Check if the new phone number is already taken by another member
    if (phoneNumber && phoneNumber !== member.phoneNumber) {
      const existingMember = await Member.findOne({
        gym: req.gym._id,
        phoneNumber,
      });
      if (existingMember) {
        return res
          .status(409)
          .json({ error: "A member with this phone number already exists" });
      }
    }

    // Update the member's details
    member.name = name || member.name;
    member.phoneNumber = phoneNumber || member.phoneNumber;
    member.email = email || member.email;
    member.address = address || member.address;

    // Update the joiningDate if provided
    if (joiningDate) {
      const parsedJoiningDate = new Date(joiningDate);
      member.joiningDate = parsedJoiningDate;

      // Recalculate the nextBillDate based on the new joiningDate
      const membership = await Membership.findById(member.membership);
      if (membership) {
        member.nextBillDate = addMonthsToDate(
          membership.months,
          parsedJoiningDate
        );
      }
    }

    await member.save();

    res.status(200).json({
      message: "Member details updated successfully",
      member,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

function addMonthsToDate(months, joiningDate) {
  // Ensure joiningDate is a Date object
  let today = joiningDate;

  // Get current year, month, and day
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // Months are 0-indexed
  const currentDay = today.getDate();

  // Calculate the new month and year
  const futureMonth = currentMonth + months;
  const futureYear = currentYear + Math.floor(futureMonth / 12);

  // Calculate the correct future month (modulus for month)
  const adjustedMonth = futureMonth % 12;

  // Set the date to the first of the future month
  const futureDate = new Date(futureYear, adjustedMonth, 1);

  // Get the last day of the future month
  const lastDayOfFutureMonth = new Date(
    futureYear,
    adjustedMonth + 1,
    0
  ).getDate();

  // Adjust the day if the current day exceeds the last day of the new month
  const adjustedDay = Math.min(currentDay, lastDayOfFutureMonth);

  // Set the final adjusted day
  futureDate.setDate(adjustedDay);

  return futureDate;
}

// Mark attendance for a member
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date } = req.body;

    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(404).json({ error: "No such member found" });
    }

    // Parse the date or use current date if not provided
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const dateKey = attendanceDate.toISOString().split("T")[0];

    // Update or create attendance record
    const existingAttendanceIndex = member.attendance.findIndex(
      (record) => new Date(record.date).toISOString().split("T")[0] === dateKey
    );

    if (existingAttendanceIndex >= 0) {
      member.attendance[existingAttendanceIndex].status = status;
    } else {
      member.attendance.push({
        date: attendanceDate,
        status: status,
      });
    }

    // Update current month attendance
    if (!member.currentMonthAttendance) {
      member.currentMonthAttendance = new Map();
    }
    member.currentMonthAttendance.set(dateKey, status);

    await member.save();

    res.status(200).json({
      message: "Attendance marked successfully",
      attendance: member.attendance,
      currentMonthAttendance: Object.fromEntries(member.currentMonthAttendance),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Get member attendance
exports.getMemberAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(404).json({ error: "No such member found" });
    }

    // Filter attendance for the requested month and year
    const filteredAttendance = member.attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === parseInt(month) &&
        recordDate.getFullYear() === parseInt(year)
      );
    });

    // Calculate attendance summary
    const presentDays = filteredAttendance.filter(
      (a) => a.status === "present"
    ).length;
    const absentDays = filteredAttendance.filter(
      (a) => a.status === "absent"
    ).length;
    const totalDays = filteredAttendance.length;

    res.status(200).json({
      message: "Attendance fetched successfully",
      attendance: filteredAttendance,
      summary: {
        presentDays,
        absentDays,
        totalDays,
        attendanceRate:
          totalDays > 0
            ? ((presentDays / totalDays) * 100).toFixed(2) + "%"
            : "0%",
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Get all members' attendance for today
exports.getTodaysAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const members = await Member.find({ gym: req.gym._id }).populate(
      "membership"
    );

    const todaysAttendance = members.map((member) => {
      const todayRecord = member.attendance.find((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= today && recordDate < tomorrow;
      });

      return {
        _id: member._id,
        name: member.name,
        membershipType: member.membership?.name || "N/A",
        status: todayRecord ? todayRecord.status : "hasnt checked in",
        lastCheckedIn: todayRecord?.date || null,
      };
    });

    res.status(200).json({
      message: "Today's attendance fetched successfully",
      attendance: todaysAttendance,
      date: today,
      totalMembers: members.length,
      presentCount: todaysAttendance.filter((a) => a.status === "present")
        .length,
      absentCount: todaysAttendance.filter((a) => a.status === "absent").length,
      notCheckedCount: todaysAttendance.filter(
        (a) => a.status === "hasnt checked in"
      ).length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Bulk update attendance for multiple members
exports.bulkUpdateAttendance = async (req, res) => {
  try {
    const { date, updates } = req.body; // updates: [{ memberId, status }]

    const attendanceDate = date ? new Date(date) : new Date();
    const dateKey = attendanceDate.toISOString().split("T")[0];

    const bulkOps = updates.map((update) => {
      return {
        updateOne: {
          filter: {
            _id: update.memberId,
            gym: req.gym._id,
          },
          update: {
            $set: {
              "attendance.$[elem].status": update.status,
              [`currentMonthAttendance.${dateKey}`]: update.status,
            },
          },
          arrayFilters: [
            {
              "elem.date": {
                $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
                $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
              },
            },
          ],
          upsert: true,
        },
      };
    });

    await Member.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Bulk attendance updated successfully",
      updatedCount: updates.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.analyzeTopAttendeeRenewal = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const members = await Member.find({
      gym: req.gym._id,
      status: "Active",
    }).populate("membership");

    if (!members.length) {
      return res.status(200).json({
        message: "No active members found to analyze",
        topAttendee: null,
      });
    }

    const analyzedMembers = await Promise.all(
      members.map(async (member) => {
        const recentAttendance = member.attendance.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= threeMonthsAgo && record.status === "present";
        });

        const analysisStartDate =
          member.joiningDate > threeMonthsAgo
            ? member.joiningDate
            : threeMonthsAgo;

        const daysInAnalysisPeriod = Math.ceil(
          (new Date() - analysisStartDate) / (1000 * 60 * 60 * 24)
        );

        const attendanceRate =
          daysInAnalysisPeriod > 0
            ? (recentAttendance.length / daysInAnalysisPeriod) * 100
            : 0;

        // Calculate renewal consistency based on renewal history
        let renewalConsistency = "Consistent";
        let totalDaysLate = 0;
        let lateRenewals = 0;

        if (member.renewalHistory && member.renewalHistory.length > 0) {
          totalDaysLate = member.renewalHistory.reduce(
            (sum, renewal) => sum + renewal.daysLate,
            0
          );

          lateRenewals = member.renewalHistory.filter(
            (renewal) => renewal.daysLate > 0
          ).length;

          const latePercentage =
            (lateRenewals / member.renewalHistory.length) * 100;

          if (latePercentage > 50) {
            renewalConsistency = "Often Late";
          } else if (latePercentage > 0) {
            renewalConsistency = "Occasionally Late";
          }
        }

        return {
          memberId: member._id,
          name: member.name,
          email: member.email,
          phoneNumber: member.phoneNumber,
          attendanceCount: recentAttendance.length,
          attendanceRate: parseFloat(attendanceRate.toFixed(2)),
          membershipStatus: member.status,
          membershipType: member.membership
            ? `${member.membership.months} ${
                member.membership.months === 1 ? "Month" : "Months"
              }`
            : "N/A",
          nextBillDate: member.nextBillDate,
          joiningDate: member.joiningDate,
          daysSinceJoining: daysInAnalysisPeriod,
          renewalConsistency,
          renewalHistory: member.renewalHistory,
          totalRenewals: member.renewalHistory?.length || 0,
          lateRenewals,
          totalDaysLate,
          averageDaysLate: member.renewalHistory?.length
            ? (totalDaysLate / member.renewalHistory.length).toFixed(1)
            : 0,
          lastRenewalDate: member.renewalHistory?.length
            ? member.renewalHistory[member.renewalHistory.length - 1].date
            : null,
          daysLate: member.renewalHistory?.length
            ? member.renewalHistory[member.renewalHistory.length - 1].daysLate
            : 0,
        };
      })
    );

    const attendees = analyzedMembers.filter(
      (member) => member.attendanceCount > 0
    );

    if (!attendees.length) {
      return res.status(200).json({
        message: "No members with attendance records found",
        topAttendee: null,
      });
    }

    // Enhanced sorting - prioritize attendance, then renewal consistency
    attendees.sort((a, b) => {
      // First by attendance rate
      if (b.attendanceRate !== a.attendanceRate) {
        return b.attendanceRate - a.attendanceRate;
      }

      // Then by renewal consistency (consistent first)
      const consistencyOrder = {
        Consistent: 1,
        "Occasionally Late": 2,
        "Often Late": 3,
      };
      if (
        consistencyOrder[a.renewalConsistency] !==
        consistencyOrder[b.renewalConsistency]
      ) {
        return (
          consistencyOrder[a.renewalConsistency] -
          consistencyOrder[b.renewalConsistency]
        );
      }

      // Then by average days late (lower is better)
      return a.averageDaysLate - b.averageDaysLate;
    });

    const topAttendee = attendees[0];

    res.status(200).json({
      message: "Analysis completed successfully",
      topAttendee,
      analysisPeriod: {
        startDate: threeMonthsAgo,
        endDate: new Date(),
      },
      totalMembersAnalyzed: members.length,
      membersWithAttendance: attendees.length,
    });
  } catch (err) {
    console.error("Error in member analysis:", err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

// Helper function to calculate days late for last renewal
function calculateDaysLate(member) {
  if (!member.renewalHistory?.length) return 0;

  const lastRenewal = member.renewalHistory[member.renewalHistory.length - 1];
  const expectedDate = new Date(member.joiningDate);
  expectedDate.setMonth(expectedDate.getMonth() + member.membership.months);

  const daysLate = Math.ceil(
    (new Date(lastRenewal.date) - expectedDate) / (1000 * 60 * 60 * 24)
  );

  return daysLate > 0 ? daysLate : 0;
}
exports.freezeAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (member.freeze.isFrozen) {
      return res.status(400).json({ error: "Account is already frozen" });
    }

    member.freeze = {
      isFrozen: true,
      freezeStartDate: new Date(),
      freezeEndDate: null,
      freezeReason: reason,
      originalNextBillDate: member.nextBillDate,
      lastUnfreezeDate: member.freeze?.lastUnfreezeDate, // Preserve last unfreeze date
    };

    await member.save();

    res.status(200).json({
      message: "Account frozen successfully",
      member,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.unfreezeAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findOne({ _id: id, gym: req.gym._id });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (!member.freeze.isFrozen) {
      return res.status(400).json({ error: "Account is not frozen" });
    }

    const now = new Date();
    const freezeStart = new Date(member.freeze.freezeStartDate);

    // Check if this is a same-day unfreeze (within 24 hours)
    const isSameDayUnfreeze =
      now.getDate() === freezeStart.getDate() &&
      now.getMonth() === freezeStart.getMonth() &&
      now.getFullYear() === freezeStart.getFullYear();

    let newNextBillDate = new Date(member.freeze.originalNextBillDate);
    let frozenDays = 0;

    if (!isSameDayUnfreeze) {
      // Only add frozen days if it's not same-day unfreeze
      frozenDays = Math.ceil((now - freezeStart) / (1000 * 60 * 60 * 24));
      newNextBillDate.setDate(newNextBillDate.getDate() + frozenDays);
    }

    member.nextBillDate = newNextBillDate;
    member.freeze = {
      isFrozen: false,
      freezeStartDate: null,
      freezeEndDate: now,
      freezeReason: null,
      originalNextBillDate: null,
      lastUnfreezeDate: now,
    };

    await member.save();

    res.status(200).json({
      message: "Account unfrozen successfully",
      member,
      frozenDays: isSameDayUnfreeze ? 0 : frozenDays,
      newExpirationDate: newNextBillDate,
      wasSameDayUnfreeze: isSameDayUnfreeze,
    });
  } catch (err) {
    console.error("Error unfreezing account:", err);
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

cron.schedule(
  "0 23 * * *", // Run at 11:00 PM every day
  async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log(`Running daily attendance check at ${new Date()}`);

      // Find all active, non-frozen members
      const activeMembers = await Member.find({
        status: "Active",
        "freeze.isFrozen": false,
      });

      let markedAbsentCount = 0;

      for (const member of activeMembers) {
        // Check if member has any attendance record for today
        const todayAttendance = member.attendance.find((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= today && recordDate < tomorrow;
        });

        // If no record exists for today or record exists but status is 'hasnt checked in'
        if (!todayAttendance || todayAttendance.status === "hasnt checked in") {
          // If record doesn't exist, create new absent record
          if (!todayAttendance) {
            member.attendance.push({
              date: today,
              status: "absent",
            });
          }
          // If record exists and is 'hasnt checked in', update to 'absent'
          else {
            todayAttendance.status = "absent";
          }

          // Update current month attendance map
          const dateKey = today.toISOString().split("T")[0];
          if (!member.currentMonthAttendance) {
            member.currentMonthAttendance = new Map();
          }
          member.currentMonthAttendance.set(dateKey, "absent");

          await member.save();
          markedAbsentCount++;
          console.log(
            `Marked member ${member.name} as absent for ${today.toDateString()}`
          );
        }
      }

      console.log(
        `Daily attendance check completed. Marked ${markedAbsentCount} members as absent.`
      );
    } catch (error) {
      console.error("Error in daily attendance check:", error);
    }
  },
  {
    timezone: "Asia/Kathmandu", // Adjust to your timezone
  }
);
