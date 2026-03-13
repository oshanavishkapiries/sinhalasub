package models

import (
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/entities"
)

// User represents a user in the system
type User struct {
	entities.BaseEntity
	Username     string     `json:"username" validate:"required"`
	Email        string     `json:"email" validate:"required,email"`
	PasswordHash string     `json:"-"`    // Password hash should never be serialized
	Role         string     `json:"role"` // admin, moderator, platform-user
	Avatar       string     `json:"avatar"`
	IsVerified   bool       `json:"is_verified"`
	IsActive     bool       `json:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
}

// IsUserActive checks if user is active
func (u *User) IsUserActive() bool {
	return u.IsActive
}
