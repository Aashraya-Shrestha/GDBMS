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
    const { name, address, phoneNumber, membership, joiningDate } = req.body;
    const member = await Member.findOne({ gym: req.gym._id, phoneNumber });
    if (member) {
      return res.status(409).json({
        error: "A member has alrady been registered with this number",
      });
    }
    const memberShip = await Membership.findOne({
      _id: membership,
      gym: req.gym._id,
    });
    const membershipMonth = memberShip.months;
    if (memberShip) {
      let joinDate = new Date(joiningDate);
      const nextBillDate = addMonthsToDate(membershipMonth, joinDate);
      let newMember = new Member({
        name,
        address,
        phoneNumber,
        membership,
        gym: req.gym._id,
        nextBillDate,
      });
      await newMember.save();
      res
        .status(200)
        .json({ message: "Member has been successfylly added", newMember });
    } else {
      return res.status(409).json({
        error: "No such membreship exists",
      });
    }
  } catch (err) {
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
