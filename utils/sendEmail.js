const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"KPD" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments, // ✅ INCLUDE THIS LINE
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};

module.exports = sendEmail;
