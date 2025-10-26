const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Mongoose Schema (if you need to interact with a collection):
// const MySchema = new mongoose.Schema({}, { strict: false });
// const SomeModel = mongoose.model("SomeModel", MySchema);

// Set up Nodemailer transporter (do it directly from .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send mail route
app.post("/sendMail", async (req, res) => {
  const msg = req.body.msg;
  const emailList = req.body.emailList;
  let successCount = 0;
  let failCount = 0;
  let failedEmails = [];

  try {
    for (let i = 0; i < emailList.length; i++) {
      try {
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: emailList[i],
          subject: "Hello",
          text: msg,
        });
        console.log(`✅ Sent to ${emailList[i]}: ${info.response}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to send to ${emailList[i]}:`, err.message);
        failCount++;
        failedEmails.push(emailList[i]);
      }
    }

    res.status(200).send({
      success: true,
      total: emailList.length,
      sent: successCount,
      failed: failCount,
      failedEmails,
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send({
      success: false,
      message: "An unexpected error occurred.",
      error: err.message,
    });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
