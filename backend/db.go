package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "morse")
	password := getEnv("DB_PASSWORD", "morse_secret_123")
	dbname := getEnv("DB_NAME", "morse_flashcards")

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname,
	)

	var err error
	for i := 0; i < 30; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			err = db.Ping()
		}
		if err == nil {
			break
		}
		log.Printf("Esperando a PostgreSQL (intento %d/30)...", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("Error al conectar a PostgreSQL: %v", err)
	}

	log.Println("Conectado a PostgreSQL exitosamente")
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
