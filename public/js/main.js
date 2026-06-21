// Mobile nav toggle
const toggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (toggle && mobileMenu) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Subject + grade selector on home page
const subjectPills = document.querySelectorAll('.subject-pill');
const gradePills = document.querySelectorAll('.grade-pill');
const bookBtn = document.getElementById('hero-book-btn');

let selectedSubject = null;
let selectedGrade = null;

function updateBookBtn() {
  if (!bookBtn) return;
  if (selectedSubject && selectedGrade) {
    bookBtn.href = `/book?subject=${encodeURIComponent(selectedSubject)}&grade=${encodeURIComponent(selectedGrade)}`;
    bookBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    bookBtn.classList.add('hover:bg-amber-100');
    bookBtn.textContent = `Book ${selectedSubject} – Grade ${selectedGrade}`;
  } else {
    bookBtn.href = '/book';
    bookBtn.classList.add('opacity-50', 'cursor-not-allowed');
    bookBtn.classList.remove('hover:bg-amber-100');
    bookBtn.textContent = 'Select a subject and grade';
  }
}

subjectPills.forEach(pill => {
  pill.addEventListener('click', () => {
    subjectPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedSubject = pill.dataset.subject;
    updateBookBtn();
  });
});

gradePills.forEach(pill => {
  pill.addEventListener('click', () => {
    gradePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedGrade = pill.dataset.grade;
    updateBookBtn();
  });
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => observer.observe(el));
