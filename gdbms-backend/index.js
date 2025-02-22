const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;

require("./DbConn/conn");

app.get("/", (req, res) => {
  res.send({ message: "Your server is running" });
});

app.listen(PORT, () => {
  console.log("Your server is running on PORT 4000");
});
