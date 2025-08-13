const express = require("express");
const router = express.Router();
const Lead = require("../models/leads.model");
const sendEmail = require("../utils/sendEmail");

const otpMap = new Map();

router.post("/send-otp", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // 1️⃣ Check if email already exists in the database
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        message: "Email already exists. Please use another email ID.",
      });
    }

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // 3️⃣ Store OTP temporarily
    otpMap.set(email, {
      otp,
      data: { name, email, phone, message },
      time: Date.now(),
    });

    // 4️⃣ Send OTP email
    await sendEmail({
      to: email,
      subject: "Your OTP - Bigwig Media",
      html: `<p>Hello ${name},</p><p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
});
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = otpMap.get(email);
  if (!record)
    return res.status(400).json({ message: "OTP expired or not found." });

  const { otp: correctOtp, data } = record;
  if (parseInt(otp) !== correctOtp)
    return res.status(400).json({ message: "Invalid OTP." });

  const newLead = new Lead({ ...data, verified: true });
  await newLead.save();

  otpMap.delete(email);

  // 1️⃣ Send confirmation email to the user
  await sendEmail({
    to: email,
    subject: "We've received your query - KPD",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="https://res.cloudinary.com/dqrlkbsdq/image/upload/v1755090981/logo_bohujn.png" alt="KPD Logo" width="120" />
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333;">Hello ${data.name},</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for reaching out to <strong>KPD</strong>.
            We have received your message and our team will get in touch with you within the next 24-48 hours.
          </p>
          <p style="font-size: 16px; color: #555;">
            Meanwhile, feel free to explore more about our services or reply to this email if you have any additional questions.
          </p>
          <p style="margin-top: 30px; font-size: 15px; color: #777;">
            Regards,<br />
            <strong>Team KPD</strong><br />
            <a href="https://www.bigwigdigital.in/" style="color: #007BFF;">Bigwig Digital</a>
          </p>
        </div>
      </div>
    `,
  });

  // 2️⃣ Send internal notification to HR
  await sendEmail({
    to: "accounts@bigwigmedia.in", // 🔁 Replace with actual HR email
    subject: "New Lead Captured - Bigwig Media",
    html: `
      <h3>New Lead Details</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Message:</strong><br /> ${data.message}</p>
    `,
  });

  res
    .status(200)
    .json({ message: "Lead captured, confirmation sent, HR notified." });
});
router.get("/all", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }); // Sort latest first
    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ message: "Server error while fetching leads." });
  }
});

module.exports = router;
