const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, html, text }) => {
  // In development, log to console if email credentials not set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 Email (dev mode - credentials missing):\nTo: ${email}\nSubject: ${subject}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const message = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '')
  };

  const info = await transporter.sendMail(message);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
