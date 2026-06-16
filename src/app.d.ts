import type { TokenPayload } from '$lib/server/auth';

declare global {
	namespace App {
		interface Locals {
			user?: TokenPayload;
		}
	}
}

export {};
