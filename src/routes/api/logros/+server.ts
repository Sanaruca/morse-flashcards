import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/db';

const LOGROS_DEFINIDOS = [
	{ clave: 'primer_nivel', nombre: 'Primeros Pasos', descripcion: 'Completa el Nivel 1', icono: '🌟' },
	{ clave: 'nivel_2', nombre: 'En Progreso', descripcion: 'Completa el Nivel 2', icono: '📈' },
	{ clave: 'nivel_3', nombre: 'Comunicador', descripcion: 'Completa el Nivel 3', icono: '🗣️' },
	{ clave: 'nivel_4', nombre: 'Experto', descripcion: 'Completa el Nivel 4', icono: '🎯' },
	{ clave: 'nivel_5', nombre: 'Casi un Maestro', descripcion: 'Completa el Nivel 5', icono: '🔝' },
	{ clave: 'todos_niveles', nombre: 'Gran Maestro Morse', descripcion: 'Completa todos los niveles', icono: '🏆' },
	{ clave: 'racha_5', nombre: 'Racha', descripcion: '5 aciertos seguidos', icono: '🔥' },
	{ clave: 'racha_10', nombre: 'Imparable', descripcion: '10 aciertos seguidos', icono: '⚡' },
	{ clave: 'nivel_perfecto', nombre: 'Perfecto', descripcion: 'Completa un nivel sin errores', icono: '💎' },
	{ clave: 'primer_acierto', nombre: 'Primer Intento', descripcion: 'Acierta tu primera letra', icono: '🎯' },
];

export async function GET({ locals }) {
	if (!locals.user) throw error(401, 'Token requerido');

	const result = await query(
		'SELECT clave_logro, fecha_desbloqueo FROM logros WHERE usuario_id = $1',
		[locals.user.usuario_id]
	);

	const unlocked = new Map<string, string>();
	for (const row of result.rows) {
		unlocked.set(row.clave_logro, row.fecha_desbloqueo);
	}

	const logros = LOGROS_DEFINIDOS.map(l => ({
		...l,
		desbloqueado: unlocked.has(l.clave),
		fecha_desbloqueo: unlocked.get(l.clave) || null,
	}));

	return json(logros);
}
