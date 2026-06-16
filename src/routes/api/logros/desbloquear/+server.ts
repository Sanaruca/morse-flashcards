import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/db';

const CLAVES_VALIDAS = new Set([
	'primer_nivel', 'nivel_2', 'nivel_3', 'nivel_4', 'nivel_5',
	'todos_niveles', 'racha_5', 'racha_10', 'nivel_perfecto', 'primer_acierto',
]);

export async function POST({ request, locals }) {
	if (!locals.user) throw error(401, 'Token requerido');

	const { clave_logro } = await request.json();

	if (!CLAVES_VALIDAS.has(clave_logro)) {
		throw error(400, 'Logro no válido');
	}

	await query(
		'INSERT INTO logros (usuario_id, clave_logro) VALUES ($1, $2) ON CONFLICT (usuario_id, clave_logro) DO NOTHING',
		[locals.user.usuario_id, clave_logro]
	);

	return json({ mensaje: 'Logro desbloqueado' });
}
