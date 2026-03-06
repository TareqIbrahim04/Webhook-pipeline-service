const express = require("express");

const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("Webhook received:");
  console.log(req.body);

  res.status(200).send("ok");
});

app.listen(4000, () => {
  console.log("Receiver listening on port 4000");
});