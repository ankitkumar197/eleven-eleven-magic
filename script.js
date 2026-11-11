/* ===== 11:11 — A Little Wish ===== */
'use strict';

/* ---------- CONFIG: edit your words here ---------- */
const CONFIG = {
  questions: [
    'If you could make one wish for yourself, what would it be?',
    'If you could make one wish for us, what would it be?',
    "What's one memory you would love to create together?",
    "What's something you never want to lose in life?",
    'If you could describe our connection in one word, what would it be?'
  ],
  secret:
`Among all the unexpected things in life,
meeting you is one of my favourite things.

I don't know what tomorrow holds,
but I hope we continue creating beautiful memories together.

You are someone worth making a wish for. ❤️`,
  typeSpeed: 45,        // ms per character
  storagePrefix: '1111_' // localStorage key prefix
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 600;

/* ---------- Safe localStorage helpers ---------- */
const store = {
  get(k) { try { return localStorage.getItem(CONFIG.storagePrefix + k) || ''; } catch { return ''; } },
  set(k, v) { try { localStorage.setItem(CONFIG.storagePrefix + k, v); } catch {} },
  clear() { try { Object.keys(localStorage).filter(k => k.startsWith(CONFIG.storagePrefix)).forEach(k => localStorage.removeItem(k)); } catch {} }
};

/* ---------- Scene navigation ---------- */
const scenes = $$('.scene');
let current = 0, typing = null;

function go(n) {
  scenes.forEach((s, i) => s.classList.toggle('active', i === n));
  current = n;
  scenes[n].scrollTo({ top: 0 });
  if (n === 2) showQuestion(qi, 0);
  if (n === 5) resetSecret();
  if (n === 6) burst();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go]');
  if (t) go(+t.dataset.go);
});

/* ---------- Floating hearts (capped, paused when tab hidden) ---------- */
const heartBox = $('#hearts');
function spawnHeart() {
  if (document.hidden || heartBox.children.length > (small ? 9 : 16)) return;
  const h = document.createElement('span');
  h.className = 'h';
  h.textContent = ['❤', '♡', '✦', '💗'][Math.random() * 4 | 0];
  h.style.cssText = `left:${Math.random() * 100}%;font-size:${12 + Math.random() * 20}px;--d:${7 + Math.random() * 6}s;--x:${(Math.random() - .5) * 80}px`;
  h.addEventListener('animationend', () => h.remove());
  heartBox.appendChild(h);
}
function burst() { for (let i = 0; i < (small ? 8 : 14); i++) setTimeout(spawnHeart, i * 140); }
if (!reduced) setInterval(spawnHeart, small ? 1500 : 900);

/* ---------- Starfield (canvas) ---------- */
const cv = $('#stars'), cx = cv.getContext('2d');
let stars = [];
function sizeStars() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(small ? 70 : 140, innerWidth * innerHeight / 8000 | 0);
  stars = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.4 + .3, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5 }));
}
function drawStars(t = 0) {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  for (const s of stars) {
    cx.globalAlpha = .35 + .65 * Math.abs(Math.sin(t / 1000 * s.s + s.p));
    cx.fillStyle = s.r > 1.2 ? '#ffd6ea' : '#fff';
    cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill();
  }
  if (!reduced) requestAnimationFrame(drawStars);
}
addEventListener('resize', () => { sizeStars(); if (reduced) drawStars(); });
sizeStars(); drawStars();

/* ---------- Scene 2: envelope ---------- */
const env = $('#env');
function openEnv() {
  if (env.classList.contains('open')) return;
  env.classList.add('open');
  $('#openBtn').classList.add('hidden');
  $('#reveal').classList.add('on');
  burst();
}
env.addEventListener('click', openEnv);
$('#openBtn').addEventListener('click', openEnv);

/* ---------- Scene 3: five wishes ---------- */
let qi = 0;
const ans = $('#qans'), dots = $('#dots'), saved = $('#saved'), qcard = $('#qcard');
dots.innerHTML = CONFIG.questions.map(() => '<b></b>').join('');
let savedTimer;

function showQuestion(i, dir) {
  qi = i;
  $('#qtext').textContent = CONFIG.questions[i];
  ans.value = store.get('q' + i);
  $('#count').textContent = `Wish ${i + 1} of ${CONFIG.questions.length}`;
  $$('b', dots).forEach((d, k) => d.classList.toggle('on', k <= i));
  $('#prev').disabled = i === 0;
  $('#next').textContent = i === CONFIG.questions.length - 1 ? 'Finish ✨' : 'Next →';
  qcard.classList.remove('swap-l', 'swap-r'); void qcard.offsetWidth; // restart animation
  if (dir) qcard.classList.add(dir > 0 ? 'swap-l' : 'swap-r');
}
ans.addEventListener('input', () => {
  store.set('q' + qi, ans.value);
  saved.classList.add('on'); clearTimeout(savedTimer);
  savedTimer = setTimeout(() => saved.classList.remove('on'), 1200);
});
$('#prev').addEventListener('click', () => qi > 0 && showQuestion(qi - 1, -1));
$('#next').addEventListener('click', () => qi < CONFIG.questions.length - 1 ? showQuestion(qi + 1, 1) : go(3));

/* ---------- Scene 4: two wishes (auto-saved) ---------- */
$$('textarea[data-save]').forEach(t => {
  t.value = store.get(t.dataset.save);
  t.addEventListener('input', () => store.set(t.dataset.save, t.value));
});

/* ---------- Scene 6: secret message (typewriter) ---------- */
const typed = $('#typed'), sBtn = $('#secretBtn'), sNext = $('#secretNext');
function resetSecret() {
  clearInterval(typing);
  typed.textContent = '';
  sBtn.classList.remove('hidden'); sNext.classList.add('hidden');
}
sBtn.addEventListener('click', () => {
  sBtn.classList.add('hidden'); burst();
  const msg = CONFIG.secret;
  if (reduced) { typed.textContent = msg; sNext.classList.remove('hidden'); return; }
  let i = 0;
  typing = setInterval(() => {
    typed.textContent = msg.slice(0, ++i);
    if (i >= msg.length) { clearInterval(typing); sNext.classList.remove('hidden'); }
  }, CONFIG.typeSpeed);
});

/* ---------- Scene 7: restart / clear ---------- */
$('#again').addEventListener('click', () => {
  env.classList.remove('open');
  $('#openBtn').classList.remove('hidden');
  $('#reveal').classList.remove('on');
  qi = 0; go(0);
});
$('#clear').addEventListener('click', () => {
  store.clear(); $$('textarea').forEach(t => t.value = '');
  $('#clear').textContent = 'Cleared ✓';
});

/* ---------- Optional soft music (generated with Web Audio, no files) ---------- */
const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
let ac, musicTimer, step = 0;
function playChord() {
  const t = ac.currentTime;
  chords[step++ % chords.length].forEach(f => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.04, t + 1.4);
    g.gain.linearRampToValueAtTime(0, t + 4.4);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 4.5);
  });
}
$('#music').addEventListener('click', e => {
  const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', on);
  b.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  b.textContent = on ? '❚❚' : '♪';
  if (on) {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    ac.resume(); playChord(); musicTimer = setInterval(playChord, 4000);
  } else { clearInterval(musicTimer); }
});

go(0);