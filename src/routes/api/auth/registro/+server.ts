import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { query } from '$lib/server/db';
import { generarToken } from '$lib/server/auth';

export async function POST({ request }) {
	const { usuario, email, password } = await request.json();

	if (!usuario?.trim() || !email?.trim() || !password) {
		throw error(400, 'Todos los campos son obligatorios');
	}

	if (password.length < 6) {
		throw error(400, 'La contraseña debe tener al menos 6 caracteres');
	}

	const hash = bcrypt.hashSync(password, 10);

	try {
		const result = await query(
			'INSERT INTO usuarios (usuario, email, hash_password) VALUES ($1, $2, $3) RETURNING id',
			[usuario.trim(), email.trim(), hash]
		);
		const usuarioID = result.rows[0].id;

		await query(
			'INSERT INTO progreso (usuario_id) VALUES ($1) ON CONFLICT (usuario_id) DO NOTHING',
			[usuarioID]
		);

		const token = generarToken(usuarioID, usuario.trim());

		return json({ token, usuario: usuario.trim(), usuario_id: usuarioID }, { status: 201 });
	} catch (err: any) {
		const msg = err.message || '';
		if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists')) {
			throw error(409, 'El usuario o email ya existe');
		}
		throw error(500, 'Error al registrar usuario');
	}
}
