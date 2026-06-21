const express = require('express');
const router = express.Router();
const { validateBooking, PLAN_LABELS } = require('../middleware/validateBooking');
const { sendBookingEmail } = require('../utils/mailer');
const { isSlotTaken, getTakenSlotsForDate, saveBooking } = require('../utils/bookingStore');

router.get('/', (req, res) => {
  res.render('index', { title: 'Edu-Edge Academics – Online Tutoring' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About – Edu-Edge Academics' });
});

router.get('/subjects', (req, res) => {
  res.render('subjects', { title: 'Subjects – Edu-Edge Academics' });
});

router.get('/testimonials', (req, res) => {
  res.render('testimonials', { title: 'Testimonials – Edu-Edge Academics' });
});

router.get('/pricing', (req, res) => {
  res.render('pricing', { title: 'Pricing – Edu-Edge Academics' });
});

router.get('/book', (req, res) => {
  // Pre-fill subject/plan from query params if the visitor arrived via a
  // "Book Mathematics" or "Get this pack" link elsewhere on the site.
  const { subject, plan, grade } = req.query;
  const formData = (subject || plan || grade)
    ? { subject: subject || '', plan: plan || '', grade: grade || '', name: '', contact: '', date: '', time: '', notes: '' }
    : undefined;

  res.render('book', { title: 'Book a Session – Edu-Edge Academics', formData });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact – Edu-Edge Academics' });
});

// GET /api/taken-slots?date=2026-06-22
router.get('/api/taken-slots', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  const taken = getTakenSlotsForDate(date);
  res.json({ date, taken });
});

// POST /book - handles booking form submission
router.post('/book', validateBooking, async (req, res) => {
  const { name, contact, subject, grade, plan,  planLabel, date, time, notes } = req.body;

  const booking = { name, contact, subject, grade, planLabel, date, time, notes };

  //conflict check
  if (isSlotTaken(date, time)) {
    return res.render('book', {
      title: 'Book a Session – Edu-Edge Academics',
      errors: [`The ${time} slot on ${date} has just been booked by someone else. Please pick a different time.`],
      formData: { name, contact, subject, grade, plan, date, time: '', notes },
    });
  }

  //saving conflict check
  saveBooking({ name, contact, subject, grade, plan, date, time, notes });

  // Always build a WhatsApp link as a reliable fallback / alternative
  const message = [
    `New booking request — Edu-Edge Academics`,
    ``,
    `Name: ${name}`,
    `Contact: ${contact}`,
    `Subject: ${subject}`,
    `Grade: ${grade}`,
    `Plan: ${planLabel}`,
    `Preferred date: ${date}`,
    `Preferred time: ${time}`,
    notes ? `Notes: ${notes}` : '',
  ].filter(Boolean).join('\n');

  const whatsappNumber = process.env.TUTOR_WHATSAPP || '27670517017';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Attempt email (best effort - failure doesn't block the user)
  let emailSent = false;
  try {
    await sendBookingEmail(booking);
    emailSent = true;
  } catch (err) {
    console.error('Failed to send booking email:', err.message);
    emailSent = false;
  }

  res.render('confirmation', {
    title: 'Booking Confirmed – Edu-Edge Academics',
    booking,
    emailSent,
    whatsappLink,
  });
});

module.exports = router;
