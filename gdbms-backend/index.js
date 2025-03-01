require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
require("./DbConn/conn");

const gymRoutes = require("./Routes/gymRoute");
const membershipRoutes = require("./Routes/memebrshipRoute");
const memberRoutes = require("./Routes/memberRotue");

app.use("/auth", gymRoutes);
app.use("/plans", membershipRoutes);
app.use("/members", memberRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Your server is running" });
});

app.listen(PORT, () => {
  console.log("Your server is running on PORT 4000");
});
