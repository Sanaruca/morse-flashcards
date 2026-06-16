import { writable } from 'svelte/store';
import { ACHIEVEMENTS } from '$lib/data/morse';
import { apiFetch } from '$lib/lib/api';
import { audio } from '$lib/lib/audio';
import { currentStreak, hasCorrectAnswer, levelErrors } from '$lib/stores/game';
import { isLoggedIn } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const unlocked = writable<Set<string>>(new Set());
export const notifications = writable<Array<{ clave: string; nombre: string; icono: string; color: string }>>([]);

export async function loadAchievements() {
	if (!get(isLoggedIn)) return;

	try {
		const logros = await apiFetch<any[]>('/logros');
		const s = new Set<string>();
		for (const l of logros) {
			if (l.desbloqueado) s.add(l.clave);
		}
		unlocked.set(s);
	} catch {
		// silently fail
	}
}

export async function checkAchievements() {
	if (!get(isLoggedIn)) return;

	const checks: string[] = [];

	if (get(hasCorrectAnswer)) checks.push('primer_acierto');

	let streakVal = 0;
	currentStreak.subscribe(v => streakVal = v)();
	if (streakVal >= 5) checks.push('racha_5');
	if (streakVal >= 10) checks.push('racha_10');

	for (const clave of checks) {
		const current = get(unlocked);
		if (!current.has(clave)) {
			await unlockAchievement(clave);
		}
	}
}

export async function checkLevelAchievements(level: number) {
	if (!get(isLoggedIn)) return;

	const levelChecks: Record<number, string> = {
		0: 'primer_nivel',
		1: 'nivel_2',
		2: 'nivel_3',
		3: 'nivel_4',
		4: 'nivel_5',
	};

	const clave = levelChecks[level];
	if (clave) {
		const current = get(unlocked);
		if (!current.has(clave)) {
			await unlockAchievement(clave);
		}
	}

	const LEARNING_ORDER_LENGTH = 6;
	if (level === LEARNING_ORDER_LENGTH - 1) {
		const current = get(unlocked);
		if (!current.has('todos_niveles')) {
			await unlockAchievement('todos_niveles');
		}
	}

	if (get(levelErrors) === 0) {
		const current = get(unlocked);
		if (!current.has('nivel_perfecto')) {
			await unlockAchievement('nivel_perfecto');
		}
	}
}

async function unlockAchievement(clave: string) {
	try {
		await apiFetch('/logros/desbloquear', {
			method: 'POST',
			body: JSON.stringify({ clave_logro: clave }),
		});
		unlocked.update(s => { s.add(clave); return s; });
		audio.playAchievement();
		showNotification(clave);
	} catch {
		// silently fail
	}
}

function showNotification(clave: string) {
	const a = ACHIEVEMENTS[clave];
	if (!a) return;
	const n = { clave, nombre: a.nombre, icono: a.icono, color: a.color };
	notifications.update(arr => [...arr, n]);
	setTimeout(() => {
		notifications.update(arr => arr.filter(item => item.clave !== clave));
	}, 3500);
}
