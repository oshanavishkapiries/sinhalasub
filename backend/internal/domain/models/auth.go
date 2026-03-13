package models

import "time"

type VerificationType string

const (
	VerificationTypeSignup        VerificationType = "signup"
	VerificationTypePasswordReset VerificationType = "password_reset"
)

type VerificationCode struct {
	ID        string
	UserID    string
	Type      VerificationType
	CodeHash  string
	ExpiresAt time.Time
	UsedAt    *time.Time
	CreatedAt time.Time
}

type RefreshSession struct {
	ID        string
	UserID    string
	TokenHash string
	UserAgent string
	IPAddress string
	ExpiresAt time.Time
	RevokedAt *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}
