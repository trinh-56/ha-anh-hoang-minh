import { TARGET, countdownParts } from './countdown.js';

// Start every visit at page 1: stop the browser restoring the old scroll position on reload.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Everything on the page fades with its position on screen: in at the edge it enters from, out at the edge it
// leaves by, in both scroll directions. CSS drives .fade on the compositor; older browsers use the fallback below.
const FADE_TARGETS = '.page > section:not(#intro):not(#rsvp) > :not(.stage), .stage > *, #rsvp > :not(#thanks), #thanks > *';
const FADE_BAND = 0.12; // share of the element's trip across the screen spent fading (matches @keyframes scroll-fade)
const fadeOnScroll = !matchMedia('(prefers-reduced-motion: reduce)').matches;

const intro = document.getElementById('intro');
const seal = intro.querySelector('.seal');

seal.addEventListener('click', () => {
  intro.classList.add('is-open');
  document.body.classList.remove('is-locked');
  if (fadeOnScroll) intro.classList.add('fade');
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

if (fadeOnScroll) {
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
        el.style.opacity = base * Math.max(0, Math.min(1, Math.min(progress, 1 - progress) / FADE_BAND));
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
