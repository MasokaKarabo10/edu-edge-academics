// Custom middleware: validates booking form submissions.
// Runs server-side as a safety net even if client-side JS is bypassed/disabled.

const SUBJECTS = ['Mathematics', 'Physical Science', 'Accounting', 'English', 'Afrikaans', 'CAT'];
const GRADES = ['8', '9', '10', '11', '12'];
const PLANS = ['hourly', '4-pack', '8-pack', 'group'];

const PLAN_LABELS = {
  'hourly': 'Hourly session — R130/hr',
  '4-pack': '4-session pack — R494 total',
  '8-pack': '8-session pack — R960 total',
  'group': 'Group session — R110/hr each',
};

function validateBooking(req, res, next) {
  const { name, contact, subject, grade, plan, date, time, notes } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required.');
  }

  // Accept either an email or a phone number (basic checks)
  const isEmail = contact && /\S+@\S+\.\S+/.test(contact);
  const isPhone = contact && /^[0-9+\s-]{7,}$/.test(contact);
  if (!contact || (!isEmail && !isPhone)) {
    errors.push('Please provide a valid phone number or email address.');
  }

  if (!subject || !SUBJECTS.includes(subject)) {
    errors.push('Please select a valid subject.');
  }

  if (!grade || !GRADES.includes(grade)) {
    errors.push('Please select a valid grade.');
  }

  if (!plan || !PLANS.includes(plan)) {
    errors.push('Please select a valid plan.');
  }

  // Date validation: must be a real date, not in the past, not a Sunday
  if (!date) {
    errors.push('Please select a date.');
  } else {
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      errors.push('The date provided is not valid.');
    } else if (selectedDate < today) {
      errors.push('Please select a date that is not in the past.');
    } else if (selectedDate.getDay() === 0) {
      errors.push('Sundays are unavailable — please pick Monday to Saturday.');
    }
  }

  // Time validation: depends on day of week
  if (!time) {
    errors.push('Please select a time slot.');
  } else if (date) {
    const selectedDate = new Date(date + 'T00:00:00');
    const day = selectedDate.getDay();
    const WEEKDAY_SLOTS = ['14:30', '15:30', '16:30', '17:30', '18:00'];
    const SATURDAY_SLOTS = ['09:30', '10:30', '11:30', '13:00', '14:00', '15:00', '16:00'];
    const validSlots = day === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;

    if (day !== 0 && !validSlots.includes(time)) {
      errors.push('Please select a time slot within available hours.');
    }
  }

  if (errors.length > 0) {
    return res.render('book', {
      title: 'Book a Session – Edu-Edge Academics',
      errors,
      formData: { name, contact, subject, grade, plan, date, time, notes },
    });
  }

  // Attach a readable plan label for use in the confirmation page / messages
  req.body.planLabel = PLAN_LABELS[plan] || plan;
  next();
}

module.exports = { validateBooking, SUBJECTS, GRADES, PLANS, PLAN_LABELS };
