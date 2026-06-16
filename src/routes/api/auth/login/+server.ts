import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { query } from '$lib/server/db';
import { generarToken } from '$lib/server/auth';

export async function POST({ request }) {
	const { usuario, password } = await request.json();

	if (!usuario?.trim() || !password) {
		throw error(400, 'Usuario y contraseña son obligatorios');
	}

	const result = await query(
		'SELECT id, usuario, hash_password FROM usuarios WHERE usuario = $1',
		[usuario.trim()]
	);

	if (result.rows.length === 0) {
		throw error(401, 'Usuario o contraseña incorrectos');
	}

	const user = result.rows[0];

	if (!bcrypt.compareSync(password, user.hash_password)) {
		throw error(401, 'Usuario o contraseña incorrectos');
	}

	const token = generarToken(user.id, user.usuario);

	return json({ token, usuario: user.usuario, usuario_id: user.id });
}
