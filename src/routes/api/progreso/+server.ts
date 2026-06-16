import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export async function GET({ locals }) {
	if (!locals.user) throw error(401, 'Token requerido');

	const result = await query(
		`SELECT id, usuario_id, nivel_actual, letras_completadas,
		        total_aciertos, total_intentos, mejor_racha, fecha_actualizacion
		 FROM progreso WHERE usuario_id = $1`,
		[locals.user.usuario_id]
	);

	if (result.rows.length === 0) {
		return json({ usuario_id: locals.user.usuario_id });
	}

	return json(result.rows[0]);
}

export async function POST({ request, locals }) {
	if (!locals.user) throw error(401, 'Token requerido');

	const body = await request.json();

	await query(
		`INSERT INTO progreso (usuario_id, nivel_actual, letras_completadas, total_aciertos, total_intentos, mejor_racha, fecha_actualizacion)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW())
		 ON CONFLICT (usuario_id)
		 DO UPDATE SET nivel_actual = EXCLUDED.nivel_actual,
		               letras_completadas = EXCLUDED.letras_completadas,
		               total_aciertos = EXCLUDED.total_aciertos,
		               total_intentos = EXCLUDED.total_intentos,
		               mejor_racha = GREATEST(progreso.mejor_racha, EXCLUDED.mejor_racha),
		               fecha_actualizacion = EXCLUDED.fecha_actualizacion`,
		[
			locals.user.usuario_id,
			body.nivel_actual,
			body.letras_completadas || '',
			body.total_aciertos || 0,
			body.total_intentos || 0,
			body.mejor_racha || 0,
		]
	);

	return json({ mensaje: 'Progreso guardado' });
}
