import type { Handle } from '@sveltejs/kit';
import { verificarToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('authorization');

	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.slice(7);
		const payload = verificarToken(token);
		if (payload) {
			event.locals.user = payload;
		}
	}

	const response = await resolve(event);
	return response;
};
