CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hash_password TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progreso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nivel_actual INTEGER DEFAULT 0,
    letras_completadas TEXT DEFAULT '',
    total_aciertos INTEGER DEFAULT 0,
    total_intentos INTEGER DEFAULT 0,
    mejor_racha INTEGER DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id)
);

CREATE TABLE IF NOT EXISTS logros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    clave_logro VARCHAR(50) NOT NULL,
    fecha_desbloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, clave_logro)
);
