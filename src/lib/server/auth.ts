import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

const secret = env.JWT_SECRET || 'morse-flashcards-secret-key-change-in-production';

export interface TokenPayload {
	usuario_id: number;
	usuario: string;
}

export function generarToken(usuarioID: number, usuario: string): string {
	return jwt.sign(
		{ usuario_id: usuarioID, usuario },
		secret,
		{ expiresIn: '72h' }
	);
}

export function verificarToken(token: string): TokenPayload | null {
	try {
		const decoded = jwt.verify(token, secret) as TokenPayload;
		return decoded;
	} catch {
		return null;
	}
}
