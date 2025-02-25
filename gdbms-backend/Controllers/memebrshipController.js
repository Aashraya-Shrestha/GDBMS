const Membership = require("../Modals/membership");

exports.addMemberships = async (req, res) => {
  try {
    const { months, price } = req.body;
    const membership = await Membership.findOne({ gym: req.gym._id, months });
    if (membership) {
      membership.price = price;
      await membership.save();

      res
        .status(200)
        .json({ message: "Price for this month has been updated" });
    } else {
      const newMembership = new Membership({ price, months, gym: req.gym._id });
      await newMembership.save();

      res
        .status(200)
        .json({ message: "New memebrship has been added successfully " });
    }
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};

exports.getMemberships = async (req, res) => {
  try {
    const loggedInId = req.gym._id;
    const memebrship = await Membership.find({ gym: loggedInId });

    res.status(200).json({
      message: "Membership fetched successfully",
      membership: memebrship,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
};
