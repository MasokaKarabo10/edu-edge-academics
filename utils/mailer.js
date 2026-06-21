// Email sending for booking notifications, using Resend.

const { Resend } = require('resend');

async function sendBookingEmail(booking) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Email not configured: RESEND_API_KEY missing from .env');
    throw new Error('Email not configured');
  }
  if (!process.env.TUTOR_EMAIL) {
    console.error('Email not configured: TUTOR_EMAIL missing from .env');
    throw new Error('Email not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { name, contact, subject, grade, planLabel, date, time, notes } = booking;

  const textBody = [
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
  ].filter(Boolean).join('\n');

  // 'onboarding@resend.dev' is Resend's shared test sender - works on the
  // free tier without needing to verify your own domain. Fine for this use
  // case since all emails go to your own inbox (TUTOR_EMAIL), not to the public.
  const { data, error } = await resend.emails.send({
    from: 'Edu-Edge Academics <onboarding@resend.dev>',
    to: process.env.TUTOR_EMAIL,
    reply_to: contact.includes('@') ? contact : undefined,
    subject: `New booking request: ${name} — ${subject} (Grade ${grade})`,
    text: textBody,
  });

  if (error) {
    console.error('Resend API error:', error.message || error);
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  return data;
}

module.exports = { sendBookingEmail };
