// Nodemailer setup for sending booking notification emails.
// Requires EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env

const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 8000, // 8 seconds
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
}

async function sendBookingEmail(booking) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email not configured: EMAIL_USER or EMAIL_PASS missing from .env');
    throw new Error('Email not configured');
  }

  const transporter = createTransporter();

  const { name, contact, subject, grade, planLabel, date, time, notes } = booking;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.TUTOR_EMAIL,
    replyTo: contact.includes('@') ? contact : undefined,
    subject: `New booking request: ${name} — ${subject} (Grade ${grade})`,
    text: [
      `New booking request from Edu-Edge Academics website`,
      ``,
      `Name: ${name}`,
      `Contact: ${contact}`,
      `Subject: ${subject}`,
      `Grade: ${grade}`,
      `Plan: ${planLabel}`,
      `Preferred date: ${date}`,
      `Preferred time: ${time}`,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean).join('\n'),
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendBookingEmail };
