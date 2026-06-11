package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, ErrorResponse{Error: msg})
}

func handleRegistro(w http.ResponseWriter, r *http.Request) {
	var req RegistroRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	req.Usuario = strings.TrimSpace(req.Usuario)
	req.Email = strings.TrimSpace(req.Email)

	if req.Usuario == "" || req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Todos los campos son obligatorios")
		return
	}

	if len(req.Password) < 6 {
		respondError(w, http.StatusBadRequest, "La contraseña debe tener al menos 6 caracteres")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al procesar la contraseña")
		return
	}

	var usuarioID int
	err = db.QueryRow(
		"INSERT INTO usuarios (usuario, email, hash_password) VALUES ($1, $2, $3) RETURNING id",
		req.Usuario, req.Email, string(hash),
	).Scan(&usuarioID)

	if err != nil {
		errStr := err.Error()
		if strings.Contains(errStr, "duplicate") || strings.Contains(errStr, "unique") || strings.Contains(errStr, "already exists") {
			respondError(w, http.StatusConflict, "El usuario o email ya existe")
			return
		}
		respondError(w, http.StatusInternalServerError, "Error al registrar usuario")
		return
	}

	_, _ = db.Exec(
		"INSERT INTO progreso (usuario_id) VALUES ($1) ON CONFLICT (usuario_id) DO NOTHING",
		usuarioID,
	)

	token, err := generarToken(usuarioID, req.Usuario)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al generar token")
		return
	}

	respondJSON(w, http.StatusCreated, AuthResponse{
		Token:     token,
		Usuario:   req.Usuario,
		UsuarioID: usuarioID,
	})
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	req.Usuario = strings.TrimSpace(req.Usuario)

	if req.Usuario == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Usuario y contraseña son obligatorios")
		return
	}

	var usuario Usuario
	err := db.QueryRow(
		"SELECT id, usuario, hash_password FROM usuarios WHERE usuario = $1",
		req.Usuario,
	).Scan(&usuario.ID, &usuario.Usuario, &usuario.HashPassword)

	if err == sql.ErrNoRows {
		respondError(w, http.StatusUnauthorized, "Usuario o contraseña incorrectos")
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al iniciar sesión")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(usuario.HashPassword), []byte(req.Password)); err != nil {
		respondError(w, http.StatusUnauthorized, "Usuario o contraseña incorrectos")
		return
	}

	token, err := generarToken(usuario.ID, usuario.Usuario)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al generar token")
		return
	}

	respondJSON(w, http.StatusOK, AuthResponse{
		Token:     token,
		Usuario:   usuario.Usuario,
		UsuarioID: usuario.ID,
	})
}

func handleYo(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(userContextKey).(*Claims)
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"usuario_id": claims.UsuarioID,
		"usuario":    claims.Usuario,
	})
}

func handleGetProgreso(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(userContextKey).(*Claims)

	var p Progreso
	err := db.QueryRow(
		`SELECT id, usuario_id, nivel_actual, letras_completadas,
		        total_aciertos, total_intentos, mejor_racha, fecha_actualizacion
		 FROM progreso WHERE usuario_id = $1`,
		claims.UsuarioID,
	).Scan(&p.ID, &p.UsuarioID, &p.NivelActual, &p.LetrasCompletadas,
		&p.TotalAciertos, &p.TotalIntentos, &p.MejorRacha, &p.FechaActualizacion)

	if err == sql.ErrNoRows {
		respondJSON(w, http.StatusOK, Progreso{UsuarioID: claims.UsuarioID})
		return
	}
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al obtener progreso")
		return
	}

	respondJSON(w, http.StatusOK, p)
}

func handleSaveProgreso(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(userContextKey).(*Claims)

	var req ProgresoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	_, err := db.Exec(
		`INSERT INTO progreso (usuario_id, nivel_actual, letras_completadas, total_aciertos, total_intentos, mejor_racha, fecha_actualizacion)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (usuario_id)
		 DO UPDATE SET nivel_actual = EXCLUDED.nivel_actual,
		               letras_completadas = EXCLUDED.letras_completadas,
		               total_aciertos = EXCLUDED.total_aciertos,
		               total_intentos = EXCLUDED.total_intentos,
		               mejor_racha = GREATEST(progreso.mejor_racha, EXCLUDED.mejor_racha),
		               fecha_actualizacion = EXCLUDED.fecha_actualizacion`,
		claims.UsuarioID, req.NivelActual, req.LetrasCompletadas,
		req.TotalAciertos, req.TotalIntentos, req.MejorRacha, time.Now(),
	)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al guardar progreso")
		return
	}

	respondJSON(w, http.StatusOK, MensajeResponse{Mensaje: "Progreso guardado"})
}

func handleGetLogros(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(userContextKey).(*Claims)

	rows, err := db.Query(
		"SELECT clave_logro, fecha_desbloqueo FROM logros WHERE usuario_id = $1",
		claims.UsuarioID,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al obtener logros")
		return
	}
	defer rows.Close()

	unlocked := make(map[string]*time.Time)
	for rows.Next() {
		var clave string
		var fecha time.Time
		if err := rows.Scan(&clave, &fecha); err != nil {
			continue
		}
		unlocked[clave] = &fecha
	}

	result := make([]LogroConEstado, 0, len(LogrosDefinidos))
	for _, l := range LogrosDefinidos {
		fecha, ok := unlocked[l.Clave]
		le := LogroConEstado{
			LogroDefinicion: l,
			Desbloqueado:    ok,
		}
		if ok {
			le.Fecha = fecha
		}
		result = append(result, le)
	}

	respondJSON(w, http.StatusOK, result)
}

func handleDesbloquearLogro(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(userContextKey).(*Claims)

	var req DesbloquearLogroRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	valid := false
	for _, l := range LogrosDefinidos {
		if l.Clave == req.ClaveLogro {
			valid = true
			break
		}
	}
	if !valid {
		respondError(w, http.StatusBadRequest, "Logro no válido")
		return
	}

	_, err := db.Exec(
		"INSERT INTO logros (usuario_id, clave_logro) VALUES ($1, $2) ON CONFLICT (usuario_id, clave_logro) DO NOTHING",
		claims.UsuarioID, req.ClaveLogro,
	)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error al desbloquear logro")
		return
	}

	respondJSON(w, http.StatusOK, MensajeResponse{Mensaje: "Logro desbloqueado"})
}
