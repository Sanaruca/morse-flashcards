const API_BASE = '/api';

let token: string | null = null;

export function setApiToken(t: string | null) {
	token = t;
}

export function getApiToken(): string | null {
	return token;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};
	if (token) {
		headers['Authorization'] = 'Bearer ' + token;
	}
	const res = await fetch(API_BASE + path, { ...options, headers });
	const data = await res.json();
	if (!res.ok) throw new Error((data as any).error || 'Error del servidor');
	return data as T;
}
