import pg from 'pg';
import { env } from '$env/dynamic/private';

const DB_HOST = env.DB_HOST || 'localhost';
const DB_PORT = env.DB_PORT || '5432';
const DB_USER = env.DB_USER || 'morse';
const DB_PASSWORD = env.DB_PASSWORD || 'morse_secret_123';
const DB_NAME = env.DB_NAME || 'morse_flashcards';

const pool = new pg.Pool({
	host: DB_HOST,
	port: parseInt(DB_PORT || '5432'),
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
	console.error('Error inesperado en PostgreSQL pool:', err);
});

export async function query(text: string, params?: any[]) {
	const client = await pool.connect();
	try {
		const result = await client.query(text, params);
		return result;
	} finally {
		client.release();
	}
}

export async function getClient() {
	return pool.connect();
}

export { pool };
