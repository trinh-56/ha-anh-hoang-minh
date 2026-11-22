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

// RSVP
const RSVP_URL = ''; // set in task 2-2

const form = document.getElementById('rsvp-form');
const statusEl = document.getElementById('rsvp-status');
const submitBtn = document.getElementById('rsvp-submit');
const guestsField = document.getElementById('guests-field');

form.addEventListener('change', (e) => {
  if (e.target.name === 'attending') {
    guestsField.hidden = e.target.value !== 'yes';
  }
});

function showError(message) {
  statusEl.textContent = message;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;

  const data = new FormData(form);
  const name = String(data.get('name') ?? '').trim();
  const attending = data.get('attending');
  const guests = Number(data.get('guests'));
  const website = String(data.get('website') ?? '');

  if (!name) return showError('Vui lòng nhập tên của quý khách.');
  if (!attending) return showError('Vui lòng chọn tham dự hay không.');
  if (attending === 'yes' && !(Number.isInteger(guests) && guests >= 1 && guests <= 10)) {
    return showError('Số người tham dự từ 1 đến 10.');
  }

  submitBtn.disabled = true;
  statusEl.textContent = 'Đang gửi…';

  try {
    if (!RSVP_URL) throw new Error('RSVP_URL not set');
    const res = await fetch(RSVP_URL, {
      method: 'POST',
      body: new URLSearchParams({
        name,
        attending,
        guests: attending === 'yes' ? String(guests) : '0',
        website,
      }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error('rejected');

    const done = document.createElement('p');
    done.className = 'rsvp-done';
    done.textContent = 'Cảm ơn bạn đã xác nhận!';
    form.replaceWith(done);
    document.getElementById('thanks').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.warn('RSVP submit failed:', err);
    statusEl.textContent = 'Gửi chưa được, vui lòng thử lại.';
    submitBtn.disabled = false;
  }
});
