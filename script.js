const MORSE_CODE = {
  'A': '.-',    'B': '-...',   'C': '-.-.',
  'D': '-..',   'E': '.',      'F': '..-.',
  'G': '--.',   'H': '....',   'I': '..',
  'J': '.---',  'K': '-.-',    'L': '.-..',
  'M': '--',    'N': '-.',     'O': '---',
  'P': '.--.',  'Q': '--.-',   'R': '.-.',
  'S': '...',   'T': '-',      'U': '..-',
  'V': '...-',  'W': '.--',    'X': '-..-',
  'Y': '-.--',  'Z': '--..',
  '0': '-----', '1': '.----',  '2': '..---',
  '3': '...--', '4': '....-',  '5': '.....',
  '6': '-....', '7': '--...',  '8': '---..',
  '9': '----.'
};

const LEARNING_ORDER = [
  ['E', 'T'],
  ['A', 'I', 'M', 'N'],
  ['D', 'G', 'K', 'O', 'R', 'U'],
  ['B', 'C', 'F', 'H', 'L', 'P', 'S', 'V'],
  ['J', 'Q', 'W', 'X', 'Y', 'Z'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
];

const ACHIEVEMENTS = {
  primer_nivel:    { nombre: 'Primeros Pasos',     desc: 'Completa el Nivel 1',               icono: '\u{1F31F}' },
  nivel_2:         { nombre: 'En Progreso',         desc: 'Completa el Nivel 2',               icono: '\u{1F4C8}' },
  nivel_3:         { nombre: 'Comunicador',         desc: 'Completa el Nivel 3',               icono: '\u{1F5E3}\uFE0F' },
  nivel_4:         { nombre: 'Experto',             desc: 'Completa el Nivel 4',               icono: '\u{1F3AF}' },
  nivel_5:         { nombre: 'Casi un Maestro',     desc: 'Completa el Nivel 5',               icono: '\u{1F51D}' },
  todos_niveles:   { nombre: 'Gran Maestro Morse',  desc: 'Completa todos los niveles',        icono: '\u{1F3C6}' },
  racha_5:         { nombre: 'Racha',               desc: '5 aciertos seguidos',               icono: '\u{1F525}' },
  racha_10:        { nombre: 'Imparable',           desc: '10 aciertos seguidos',              icono: '\u26A1' },
  nivel_perfecto:  { nombre: 'Perfecto',            desc: 'Completa un nivel sin errores',     icono: '\u{1F48E}' },
  primer_acierto:  { nombre: 'Primer Intento',      desc: 'Acierta tu primera letra',          icono: '\u{1F3AF}' },
};

const API_BASE = '/api';

const state = {
  availableLetters: [],
  activeDeck: [],
  currentCard: null,
  userInput: '',
  progress: 0,
  totalCards: 0,
  isPressing: false,
  pressStartTime: 0,
  evaluationTimer: null,
  isEvaluating: false,
  currentLevel: 0,
  isLocked: false,
  isFlipped: false,
  currentStreak: 0,
  levelErrors: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  bestStreak: 0,
  hasCorrectAnswer: false
};

let token = localStorage.getItem('token');
let userData = null;

const $ = s => document.querySelector(s);
const cardLetter = $('#card-letter');
const inputDisplay = $('#input-display');
const correctMorse = $('#correct-morse');
const progressBar = $('#progress-bar');
const levelIndicator = $('#level-indicator');
const btn = $('#telegraph-btn');
const card = $('#card');
const instruction = $('#instruction');
const cardAnswer = $('#card-answer');
const flipBtn = $('#flip-btn');

class MorseAudio {
  constructor() {
    this.ctx = null;
    this.osc = null;
    this.gain = null;
  }

  ensure() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      this.ctx = new C();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startTone() {
    this.ensure();
    const now = this.ctx.currentTime;
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.value = 680;
    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0, now);
    this.gain.gain.linearRampToValueAtTime(0.35, now + 0.004);
    this.osc.connect(this.gain);
    this.gain.connect(this.ctx.destination);
    this.osc.start(now);
  }

  stopTone() {
    if (this.gain && this.ctx) {
      const now = this.ctx.currentTime;
      this.gain.gain.setValueAtTime(this.gain.gain.value || 0.35, now);
      this.gain.gain.linearRampToValueAtTime(0, now + 0.008);
    }
    if (this.osc) {
      const stopTime = this.ctx.currentTime + 0.012;
      this.osc.stop(stopTime);
      this.osc = null;
      this.gain = null;
    }
  }

  tone(freq, duration, startTime) {
    this.ensure();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = startTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.004);
    gain.gain.linearRampToValueAtTime(0.25, t + duration - 0.006);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  playSuccess() {
    this.ensure();
    const now = this.ctx.currentTime;
    this.tone(523, 0.12, now);
    this.tone(659, 0.12, now + 0.1);
    this.tone(784, 0.18, now + 0.2);
  }

  playError() {
    this.ensure();
    const now = this.ctx.currentTime;
    this.tone(392, 0.18, now);
    this.tone(330, 0.25, now + 0.14);
  }

  playAchievement() {
    this.ensure();
    const now = this.ctx.currentTime;
    this.tone(523, 0.1, now);
    this.tone(659, 0.1, now + 0.1);
    this.tone(784, 0.1, now + 0.2);
    this.tone(1047, 0.3, now + 0.3);
  }
}

