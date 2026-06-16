import { writable } from 'svelte/store';

export const theme = writable<'light' | 'dark'>('light');

function getPreferred(): 'light' | 'dark' {
	if (typeof localStorage === 'undefined') return 'light';
	const saved = localStorage.getItem('theme');
	if (saved === 'dark' || saved === 'light') return saved;
	if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}
	return 'light';
}

function apply(t: 'light' | 'dark') {
	document.documentElement.setAttribute('data-theme', t);
	localStorage.setItem('theme', t);
}

export function initTheme() {
	const t = getPreferred();
	theme.set(t);
	apply(t);
}

export function toggleTheme() {
	theme.update(t => {
		const next = t === 'dark' ? 'light' : 'dark';
		apply(next);
		return next;
	});
}
