package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"strings"
)

func loadEnv() {
	f, err := os.Open(".env")
	if err != nil {
		return
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}

func main() {
	loadEnv()
	initDB()
	defer db.Close()

	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/auth/registro", handleRegistro)
	mux.HandleFunc("POST /api/auth/login", handleLogin)
	mux.HandleFunc("GET /api/auth/yo", authMiddleware(handleYo))

	mux.HandleFunc("GET /api/progreso", authMiddleware(handleGetProgreso))
	mux.HandleFunc("POST /api/progreso", authMiddleware(handleSaveProgreso))

	mux.HandleFunc("GET /api/logros", authMiddleware(handleGetLogros))
	mux.HandleFunc("POST /api/logros/desbloquear", authMiddleware(handleDesbloquearLogro))

	fs := http.FileServer(http.Dir("."))
	mux.Handle("/", fs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Servidor iniciado en http://0.0.0.0:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
