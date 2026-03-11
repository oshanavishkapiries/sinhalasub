package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

// DB holds the database connection
type DB struct {
	conn *sql.DB
}

// NewPostgresConnection creates a new PostgreSQL connection
func NewPostgresConnection(host, port, user, password, dbname string) (*DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		utils.ErrorLog("failed to create postgres connection: %s", err)
		return nil, err
	}

	// Test the connection
	err = conn.Ping()
	if err != nil {
		utils.ErrorLog("failed to ping postgres database: %s", err)
		return nil, err
	}

	utils.SuccessLog("successfully connected to PostgreSQL database")
	return &DB{conn: conn}, nil
}

// GetConnection returns the database connection
func (db *DB) GetConnection() *sql.DB {
	return db.conn
}

// Close closes the database connection
func (db *DB) Close() error {
	if db.conn != nil {
		return db.conn.Close()
	}
	return nil
}

// Exec executes a query without returning rows
func (db *DB) Exec(query string, args ...interface{}) (sql.Result, error) {
	return db.conn.Exec(query, args...)
}

// Query executes a query that returns rows
func (db *DB) Query(query string, args ...interface{}) (*sql.Rows, error) {
	return db.conn.Query(query, args...)
}

// QueryRow executes a query that returns a single row
func (db *DB) QueryRow(query string, args ...interface{}) *sql.Row {
	return db.conn.QueryRow(query, args...)
}

// BeginTx begins a transaction
func (db *DB) BeginTx() (*sql.Tx, error) {
	return db.conn.Begin()
}
