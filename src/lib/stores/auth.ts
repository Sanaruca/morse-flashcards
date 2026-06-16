import { writable, derived } from 'svelte/store';
import { setApiToken, apiFetch } from '$lib/lib/api';
import type { AuthResponse, UserData } from '$lib/types';

export const token = writable<string | null>(null);
export const userData = writable<UserData | null>(null);
export const loading = writable(true);
export const isLoggedIn = derived([token, userData], ([$t, $u]) => !!$t && !!$u);

function saveToken(t: string) {
	token.set(t);
	setApiToken(t);
	localStorage.setItem('token', t);
}

function clearAuth() {
	token.set(null);
	userData.set(null);
	setApiToken(null);
	localStorage.removeItem('token');
}

export async function initAuth() {
	loading.set(true);
	const saved = localStorage.getItem('token');
	if (!saved) {
		loading.set(false);
		return;
	}
	setApiToken(saved);
	try {
		const data = await apiFetch<UserData>('/auth/yo');
		saveToken(saved);
		userData.set(data);
	} catch {
		clearAuth();
	} finally {
		loading.set(false);
	}
}

export async function login(usuario: string, password: string) {
	const data = await apiFetch<AuthResponse>('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ usuario, password })
	});
	saveToken(data.token);
	userData.set({ usuario_id: data.usuario_id, usuario: data.usuario });
}

export async function register(usuario: string, email: string, password: string) {
	const data = await apiFetch<AuthResponse>('/auth/registro', {
		method: 'POST',
		body: JSON.stringify({ usuario, email, password })
	});
	saveToken(data.token);
	userData.set({ usuario_id: data.usuario_id, usuario: data.usuario });
}

export function logout() {
	clearAuth();
}
