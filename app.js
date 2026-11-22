import { TARGET, countdownParts } from './countdown.js';

const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.2 });

reveals.forEach((el) => observer.observe(el));

const intro = document.getElementById('intro');
const seal = intro.querySelector('.seal');

seal.addEventListener('click', () => {
  intro.classList.add('is-open');
  document.body.classList.remove('is-locked');
});

// Countdown

const row = document.getElementById('countdown-row');
const done = document.getElementById('countdown-done');
const nums = {
  days: row.querySelector('[data-unit="days"]'),
  hours: row.querySelector('[data-unit="hours"]'),
  minutes: row.querySelector('[data-unit="minutes"]'),
  seconds: row.querySelector('[data-unit="seconds"]'),
};
let lastMinuteLabel = '';

function tick() {
  const remaining = TARGET - Date.now();
  if (remaining <= 0) {
    row.hidden = true;
    done.hidden = false;
    return;
  }
  const parts = countdownParts(remaining);
  for (const key of Object.keys(nums)) {
    nums[key].textContent = String(parts[key]).padStart(2, '0');
  }
  // Screen readers get a short summary once a minute, not every second.
  const label = `Còn ${parts.days} ngày ${parts.hours} giờ ${parts.minutes} phút`;
  if (label !== lastMinuteLabel) {
    row.setAttribute('aria-label', label);
    lastMinuteLabel = label;
  }
}

tick();
setInterval(tick, 1000);