const audio = new MorseAudio();

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── Screen navigation ──

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById('screen-' + name);
  if (screen) screen.classList.remove('hidden');
}

// ── API helpers ──

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

// ── Auth ──

function isLoggedIn() {
  return !!token && !!userData;
}

function saveToken(t) {
  token = t;
  localStorage.setItem('token', t);
}

function clearAuth() {
  token = null;
  userData = null;
  localStorage.removeItem('token');
}

async function tryAutoLogin() {
  if (!token) return false;
  try {
    const data = await apiFetch('/auth/yo');
    userData = data;
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

// ── Game init ──

function initGame() {
  state.currentLevel = 0;
  state.currentStreak = 0;
  state.levelErrors = 0;
  state.totalCorrect = 0;
  state.totalAttempts = 0;
  state.bestStreak = 0;
  state.hasCorrectAnswer = false;
  loadLevel(0);
}

function initGameAtLevel(level) {
  state.currentLevel = 0;
  state.availableLetters = [];
  for (let i = 0; i <= level; i++) {
    if (i >= LEARNING_ORDER.length) break;
    state.availableLetters = state.availableLetters.concat(LEARNING_ORDER[i]);
  }
  state.currentLevel = level;
  state.currentStreak = 0;
  state.levelErrors = 0;
  state.hasCorrectAnswer = false;
  rebuildDeck();
}

function loadLevel(level) {
  if (level >= LEARNING_ORDER.length) {
    showVictory();
    return;
  }

  state.currentLevel = level;
  const newLetters = LEARNING_ORDER[level];
  state.availableLetters = state.availableLetters.concat(newLetters);
  state.levelErrors = 0;
  rebuildDeck();
}

function rebuildDeck() {
  state.activeDeck = [...state.availableLetters];
  shuffle(state.activeDeck);
  state.progress = 0;
  state.totalCards = state.activeDeck.length;
  updateProgressBar();
  levelIndicator.textContent = 'Nivel ' + (state.currentLevel + 1);

  if (state.activeDeck.length > 0) {
    nextCard();
  }
}

function nextCard() {
  if (state.activeDeck.length === 0) {
    loadLevel(state.currentLevel + 1);
    return;
  }

  state.currentCard = state.activeDeck.pop();
  state.userInput = '';
  state.isEvaluating = false;
  state.isLocked = false;
  setFlipped(false);

  cardLetter.textContent = state.currentCard;
  cardLetter.className = '';
  card.className = '';
  inputDisplay.innerHTML = '';
  correctMorse.classList.add('hidden');
  correctMorse.textContent = '';
  instruction.textContent = 'Presiona la barra espaciadora o el botón para enviar código Morse. Pulsación corta = punto (·), pulsación larga = raya (—). Presiona F para voltear la tarjeta.';
  instruction.className = '';

  flipBtn.style.display = '';
  renderAnswer();
}

function renderAnswer() {
  const code = MORSE_CODE[state.currentCard];
  cardAnswer.innerHTML = '';
  for (const s of code) {
    const span = document.createElement('span');
    if (s === '.') {
      span.className = 'answer-symbol answer-symbol-dot';
    } else {
      span.className = 'answer-symbol answer-symbol-dash';
    }
    cardAnswer.appendChild(span);
  }
}

function setFlipped(flipped) {
  state.isFlipped = flipped;
  card.classList.toggle('flipped', flipped);
  flipBtn.textContent = flipped ? '↺ Ocultar respuesta' : '↺ Ver respuesta';
}

function toggleFlip() {
  if (state.isLocked) return;
  setFlipped(!state.isFlipped);
}

function addSymbol(symbol) {
  if (state.isLocked || state.isEvaluating || state.isFlipped) return;

  state.userInput += symbol;

  const span = document.createElement('span');
  span.className = 'symbol symbol-' + (symbol === '.' ? 'dot' : 'dash');
  span.textContent = symbol === '.' ? '●' : '─';
  inputDisplay.appendChild(span);

  clearTimeout(state.evaluationTimer);
  state.evaluationTimer = setTimeout(evaluateInput, 650);
}

function evaluateInput() {
  if (state.isLocked || state.isEvaluating) return;
  if (state.userInput.length === 0) return;

  if (state.isFlipped) {
    setFlipped(false);
  }

  state.isEvaluating = true;
  const correct = MORSE_CODE[state.currentCard];

  if (state.userInput === correct) {
    handleCorrect();
  } else {
    handleError(correct);
  }
}

async function handleCorrect() {
  state.isLocked = true;
  card.className = 'success';
  cardLetter.className = 'success';
  audio.playSuccess();

  state.progress++;
  state.currentStreak++;
  state.totalCorrect++;
  state.hasCorrectAnswer = true;
  if (state.currentStreak > state.bestStreak) {
    state.bestStreak = state.currentStreak;
  }
  updateProgressBar();

  instruction.textContent = '¡Correcto!';
  instruction.className = 'success';

  checkAchievements();

  setTimeout(() => {
    if (state.progress >= state.availableLetters.length) {
      const completedLevel = state.currentLevel;
      loadLevel(state.currentLevel + 1);
      checkLevelAchievements(completedLevel);
      if (isLoggedIn()) {
        saveProgress();
      }
    } else {
      nextCard();
    }
  }, 1100);
}

function handleError(correct) {
  state.isLocked = true;
  card.className = 'error';
  cardLetter.className = 'error';
  audio.playError();

  state.currentStreak = 0;
  state.levelErrors++;
  state.totalAttempts++;

  correctMorse.textContent = formatMorse(correct);
  correctMorse.classList.remove('hidden');

  instruction.textContent = state.currentCard + ' → ' + formatMorse(correct);
  instruction.className = 'error';

  const pos = Math.floor(Math.random() * (state.activeDeck.length + 1));
  state.activeDeck.splice(pos, 0, state.currentCard);

  setTimeout(nextCard, 1800);
}

function formatMorse(code) {
  return code.split('').map(s => s === '.' ? '·' : '—').join(' ');
}

function updateProgressBar() {
  const pct = state.totalCards > 0
    ? (state.progress / state.availableLetters.length) * 100
    : 0;
  progressBar.style.width = Math.min(pct, 100) + '%';
}

function showVictory() {
  cardLetter.textContent = '\u{1F389}';
  card.className = 'success';
  inputDisplay.innerHTML = '';
  correctMorse.classList.add('hidden');
  instruction.textContent = '¡Has completado todos los niveles!';
  levelIndicator.textContent = '¡Completado!';
  progressBar.style.width = '100%';
  flipBtn.style.display = 'none';

  if (isLoggedIn()) {
    saveProgress();
    checkAchievements();
  }
}

// ── Achievement system ──

let unlockedAchievements = new Set();

async function checkAchievements() {
  if (!isLoggedIn()) return;

  const checks = [];

  if (state.hasCorrectAnswer) checks.push('primer_acierto');
  if (state.currentStreak >= 5) checks.push('racha_5');
  if (state.currentStreak >= 10) checks.push('racha_10');

  for (const clave of checks) {
    if (!unlockedAchievements.has(clave)) {
      await unlockAchievement(clave);
    }
  }
}

async function checkLevelAchievements(level) {
  if (!isLoggedIn()) return;

  const levelChecks = {
    0: 'primer_nivel',
    1: 'nivel_2',
    2: 'nivel_3',
    3: 'nivel_4',
    4: 'nivel_5',
  };

  const clave = levelChecks[level];
  if (clave && !unlockedAchievements.has(clave)) {
    await unlockAchievement(clave);
  }

  if (level === LEARNING_ORDER.length - 1 && !unlockedAchievements.has('todos_niveles')) {
    await unlockAchievement('todos_niveles');
  }

  if (state.levelErrors === 0 && !unlockedAchievements.has('nivel_perfecto')) {
    await unlockAchievement('nivel_perfecto');
  }
}

async function unlockAchievement(clave) {
  try {
    await apiFetch('/logros/desbloquear', {
      method: 'POST',
      body: JSON.stringify({ clave_logro: clave }),
    });
    unlockedAchievements.add(clave);
    audio.playAchievement();
    showAchievementNotification(clave);
  } catch (e) {
    // silently fail
  }
}

function showAchievementNotification(clave) {
  const a = ACHIEVEMENTS[clave];
  if (!a) return;
  const div = document.createElement('div');
  div.className = 'achievement-toast';
  div.innerHTML = '<div class="toast-icon">' + a.icono + '</div><div class="toast-text"><div class="toast-label">¡Logro desbloqueado!</div><div class="toast-name">' + a.nombre + '</div></div>';
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add('show'));
  setTimeout(() => {
    div.classList.remove('show');
    setTimeout(() => div.remove(), 400);
  }, 3500);
}

async function loadAchievements() {
  if (!isLoggedIn()) return;
  try {
    const logros = await apiFetch('/logros');
    unlockedAchievements = new Set();
    for (const l of logros) {
      if (l.desbloqueado) unlockedAchievements.add(l.clave);
    }
  } catch {
    // silently fail
  }
}

// ── Progress ──

async function saveProgress() {
  if (!isLoggedIn()) return;
  try {
    await apiFetch('/progreso', {
      method: 'POST',
      body: JSON.stringify({
        nivel_actual: state.currentLevel,
        letras_completadas: state.availableLetters.join(','),
        total_aciertos: state.totalCorrect,
        total_intentos: state.totalAttempts,
        mejor_racha: state.bestStreak,
      }),
    });
  } catch {
    // silently fail
  }
}

async function loadProgress() {
  if (!isLoggedIn()) return null;
  try {
    const p = await apiFetch('/progreso');
    return p;
  } catch {
    return null;
  }
}

// ── Auth UI handlers ──

async function handleRegister(e) {
  e.preventDefault();
  const errorEl = $('#register-error');
  errorEl.classList.add('hidden');

  const usuario = $('#reg-usuario').value.trim();
  const email = $('#reg-email').value.trim();
  const password = $('#reg-password').value;
  const confirm = $('#reg-confirm').value;

  if (password !== confirm) {
    errorEl.textContent = 'Las contraseñas no coinciden';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const data = await apiFetch('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ usuario, email, password }),
    });
    saveToken(data.token);
    userData = { usuario_id: data.usuario_id, usuario: data.usuario };
    await loadUserData();
    showScreen('game');
    startGame();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const errorEl = $('#login-error');
  errorEl.classList.add('hidden');

  const usuario = $('#login-usuario').value.trim();
  const password = $('#login-password').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });
    saveToken(data.token);
    userData = { usuario_id: data.usuario_id, usuario: data.usuario };
    await loadUserData();
    showScreen('game');
    startGame();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
}

