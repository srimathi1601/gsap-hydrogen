// Deadline the announcement-bar countdown runs down to. Change this to move it.
const COUNTDOWN_TARGET = new Date('2026-11-09T05:12:05');

const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

const fields = {
  d: document.querySelector('[data-cd="d"]'),
  h: document.querySelector('[data-cd="h"]'),
  m: document.querySelector('[data-cd="m"]'),
  s: document.querySelector('[data-cd="s"]'),
};

function tick() {
  const left = Math.max(0, COUNTDOWN_TARGET.getTime() - Date.now());
  const total = Math.floor(left / 1000);

  fields.d.textContent = pad(Math.floor(total / 86400));
  fields.h.textContent = pad(Math.floor(total / 3600) % 24);
  fields.m.textContent = pad(Math.floor(total / 60) % 60);
  fields.s.textContent = pad(total % 60);
}

tick();
setInterval(tick, 1000);
