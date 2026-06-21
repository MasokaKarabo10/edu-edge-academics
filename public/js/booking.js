// Booking form behaviour: date constraints, dynamic time slots, client-side validation

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');

  // Time slots by day type
  const WEEKDAY_SLOTS = ['14:30', '15:30', '16:30', '17:30', '18:00'];
  const SATURDAY_SLOTS = ['09:30', '10:30', '11:30', '13:00', '14:00', '15:00', '16:00'];

  // Restrict date input: no past dates
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  dateInput.setAttribute('min', todayStr);

  async function fetchTakenSlots(dateStr) {
  try {
    const res = await fetch(`/api/taken-slots?date=${encodeURIComponent(dateStr)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.taken || [];
  } catch (err) {
    console.error('Could not fetch taken slots:', err);
    return [];
  }
}

async function populateTimeSlots() {
  const selectedDate = new Date(dateInput.value + 'T00:00:00');
  timeSelect.innerHTML = '';

  if (!dateInput.value) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Select date first';
    opt.disabled = true;
    opt.selected = true;
    timeSelect.appendChild(opt);
    return;
  }

  const day = selectedDate.getDay();

  if (day === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Closed on Sundays — pick another day';
    opt.disabled = true;
    opt.selected = true;
    timeSelect.appendChild(opt);
    return;
  }

  const slots = day === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Loading availability…';
  placeholder.disabled = true;
  placeholder.selected = true;
  timeSelect.appendChild(placeholder);

  const takenSlots = await fetchTakenSlots(dateInput.value);

  timeSelect.innerHTML = '';
  const realPlaceholder = document.createElement('option');
  realPlaceholder.value = '';
  realPlaceholder.textContent = 'Select a time';
  realPlaceholder.disabled = true;
  realPlaceholder.selected = true;
  timeSelect.appendChild(realPlaceholder);

  slots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot;
    const isTaken = takenSlots.includes(slot);
    opt.textContent = isTaken ? `${slot} (already booked)` : slot;
    opt.disabled = isTaken;
    timeSelect.appendChild(opt);
  });
}

  dateInput.addEventListener('change', populateTimeSlots);
  // Populate on load in case of repopulated form data (validation errors)
  if (dateInput.value) populateTimeSlots();

  // Client-side validation
  form.addEventListener('submit', (e) => {
    let valid = true;

    const fields = [
      { el: document.getElementById('name'), check: el => el.value.trim().length > 0 },
      { el: document.getElementById('contact'), check: el => el.value.trim().length >= 7 },
      { el: document.getElementById('subject'), check: el => el.value !== '' },
      { el: document.getElementById('grade'), check: el => el.value !== '' },
      { el: document.getElementById('plan'), check: el => el.value !== '' },
      { el: document.getElementById('date'), check: el => {
          if (!el.value) return false;
          const selected = new Date(el.value + 'T00:00:00');
          if (selected.getDay() === 0) return false;
          const minDate = new Date(todayStr + 'T00:00:00');
          return selected >= minDate;
        }
      },
      { el: document.getElementById('time'), check: el => el.value !== '' },
    ];

    fields.forEach(({ el, check }) => {
      const errorMsg = el.parentElement.querySelector('.error-msg');
      if (!check(el)) {
        valid = false;
        el.classList.add('border-red-300');
        if (errorMsg) errorMsg.classList.remove('hidden');
      } else {
        el.classList.remove('border-red-300');
        if (errorMsg) errorMsg.classList.add('hidden');
      }
    });

    if (!valid) {
      e.preventDefault();
      const firstError = form.querySelector('.border-red-300');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});
