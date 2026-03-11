package repository

import (
	"context"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context, limit, offset int) ([]*models.User, error)
}

// VideoRepository defines the interface for video data operations
type VideoRepository interface {
	Create(ctx context.Context, video *models.Video) error
	GetByID(ctx context.Context, id string) (*models.Video, error)
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*models.Video, error)
	Update(ctx context.Context, video *models.Video) error
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context, limit, offset int) ([]*models.Video, error)
	IncrementViews(ctx context.Context, videoID string) error
}

// SubtitleRepository defines the interface for subtitle data operations
type SubtitleRepository interface {
	Create(ctx context.Context, subtitle *models.Subtitle) error
	GetByID(ctx context.Context, id string) (*models.Subtitle, error)
	GetByVideoID(ctx context.Context, videoID string, language string) ([]*models.Subtitle, error)
	Update(ctx context.Context, subtitle *models.Subtitle) error
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context, limit, offset int) ([]*models.Subtitle, error)
}

// RepositoryFactory defines the interface for creating repository instances
type RepositoryFactory interface {
	UserRepository() UserRepository
	VideoRepository() VideoRepository
	SubtitleRepository() SubtitleRepository
}
