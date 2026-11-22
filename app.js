import { TARGET, countdownParts } from './countdown.js';

// Start every visit at page 1: stop the browser restoring the old scroll position on reload.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reveals = document.querySelectorAll('.reveal');

// Elements on screen when an upward scroll starts. They stay hidden until they have fully left the screen,
// so nothing flickers back while the finger is still moving.
const heldHidden = new WeakSet();

// Show at 20% visible, hide only once fully off screen: the gap stops elements flipping at the screen edge.
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.intersectionRatio === 0) {
      heldHidden.delete(entry.target);
      entry.target.classList.remove('is-in');
    } else if (entry.intersectionRatio >= 0.2 && !heldHidden.has(entry.target)) {
      entry.target.classList.add('is-in');
    }
  }
}, { threshold: [0, 0.2] });

reveals.forEach((el) => observer.observe(el));

// Direction rule: starting to scroll UP makes everything on screen disappear; elements that then scroll INTO view
// fade in as usual. Scrolling DOWN again brings back everything on screen.
// Small movements add up, so slow scrolling counts; a reversal needs 16px, which ignores finger wobble on a phone.
const REVERSAL_PX = 16;

function visibleShare(el) {
  const r = el.getBoundingClientRect();
  if (r.height === 0) return 0;
  return Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / r.height;
}

let scrollingUp = false;
let lastY = window.scrollY;
let moved = 0;
let lastHeight = document.documentElement.scrollHeight;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const height = document.documentElement.scrollHeight;
  // The page height changed (window resized, image loaded): the browser moved the page, not the user.
  if (height !== lastHeight) {
    lastHeight = height;
    lastY = y;
    moved = 0;
    return;
  }
  const delta = y - lastY;
  lastY = y;
  if (delta === 0) return;
  if (Math.sign(delta) !== Math.sign(moved)) moved = 0;
  moved += delta;
  const max = height - window.innerHeight;
  if (moved >= REVERSAL_PX && scrollingUp) {
    scrollingUp = false;
    reveals.forEach((el) => {
      heldHidden.delete(el);
      el.classList.toggle('is-in', visibleShare(el) >= 0.2);
    });
  // y > 0 and y < max skip the iOS rubber-band bounce at the top and bottom edges
  } else if (moved <= -REVERSAL_PX && y > 0 && y < max && !scrollingUp) {
    scrollingUp = true;
    reveals.forEach((el) => {
      if (visibleShare(el) > 0) heldHidden.add(el);
      el.classList.remove('is-in');
    });
  }
}, { passive: true });

const intro = document.getElementById('intro');
const seal = intro.querySelector('.seal');

seal.addEventListener('click', () => {
  intro.classList.add('is-open');
  document.body.classList.remove('is-locked');
});

// Coming back via the browser's back/forward cache would keep the page opened and scrolled: replay the intro instead.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  intro.classList.remove('is-open');
  document.body.classList.add('is-locked');
  scrollingUp = false;
  window.scrollTo(0, 0);
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
const RSVP_URL = 'https://script.google.com/macros/s/AKfycbycKTbrWNLMCBz_QZwaJbGPSOdZTzSqWWKYctRFRsRQmXbM4gHa23W44sA5fKNjLPsr/exec';

const form = document.getElementById('rsvp-form');
const statusEl = document.getElementById('rsvp-status');
const submitBtn = document.getElementById('rsvp-submit');
const guestsField = document.getElementById('guests-field');

form.addEventListener('change', (e) => {
  if (e.target.name === 'attending') {
    guestsField.hidden = e.target.value !== 'yes';
    statusEl.textContent = '';
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

// Guests stepper
const guestsInput = document.getElementById('guests');
document.querySelectorAll('.step').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = Number(guestsInput.value || 1) + Number(btn.dataset.step);
    guestsInput.value = Math.min(10, Math.max(1, next));
  });
});