function handleLogout() {
  clearAuth();
  unlockedAchievements.clear();
  showScreen('welcome');
}

async function loadUserData() {
  if (!isLoggedIn()) return;
  const el = $('#user-info');
  const nameEl = $('#user-name');
  el.classList.remove('hidden');
  nameEl.textContent = userData.usuario;

  await loadAchievements();
  const p = await loadProgress();
  if (p && p.nivel_actual !== undefined) {
    state.totalCorrect = p.total_aciertos || 0;
    state.totalAttempts = p.total_intentos || 0;
    state.bestStreak = p.mejor_racha || 0;
    if (p.nivel_actual > 0) {
      state.currentLevel = p.nivel_actual;
    }
  }
}

function startGame() {
  if (isLoggedIn() && state.currentLevel > 0) {
    initGameAtLevel(state.currentLevel);
  } else {
    initGame();
  }
}

// ── Guest mode ──

function startGuest() {
  userData = null;
  token = null;
  showScreen('game');
  initGame();
}

// ── Achievements view ──

function renderAchievements() {
  const grid = $('#achievements-grid');
  grid.innerHTML = '';
  let unlockedCount = 0;
  const total = Object.keys(ACHIEVEMENTS).length;

  for (const [clave, def] of Object.entries(ACHIEVEMENTS)) {
    const unlocked = isLoggedIn() && unlockedAchievements.has(clave);
    if (unlocked) unlockedCount++;
    const card = document.createElement('div');
    card.className = 'achievement-card' + (unlocked ? ' unlocked' : ' locked');
    card.innerHTML = '<div class="achievement-icon">' + (unlocked ? def.icono : '🔒') + '</div><div class="achievement-info"><div class="achievement-name">' + def.nombre + '</div><div class="achievement-desc">' + def.desc + '</div></div>';
    grid.appendChild(card);
  }

  const countEl = $('#achievements-count');
  countEl.textContent = unlockedCount + ' / ' + total + (isLoggedIn() ? '' : ' (inicia sesión para guardarlos)');
}

