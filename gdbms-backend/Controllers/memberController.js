const Member = require("../Modals/member");
const Membership = require("../Modals/membership");

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
    const { name, address, phoneNumber, membership } = req.body;

    const member = await Member.findOne({ gym: req.gym._id, phoneNumber });
    if (member) {
      return res.status(409).json({
        error: "A member has already been registered with this number",
      });
    }

    const memberShip = await Membership.findOne({
      _id: membership,
      gym: req.gym._id,
    });

    if (!memberShip) {
      return res.status(409).json({
        error: "No such membership exists",
      });
    }

    const membershipMonth = memberShip.months; // The number of months in the membership
    const today = new Date();
    const nextBillDate = addMonthsToDate(membershipMonth, today);

    const newMember = new Member({
      name,
      address,
      phoneNumber,
      membership,
      gym: req.gym._id,
      lastPayment: today,
      nextBillDate,
    });
    await newMember.save();

    res.status(200).json({
      message: "Member has been successfully added",
      newMember,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.monthlyMembers = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const member = await Member.find({
      gym: req.gym._id,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: member.length
        ? "Members fetched successfully"
        : "No memebrs have been added this month",
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
    const member = await Member.find({ gym: req.gym._id, status: "pending" });

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
    const memebrship = await Membership.findOne({
      gym: req.gym._id,
      _id: memebrship,
    });

    if (membership) {
      let getMonth = membership.months;
      let today = new Date();
      let nextBillDate = addMonthsToDate(getMonth, today);
      const member = await Member.findOne({ gym: req.gym._id, _id: id });
      if (!member) {
        return res.status(409).json({ error: "No such member found" });
      }
      member.nextBillDate = nextBillDate;
      member.lastPayment = today;
      await member.save();

      res.status(200).json({ message: "Member renewed successfully" });
    } else {
      return res.status(409).json({ message: "No membership found" });
    }
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
