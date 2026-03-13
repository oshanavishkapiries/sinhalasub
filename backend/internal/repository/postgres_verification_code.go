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

type PostgresVerificationCodeRepository struct {
	db *sql.DB
}

func NewPostgresVerificationCodeRepository(db *sql.DB) VerificationCodeRepository {
	return &PostgresVerificationCodeRepository{db: db}
}

func (r *PostgresVerificationCodeRepository) InvalidateUnused(ctx context.Context, userID string, verificationType models.VerificationType) error {
	query := `
		UPDATE verification_codes
		SET used_at = NOW()
		WHERE user_id = $1 AND type = $2 AND used_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query, userID, string(verificationType))
	if err != nil {
		utils.ErrorLog("failed to invalidate unused verification codes: %s", err)
		return err
	}
	return nil
}

func (r *PostgresVerificationCodeRepository) Create(ctx context.Context, code *models.VerificationCode) error {
	query := `
		INSERT INTO verification_codes (user_id, type, code_hash, expires_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	err := r.db.QueryRowContext(ctx, query,
		code.UserID,
		string(code.Type),
		code.CodeHash,
		code.ExpiresAt,
	).Scan(&code.ID, &code.CreatedAt)
	if err != nil {
		utils.ErrorLog("failed to create verification code: %s", err)
		return err
	}

	return nil
}

func (r *PostgresVerificationCodeRepository) UseIfValid(
	ctx context.Context,
	userID string,
	verificationType models.VerificationType,
	verifyFn func(codeHash string) bool,
	now time.Time,
) (bool, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return false, err
	}
	defer func() { _ = tx.Rollback() }()

	query := `
		SELECT id, code_hash, expires_at
		FROM verification_codes
		WHERE user_id = $1 AND type = $2 AND used_at IS NULL
		ORDER BY created_at DESC
		LIMIT 1
		FOR UPDATE
	`

	var (
		codeID    string
		codeHash  string
		expiresAt time.Time
	)

	err = tx.QueryRowContext(ctx, query, userID, string(verificationType)).Scan(&codeID, &codeHash, &expiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	if now.After(expiresAt) {
		return false, nil
	}

	if !verifyFn(codeHash) {
		return false, nil
	}

	update := `
		UPDATE verification_codes
		SET used_at = $1
		WHERE id = $2 AND used_at IS NULL
	`

	result, err := tx.ExecContext(ctx, update, now, codeID)
	if err != nil {
		return false, err
	}

	ra, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	if ra != 1 {
		return false, fmt.Errorf("failed to mark verification code as used")
	}

	if err := tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
}
