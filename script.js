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
  isFlipped: false
};

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
}

const audio = new MorseAudio();

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function initGame() {
  state.currentLevel = 0;
  loadLevel(0);
}

function loadLevel(level) {
  if (level >= LEARNING_ORDER.length) {
    showVictory();
    return;
  }

  state.currentLevel = level;
  const newLetters = LEARNING_ORDER[level];
  state.availableLetters = state.availableLetters.concat(newLetters);
  rebuildDeck();
}

function rebuildDeck() {
  state.activeDeck = [...state.availableLetters];
  shuffle(state.activeDeck);
  state.progress = 0;
  state.totalCards = state.activeDeck.length;
  updateProgressBar();
  levelIndicator.textContent = `Nivel ${state.currentLevel + 1}`;

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
  span.className = `symbol symbol-${symbol === '.' ? 'dot' : 'dash'}`;
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

function handleCorrect() {
  state.isLocked = true;
  card.className = 'success';
  cardLetter.className = 'success';
  audio.playSuccess();

  state.progress++;
  updateProgressBar();

  instruction.textContent = '¡Correcto!';
  instruction.className = 'success';

  setTimeout(() => {
    if (state.progress >= state.availableLetters.length) {
      loadLevel(state.currentLevel + 1);
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

  correctMorse.textContent = formatMorse(correct);
  correctMorse.classList.remove('hidden');

  instruction.textContent = `${state.currentCard} → ${formatMorse(correct)}`;
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
  progressBar.style.width = `${Math.min(pct, 100)}%`;
}

function showVictory() {
  cardLetter.textContent = '🎉';
  card.className = 'success';
  inputDisplay.innerHTML = '';
  correctMorse.classList.add('hidden');
  instruction.textContent = '¡Has completado todos los niveles!';
  levelIndicator.textContent = '¡Completado!';
  progressBar.style.width = '100%';
  flipBtn.style.display = 'none';
}

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

initGame();
