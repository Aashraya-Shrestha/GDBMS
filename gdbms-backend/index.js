require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());
app.use(express.json());
require("./DbConn/conn");

const gymRoutes = require("./Routes/gymRoute");
app.use("/auth", gymRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Your server is running" });
});

app.listen(PORT, () => {
  console.log("Your server is running on PORT 4000");
});
