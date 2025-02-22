require("dotenv").config();
const mongoose = require("mongoose");

const mongo_url = process.env.MONGO;

mongoose
  .connect(mongo_url)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error", err);
  });
