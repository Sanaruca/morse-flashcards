import { writable, derived, get } from 'svelte/store';
import { MORSE_CODE, LEARNING_ORDER, formatMorse } from '$lib/data/morse';
import { audio } from '$lib/lib/audio';
import { apiFetch } from '$lib/lib/api';
import { isLoggedIn } from '$lib/stores/auth';
import { checkAchievements, checkLevelAchievements } from '$lib/stores/achievements';

export const availableLetters = writable<string[]>([]);
export const activeDeck = writable<string[]>([]);
export const currentCard = writable<string | null>(null);
export const userInput = writable('');
export const progress = writable(0);
export const totalCards = writable(0);
export const currentLevel = writable<number | undefined>(undefined);
export const isLocked = writable(false);
export const isFlipped = writable(false);
export const currentStreak = writable(0);
export const levelErrors = writable(0);
export const totalCorrect = writable(0);
export const totalAttempts = writable(0);
export const bestStreak = writable(0);
export const hasCorrectAnswer = writable(false);
export const isEvaluating = writable(false);

export const progressPct = derived([progress, availableLetters], ([$p, $a]) =>
	$a.length > 0 ? Math.min(($p / $a.length) * 100, 100) : 0
);

export const levelLabel = derived(currentLevel, ($l) => `Nivel ${$l + 1}`);

let evaluationTimer: ReturnType<typeof setTimeout> | null = null;
let pressStartTime = 0;

function shuffle(arr: string[]) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}

export function initGame() {
	currentLevel.set(0);
	currentStreak.set(0);
	levelErrors.set(0);
	totalCorrect.set(0);
	totalAttempts.set(0);
	bestStreak.set(0);
	hasCorrectAnswer.set(false);
	availableLetters.set([]);
	loadLevel(0);
}

export function initGameAtLevel(level: number) {
	let letters: string[] = [];
	for (let i = 0; i <= level; i++) {
		if (i >= LEARNING_ORDER.length) break;
		letters = letters.concat(LEARNING_ORDER[i]);
	}
	availableLetters.set(letters);
	currentLevel.set(level);
	currentStreak.set(0);
	levelErrors.set(0);
	hasCorrectAnswer.set(false);
	rebuildDeck();
}

function loadLevel(level: number) {
	if (level >= LEARNING_ORDER.length) {
		showVictory();
		return;
	}

	currentLevel.set(level);
	const newLetters = LEARNING_ORDER[level];
	availableLetters.update(prev => [...prev, ...newLetters]);
	levelErrors.set(0);
	rebuildDeck();
}

function rebuildDeck() {
	const deck = [...get(availableLetters)];
	shuffle(deck);
	activeDeck.set(deck);
	progress.set(0);
	totalCards.set(deck.length);

	if (deck.length > 0) {
		nextCard();
	}
}

function nextCard() {
	const deck = get(activeDeck);
	if (deck.length === 0) {
		loadLevel(get(currentLevel) + 1);
		return;
	}

	const card = deck.pop()!;
	activeDeck.set(deck);
	currentCard.set(card);
	userInput.set('');
	isEvaluating.set(false);
	isLocked.set(false);
	hasCorrectAnswer.set(false);
	setFlipped(false);
}

export function setFlipped(flipped: boolean) {
	isFlipped.set(flipped);
}

export function toggleFlip() {
	if (get(isLocked)) return;
	setFlipped(!get(isFlipped));
}

export function addSymbol(symbol: '.' | '-') {
	if (get(isLocked) || get(isEvaluating) || get(isFlipped)) return;

	userInput.update(prev => prev + symbol);

	if (evaluationTimer) clearTimeout(evaluationTimer);
	evaluationTimer = setTimeout(evaluateInput, 650);
}

function evaluateInput() {
	if (get(isLocked) || get(isEvaluating)) return;
	if (get(userInput).length === 0) return;

	if (get(isFlipped)) {
		setFlipped(false);
	}

	isEvaluating.set(true);
	const correct = MORSE_CODE[get(currentCard)!];

	if (get(userInput) === correct) {
		handleCorrect();
	} else {
		handleError(correct);
	}
}

async function handleCorrect() {
	isLocked.set(true);
	audio.playSuccess();

	progress.update(p => p + 1);
	currentStreak.update(s => s + 1);
	totalCorrect.update(c => c + 1);
	hasCorrectAnswer.set(true);
	bestStreak.update(b => Math.max(b, get(currentStreak)));

	checkAchievements();

	await new Promise(resolve => setTimeout(resolve, 1100));

	if (get(progress) >= get(availableLetters).length) {
		const completedLevel = get(currentLevel);
		loadLevel(get(currentLevel) + 1);
		checkLevelAchievements(completedLevel);
		if (get(isLoggedIn)) {
			await saveProgress();
		}
	} else {
		nextCard();
	}
}

function handleError(correct: string) {
	isLocked.set(true);
	isEvaluating.set(false);
	hasCorrectAnswer.set(false);
	audio.playError();

	currentStreak.set(0);
	levelErrors.update(e => e + 1);
	totalAttempts.update(a => a + 1);

	const card = get(currentCard)!;
	activeDeck.update(deck => {
		const pos = Math.floor(Math.random() * (deck.length + 1));
		deck.splice(pos, 0, card);
		return deck;
	});

	setTimeout(nextCard, 1800);
}

export function pressStart() {
	if (get(isLocked) || get(isFlipped)) return;

	audio.ensure();
	pressStartTime = Date.now();
	audio.startTone();
}

export function pressEnd() {
	if (!pressStartTime) return;

	const duration = Date.now() - pressStartTime;
	pressStartTime = 0;
	audio.stopTone();

	const symbol = duration < 280 ? '.' : '-';
	addSymbol(symbol);
}

function showVictory() {
	currentCard.set(null);
	const letterCount = get(availableLetters).length;
	progress.set(letterCount);

	if (get(isLoggedIn)) {
		saveProgress();
		checkAchievements();
	}
}

export function getCorrectMorse(): string {
	const card = get(currentCard);
	if (!card) return '';
	return formatMorse(MORSE_CODE[card]);
}

export function getCardAnswer(): string[] {
	const card = get(currentCard);
	if (!card) return [];
	return MORSE_CODE[card].split('');
}

async function saveProgress() {
	if (!get(isLoggedIn)) return;

	try {
		await apiFetch('/progreso', {
			method: 'POST',
			body: JSON.stringify({
				nivel_actual: get(currentLevel),
				letras_completadas: get(availableLetters).join(','),
				total_aciertos: get(totalCorrect),
				total_intentos: get(totalAttempts),
				mejor_racha: get(bestStreak),
			}),
		});
	} catch {
		// silently fail
	}
}

export async function loadProgress() {
	try {
		return await apiFetch<any>('/progreso');
	} catch {
		return null;
	}
}

export function setGameStateFromProgress(p: any) {
	totalCorrect.set(p.total_aciertos || 0);
	totalAttempts.set(p.total_intentos || 0);
	bestStreak.set(p.mejor_racha || 0);
	if (p.nivel_actual > 0) {
		initGameAtLevel(p.nivel_actual);
	}
}
