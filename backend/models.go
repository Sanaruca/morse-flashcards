package main

import "time"

type Usuario struct {
	ID            int       `json:"id"`
	Usuario       string    `json:"usuario"`
	Email         string    `json:"email,omitempty"`
	HashPassword  string    `json:"-"`
	FechaCreacion time.Time `json:"fecha_creacion"`
}

type Progreso struct {
	ID                 int       `json:"id"`
	UsuarioID          int       `json:"usuario_id"`
	NivelActual        int       `json:"nivel_actual"`
	LetrasCompletadas  string    `json:"letras_completadas"`
	TotalAciertos      int       `json:"total_aciertos"`
	TotalIntentos      int       `json:"total_intentos"`
	MejorRacha         int       `json:"mejor_racha"`
	FechaActualizacion time.Time `json:"fecha_actualizacion"`
}

type LogroDefinicion struct {
	Clave       string `json:"clave"`
	Nombre      string `json:"nombre"`
	Descripcion string `json:"descripcion"`
	Icono       string `json:"icono"`
}

type LogroConEstado struct {
	LogroDefinicion
	Desbloqueado bool       `json:"desbloqueado"`
	Fecha        *time.Time `json:"fecha_desbloqueo,omitempty"`
}

type RegistroRequest struct {
	Usuario  string `json:"usuario"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Usuario  string `json:"usuario"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token     string `json:"token"`
	Usuario   string `json:"usuario"`
	UsuarioID int    `json:"usuario_id"`
}

type ProgresoRequest struct {
	NivelActual       int    `json:"nivel_actual"`
	LetrasCompletadas string `json:"letras_completadas"`
	TotalAciertos     int    `json:"total_aciertos"`
	TotalIntentos     int    `json:"total_intentos"`
	MejorRacha        int    `json:"mejor_racha"`
}

type DesbloquearLogroRequest struct {
	ClaveLogro string `json:"clave_logro"`
}

type MensajeResponse struct {
	Mensaje string `json:"mensaje"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
