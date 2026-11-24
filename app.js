import { TARGET, countdownParts } from './countdown.js';

// Start every visit at page 1: stop the browser restoring the old scroll position on reload.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Everything on the page fades with its position on screen: in at the edge it enters from, out at the edge it
// leaves by, in both scroll directions. CSS drives .fade on the compositor; older browsers use the fallback below.
// The fade is opacity only, so it also runs when the phone's Reduce Motion setting is on (that setting is about movement).
// The thank-you panel is the end of the page and shorter than the screen, so it never fades (it would stay faint at the bottom).
const FADE_TARGETS = '.page > section:not(#intro):not(#thanks) > :not(.countdown-photo)';
// Share of the element's trip across the screen spent fading (matches @keyframes scroll-fade).
const FADE_IN = 0.3;
const FADE_OUT = 0.12;

const intro = document.getElementById('intro');
const openCard = intro.querySelector('.open-card');

openCard.addEventListener('click', () => {
  intro.classList.add('is-open');
  document.body.classList.remove('is-locked');
  intro.classList.add('fade');
});

// Coming back via the browser's back/forward cache would keep the page opened and scrolled: replay the intro instead.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  intro.classList.remove('is-open');
  document.body.classList.add('is-locked');
  intro.classList.remove('fade');
  intro.style.opacity = '';
  window.scrollTo(0, 0);
});

{
  const targets = [...document.querySelectorAll(FADE_TARGETS)];
  targets.forEach((el) => el.classList.add('fade'));

  if (!CSS.supports('animation-timeline: view()')) {
    const items = [intro, ...targets].map((el) => ({ el, base: parseFloat(getComputedStyle(el).opacity) }));
    let queued = false;
    const paint = () => {
      queued = false;
      const vh = window.innerHeight;
      for (const { el, base } of items) {
        if (!el.classList.contains('fade')) continue;
        const r = el.getBoundingClientRect();
        const progress = (vh - r.top) / (vh + r.height);
        el.style.opacity = base * Math.max(0, Math.min(1, progress / FADE_IN, (1 - progress) / FADE_OUT));
      }
    };
    const queue = () => {
      if (!queued) requestAnimationFrame(paint);
      queued = true;
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    queue();
  }
}

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

form.addEventListener('change', (e) => {
  if (e.target.name === 'attending') statusEl.textContent = '';
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
  const message = String(data.get('message') ?? '').trim();
  const website = String(data.get('website') ?? '');

  if (!name) return showError('Vui lòng nhập tên của quý khách.');
  if (!attending) return showError('Vui lòng chọn tham dự hay không.');

  submitBtn.disabled = true;
  statusEl.textContent = 'Đang gửi…';

  try {
    if (!RSVP_URL) throw new Error('RSVP_URL not set');
    const res = await fetch(RSVP_URL, {
      method: 'POST',
      body: new URLSearchParams({
        name,
        attending,
        message,
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

// Gift popup: a native <dialog> (Esc closes it); a tap on the dimmed area outside it closes it too.
const giftDialog = document.getElementById('gift-dialog');
document.getElementById('gift-btn').addEventListener('click', () => giftDialog.showModal());
document.getElementById('gift-close').addEventListener('click', () => giftDialog.close());
giftDialog.addEventListener('click', (e) => {
  if (e.target === giftDialog) giftDialog.close();
});
