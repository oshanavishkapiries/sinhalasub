package models

import "github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/entities"

// User represents a user in the system
type User struct {
	entities.BaseEntity
	Name     string `json:"name"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"-"`      // Password should never be serialized
	Status   string `json:"status"` // active, inactive, banned
}

// IsActive checks if user is active
func (u *User) IsActive() bool {
	return u.Status == "active"
}

// Video represents a video in the system
type Video struct {
	entities.BaseEntity
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	URL         string `json:"url" validate:"required,url"`
	Duration    int64  `json:"duration"` // in seconds
	UserID      string `json:"user_id" validate:"required"`
	Status      string `json:"status"` // draft, published, archived
	Views       int64  `json:"views"`
}

// IsPublished checks if video is published
func (v *Video) IsPublished() bool {
	return v.Status == "published"
}

// Subtitle represents a subtitle entry
type Subtitle struct {
	entities.BaseEntity
	VideoID   string `json:"video_id" validate:"required"`
	Language  string `json:"language" validate:"required"`
	StartTime int64  `json:"start_time"` // in milliseconds
	EndTime   int64  `json:"end_time"`   // in milliseconds
	Text      string `json:"text" validate:"required"`
	Status    string `json:"status"` // pending, approved, rejected
}

// IsApproved checks if subtitle is approved
func (s *Subtitle) IsApproved() bool {
	return s.Status == "approved"
}
