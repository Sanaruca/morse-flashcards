import { json, error } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.user) {
		throw error(401, 'Token requerido');
	}

	return json({
		usuario_id: locals.user.usuario_id,
		usuario: locals.user.usuario,
	});
}
