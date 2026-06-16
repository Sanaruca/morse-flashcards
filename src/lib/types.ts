export interface Usuario {
	id: number;
	usuario: string;
	email?: string;
	fecha_creacion?: string;
}

export interface Progreso {
	id?: number;
	usuario_id: number;
	nivel_actual: number;
	letras_completadas: string;
	total_aciertos: number;
	total_intentos: number;
	mejor_racha: number;
	fecha_actualizacion?: string;
}

export interface LogroDefinicion {
	clave: string;
	nombre: string;
	descripcion: string;
	icono: string;
}

export interface LogroConEstado extends LogroDefinicion {
	desbloqueado: boolean;
	fecha_desbloqueo?: string;
}

export interface AuthResponse {
	token: string;
	usuario: string;
	usuario_id: number;
}

export interface RegistroRequest {
	usuario: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	usuario: string;
	password: string;
}

export interface ProgresoRequest {
	nivel_actual: number;
	letras_completadas: string;
	total_aciertos: number;
	total_intentos: number;
	mejor_racha: number;
}

export interface DesbloquearLogroRequest {
	clave_logro: string;
}

export interface UserData {
	usuario_id: number;
	usuario: string;
}
