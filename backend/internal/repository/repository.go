package repository

import (
	"context"
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByUsername(ctx context.Context, username string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	UpdatePasswordHash(ctx context.Context, userID string, passwordHash string) error
	UpdateLastLoginAt(ctx context.Context, userID string, lastLoginAt time.Time) error
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context, limit, offset int) ([]*models.User, error)
}

type VerificationCodeRepository interface {
	InvalidateUnused(ctx context.Context, userID string, verificationType models.VerificationType) error
	Create(ctx context.Context, code *models.VerificationCode) error
	UseIfValid(ctx context.Context, userID string, verificationType models.VerificationType, verifyFn func(codeHash string) bool, now time.Time) (bool, error)
}

type RefreshSessionRepository interface {
	Create(ctx context.Context, session *models.RefreshSession) error
	GetByTokenHash(ctx context.Context, tokenHash string, now time.Time) (*models.RefreshSession, error)
	RotateTokenHash(ctx context.Context, sessionID string, newTokenHash string, now time.Time) error
	RevokeByTokenHash(ctx context.Context, tokenHash string, now time.Time) error
	RevokeAllByUserID(ctx context.Context, userID string, now time.Time) error
}