// ── Event listeners ──

function onPressStart(e) {
  if (e) e.preventDefault();
  if (state.isLocked || state.isFlipped) return;

  audio.ensure();
  state.isPressing = true;
  state.pressStartTime = Date.now();
  audio.startTone();
  btn.classList.add('pressed');
}

function onPressEnd(e) {
  if (e) e.preventDefault();
  if (!state.isPressing) return;

  state.isPressing = false;
  const duration = Date.now() - state.pressStartTime;
  audio.stopTone();
  btn.classList.remove('pressed');

  const symbol = duration < 280 ? '.' : '-';
  addSymbol(symbol);
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    onPressStart(e);
  }
  if (e.code === 'KeyF' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    toggleFlip();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    onPressEnd(e);
  }
});

btn.addEventListener('mousedown', onPressStart);
btn.addEventListener('mouseup', onPressEnd);
btn.addEventListener('mouseleave', (e) => {
  if (state.isPressing) onPressEnd(e);
});

btn.addEventListener('touchstart', onPressStart, { passive: false });
btn.addEventListener('touchend', onPressEnd, { passive: false });
btn.addEventListener('touchcancel', onPressEnd, { passive: false });

flipBtn.addEventListener('click', toggleFlip);
card.addEventListener('click', toggleFlip);

$('#btn-show-login').addEventListener('click', () => showScreen('login'));
$('#btn-show-register').addEventListener('click', () => showScreen('register'));
$('#btn-back-welcome-from-login').addEventListener('click', () => showScreen('welcome'));
$('#btn-back-welcome-from-register').addEventListener('click', () => showScreen('welcome'));
$('#btn-guest').addEventListener('click', startGuest);
$('#btn-logout').addEventListener('click', handleLogout);
$('#btn-achievements').addEventListener('click', () => {
  renderAchievements();
  showScreen('achievements');
});
$('#btn-back-game-from-achievements').addEventListener('click', () => showScreen('game'));

$('#form-register').addEventListener('submit', handleRegister);
$('#form-login').addEventListener('submit', handleLogin);

// ── Theme ──

const themeToggle = $('#theme-toggle');

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.innerHTML = theme === 'dark'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

setTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

// ── Init ──

async function boot() {
  const loggedIn = await tryAutoLogin();
  if (loggedIn) {
    await loadUserData();
    showScreen('game');
    startGame();
  } else {
    showScreen('welcome');
  }
}

boot();
