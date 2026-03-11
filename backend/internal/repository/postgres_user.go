package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

// PostgresUserRepository implements UserRepository for PostgreSQL
type PostgresUserRepository struct {
	db *sql.DB
}

// NewPostgresUserRepository creates a new PostgreSQL user repository
func NewPostgresUserRepository(db *sql.DB) UserRepository {
	return &PostgresUserRepository{db: db}
}

// Create inserts a new user into the database
func (r *PostgresUserRepository) Create(ctx context.Context, user *models.User) error {
	if user.ID == "" {
		user.ID = fmt.Sprintf("user_%d", time.Now().UnixNano())
	}

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	query := `
		INSERT INTO users (id, name, email, password, role, avatar, is_active, created_at, updated_at, deleted_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.ExecContext(ctx, query,
		user.ID,
		user.Name,
		user.Email,
		user.Password,
		user.Role,
		user.Avatar,
		user.IsActive,
		user.CreatedAt,
		user.UpdatedAt,
		user.DeletedAt,
	)

	if err != nil {
		utils.ErrorLog("failed to create user: %s", err)
		return err
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *PostgresUserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, name, email, password, role, avatar, is_active, created_at, updated_at, deleted_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`

	row := r.db.QueryRowContext(ctx, query, id)

	user := &models.User{}
	err := row.Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Avatar,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.DeletedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		utils.ErrorLog("failed to get user by id: %s", err)
		return nil, err
	}

	return user, nil
}

// GetByEmail retrieves a user by email
func (r *PostgresUserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT id, name, email, password, role, avatar, is_active, created_at, updated_at, deleted_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`

	row := r.db.QueryRowContext(ctx, query, email)

	user := &models.User{}
	err := row.Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Avatar,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.DeletedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		utils.ErrorLog("failed to get user by email: %s", err)
		return nil, err
	}

	return user, nil
}

// Update updates an existing user
func (r *PostgresUserRepository) Update(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET name = $1, email = $2, password = $3, role = $4, avatar = $5, is_active = $6, updated_at = $7
		WHERE id = $8 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query,
		user.Name,
		user.Email,
		user.Password,
		user.Role,
		user.Avatar,
		user.IsActive,
		user.UpdatedAt,
		user.ID,
	)

	if err != nil {
		utils.ErrorLog("failed to update user: %s", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		utils.ErrorLog("failed to get rows affected: %s", err)
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// Delete soft deletes a user
func (r *PostgresUserRepository) Delete(ctx context.Context, id string) error {
	now := time.Now()

	query := `
		UPDATE users
		SET deleted_at = $1, updated_at = $2
		WHERE id = $3 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, now, now, id)
	if err != nil {
		utils.ErrorLog("failed to delete user: %s", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		utils.ErrorLog("failed to get rows affected: %s", err)
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// GetAll retrieves all users with pagination
func (r *PostgresUserRepository) GetAll(ctx context.Context, limit, offset int) ([]*models.User, error) {
	query := `
		SELECT id, name, email, password, role, avatar, is_active, created_at, updated_at, deleted_at
		FROM users
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		utils.ErrorLog("failed to get all users: %s", err)
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Password,
			&user.Role,
			&user.Avatar,
			&user.IsActive,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.DeletedAt,
		)

		if err != nil {
			utils.ErrorLog("failed to scan user: %s", err)
			return nil, err
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		utils.ErrorLog("rows error: %s", err)
		return nil, err
	}

	return users, nil
}
