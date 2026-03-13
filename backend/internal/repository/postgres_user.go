package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
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
	query := `
		INSERT INTO users (username, email, password_hash, role, avatar, is_verified, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.Avatar,
		user.IsVerified,
		user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		utils.ErrorLog("failed to create user: %s", err)
		return err
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *PostgresUserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, username, email, password_hash, role, avatar, is_verified, is_active, last_login_at, created_at, updated_at, deleted_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`

	row := r.db.QueryRowContext(ctx, query, id)

	user := &models.User{}
	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.Avatar,
		&user.IsVerified,
		&user.IsActive,
		&user.LastLoginAt,
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
		SELECT id, username, email, password_hash, role, avatar, is_verified, is_active, last_login_at, created_at, updated_at, deleted_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`

	row := r.db.QueryRowContext(ctx, query, email)

	user := &models.User{}
	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.Avatar,
		&user.IsVerified,
		&user.IsActive,
		&user.LastLoginAt,
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

// GetByUsername retrieves a user by username
func (r *PostgresUserRepository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	query := `
		SELECT id, username, email, password_hash, role, avatar, is_verified, is_active, last_login_at, created_at, updated_at, deleted_at
		FROM users
		WHERE username = $1 AND deleted_at IS NULL
	`

	row := r.db.QueryRowContext(ctx, query, username)

	user := &models.User{}
	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.Avatar,
		&user.IsVerified,
		&user.IsActive,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.DeletedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		utils.ErrorLog("failed to get user by username: %s", err)
		return nil, err
	}

	return user, nil
}

// Update updates an existing user
func (r *PostgresUserRepository) Update(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET username = $1, email = $2, password_hash = $3, role = $4, avatar = $5, is_verified = $6, is_active = $7, last_login_at = $8, updated_at = $9
		WHERE id = $10 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.Avatar,
		user.IsVerified,
		user.IsActive,
		user.LastLoginAt,
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

func (r *PostgresUserRepository) UpdatePasswordHash(ctx context.Context, userID string, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, passwordHash, userID)
	if err != nil {
		utils.ErrorLog("failed to update password hash: %s", err)
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

func (r *PostgresUserRepository) UpdateLastLoginAt(ctx context.Context, userID string, lastLoginAt time.Time) error {
	query := `
		UPDATE users
		SET last_login_at = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query, lastLoginAt, userID)
	if err != nil {
		utils.ErrorLog("failed to update last_login_at: %s", err)
		return err
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

// List retrieves users with pagination and filters.
func (r *PostgresUserRepository) List(ctx context.Context, filter UserListFilter) ([]*models.User, int, error) {
	where := []string{"deleted_at IS NULL"}
	args := []interface{}{}
	argPos := 1

	if strings.TrimSpace(filter.Search) != "" {
		where = append(where, fmt.Sprintf("(username ILIKE $%d OR email ILIKE $%d)", argPos, argPos))
		args = append(args, "%"+strings.TrimSpace(filter.Search)+"%")
		argPos++
	}
	if strings.TrimSpace(filter.Role) != "" {
		where = append(where, fmt.Sprintf("role = $%d", argPos))
		args = append(args, strings.TrimSpace(filter.Role))
		argPos++
	}
	if filter.IsActive != nil {
		where = append(where, fmt.Sprintf("is_active = $%d", argPos))
		args = append(args, *filter.IsActive)
		argPos++
	}
	if filter.IsVerified != nil {
		where = append(where, fmt.Sprintf("is_verified = $%d", argPos))
		args = append(args, *filter.IsVerified)
		argPos++
	}

	whereSQL := strings.Join(where, " AND ")

	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM users WHERE %s`, whereSQL)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		utils.ErrorLog("failed to count users: %s", err)
		return nil, 0, err
	}

	sortBy := "created_at"
	switch filter.SortBy {
	case "username", "email", "created_at", "updated_at", "last_login_at":
		sortBy = filter.SortBy
	}
	sortOrder := "DESC"
	if strings.EqualFold(filter.SortOrder, "asc") {
		sortOrder = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT id, username, email, password_hash, role, avatar, is_verified, is_active, last_login_at, created_at, updated_at, deleted_at
		FROM users
		WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereSQL, sortBy, sortOrder, argPos, argPos+1)

	args = append(args, filter.Limit, filter.Offset)
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		utils.ErrorLog("failed to list users: %s", err)
		return nil, 0, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.PasswordHash,
			&user.Role,
			&user.Avatar,
			&user.IsVerified,
			&user.IsActive,
			&user.LastLoginAt,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.DeletedAt,
		)

		if err != nil {
			utils.ErrorLog("failed to scan user: %s", err)
			return nil, 0, err
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		utils.ErrorLog("rows error: %s", err)
		return nil, 0, err
	}

	return users, total, nil
}
