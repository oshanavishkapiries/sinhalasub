package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

type PostgresRefreshSessionRepository struct {
	db *sql.DB
}

func NewPostgresRefreshSessionRepository(db *sql.DB) RefreshSessionRepository {
	return &PostgresRefreshSessionRepository{db: db}
}

func (r *PostgresRefreshSessionRepository) Create(ctx context.Context, session *models.RefreshSession) error {
	query := `
		INSERT INTO refresh_sessions (user_id, token_hash, user_agent, ip_address, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		session.UserID,
		session.TokenHash,
		session.UserAgent,
		session.IPAddress,
		session.ExpiresAt,
	).Scan(&session.ID, &session.CreatedAt, &session.UpdatedAt)
	if err != nil {
		utils.ErrorLog("failed to create refresh session: %s", err)
		return err
	}
	return nil
}

func (r *PostgresRefreshSessionRepository) GetByTokenHash(ctx context.Context, tokenHash string, now time.Time) (*models.RefreshSession, error) {
	query := `
		SELECT id, user_id, token_hash, user_agent, ip_address, expires_at, revoked_at, created_at, updated_at
		FROM refresh_sessions
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > $2
	`

	s := &models.RefreshSession{}
	err := r.db.QueryRowContext(ctx, query, tokenHash, now).Scan(
		&s.ID,
		&s.UserID,
		&s.TokenHash,
		&s.UserAgent,
		&s.IPAddress,
		&s.ExpiresAt,
		&s.RevokedAt,
		&s.CreatedAt,
		&s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		utils.ErrorLog("failed to get refresh session: %s", err)
		return nil, err
	}
	return s, nil
}

func (r *PostgresRefreshSessionRepository) RotateTokenHash(ctx context.Context, sessionID string, newTokenHash string, now time.Time) error {
	query := `
		UPDATE refresh_sessions
		SET token_hash = $1, updated_at = $2
		WHERE id = $3 AND revoked_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query, newTokenHash, now, sessionID)
	if err != nil {
		utils.ErrorLog("failed to rotate refresh session token: %s", err)
		return err
	}
	return nil
}

func (r *PostgresRefreshSessionRepository) RevokeByTokenHash(ctx context.Context, tokenHash string, now time.Time) error {
	query := `
		UPDATE refresh_sessions
		SET revoked_at = $1, updated_at = $1
		WHERE token_hash = $2 AND revoked_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query, now, tokenHash)
	if err != nil {
		utils.ErrorLog("failed to revoke refresh session: %s", err)
		return err
	}
	return nil
}

func (r *PostgresRefreshSessionRepository) RevokeAllByUserID(ctx context.Context, userID string, now time.Time) error {
	query := `
		UPDATE refresh_sessions
		SET revoked_at = $1, updated_at = $1
		WHERE user_id = $2 AND revoked_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query, now, userID)
	if err != nil {
		utils.ErrorLog("failed to revoke all refresh sessions: %s", err)
		return err
	}
	return nil
}
