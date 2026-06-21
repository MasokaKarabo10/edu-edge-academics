// Simple file-based booking store for Edu-Edge Academics.
//
// Why a JSON file instead of a "real" database?
// At this scale (one tutor, a handful of bookings per week), a database
// server is overkill. This stores bookings as a JSON array in a local file,
// which is more than enough to reliably check for date+time conflicts.
// If the business grows significantly, this can be swapped for a proper
// database (e.g. SQLite, Postgres) without changing how the rest of the
// app calls into this module - that's the point of keeping the functions
// below as the single interface to booking data.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'bookings.json');

function readBookings() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading bookings.json:', err.message);
    return [];
  }
}

function writeBookings(bookings) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing bookings.json:', err.message);
  }
}

function isSlotTaken(date, time) {
  const bookings = readBookings();
  return bookings.some(b => b.date === date && b.time === time);
}

function getTakenSlotsForDate(date) {
  const bookings = readBookings();
  return bookings.filter(b => b.date === date).map(b => b.time);
}

function saveBooking(booking) {
  const bookings = readBookings();
  const newBooking = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: booking.name,
    contact: booking.contact,
    subject: booking.subject,
    grade: booking.grade,
    plan: booking.plan,
    date: booking.date,
    time: booking.time,
    notes: booking.notes || '',
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  writeBookings(bookings);
  return newBooking;
}

module.exports = { isSlotTaken, getTakenSlotsForDate, saveBooking };