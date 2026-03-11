package service

import (
	"context"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// UserService defines the business logic for user operations
type UserService interface {
	CreateUser(ctx context.Context, name, email, password string) (*models.User, error)
	GetUser(ctx context.Context, id string) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
	DeleteUser(ctx context.Context, id string) error
	ListUsers(ctx context.Context, limit, offset int) ([]*models.User, error)
}

// VideoService defines the business logic for video operations
type VideoService interface {
	CreateVideo(ctx context.Context, video *models.Video) (*models.Video, error)
	GetVideo(ctx context.Context, id string) (*models.Video, error)
	GetUserVideos(ctx context.Context, userID string, limit, offset int) ([]*models.Video, error)
	UpdateVideo(ctx context.Context, video *models.Video) error
	DeleteVideo(ctx context.Context, id string) error
	PublishVideo(ctx context.Context, id string) error
	ListVideos(ctx context.Context, limit, offset int) ([]*models.Video, error)
}

// SubtitleService defines the business logic for subtitle operations
type SubtitleService interface {
	CreateSubtitle(ctx context.Context, subtitle *models.Subtitle) (*models.Subtitle, error)
	GetSubtitle(ctx context.Context, id string) (*models.Subtitle, error)
	GetVideoSubtitles(ctx context.Context, videoID string, language string) ([]*models.Subtitle, error)
	UpdateSubtitle(ctx context.Context, subtitle *models.Subtitle) error
	DeleteSubtitle(ctx context.Context, id string) error
	ApproveSubtitle(ctx context.Context, id string) error
	ListSubtitles(ctx context.Context, limit, offset int) ([]*models.Subtitle, error)
}

// userServiceImpl is the concrete implementation of UserService
type userServiceImpl struct {
	repo repository.UserRepository
}

// NewUserService creates a new user service instance
func NewUserService(repo repository.UserRepository) UserService {
	return &userServiceImpl{repo: repo}
}

func (us *userServiceImpl) CreateUser(ctx context.Context, name, email, password string) (*models.User, error) {
	user := &models.User{
		Name:     name,
		Email:    email,
		Password: password,
		Role:     "user",
		IsActive: true,
	}
	if err := us.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (us *userServiceImpl) GetUser(ctx context.Context, id string) (*models.User, error) {
	return us.repo.GetByID(ctx, id)
}

func (us *userServiceImpl) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return us.repo.GetByEmail(ctx, email)
}

func (us *userServiceImpl) UpdateUser(ctx context.Context, user *models.User) error {
	return us.repo.Update(ctx, user)
}

func (us *userServiceImpl) DeleteUser(ctx context.Context, id string) error {
	return us.repo.Delete(ctx, id)
}

func (us *userServiceImpl) ListUsers(ctx context.Context, limit, offset int) ([]*models.User, error) {
	return us.repo.GetAll(ctx, limit, offset)
}

// videoServiceImpl is the concrete implementation of VideoService
type videoServiceImpl struct {
	repo repository.VideoRepository
}

// NewVideoService creates a new video service instance
func NewVideoService(repo repository.VideoRepository) VideoService {
	return &videoServiceImpl{repo: repo}
}

func (vs *videoServiceImpl) CreateVideo(ctx context.Context, video *models.Video) (*models.Video, error) {
	video.Status = "draft"
	video.Views = 0
	if err := vs.repo.Create(ctx, video); err != nil {
		return nil, err
	}
	return video, nil
}

func (vs *videoServiceImpl) GetVideo(ctx context.Context, id string) (*models.Video, error) {
	return vs.repo.GetByID(ctx, id)
}

func (vs *videoServiceImpl) GetUserVideos(ctx context.Context, userID string, limit, offset int) ([]*models.Video, error) {
	return vs.repo.GetByUserID(ctx, userID, limit, offset)
}

func (vs *videoServiceImpl) UpdateVideo(ctx context.Context, video *models.Video) error {
	return vs.repo.Update(ctx, video)
}

func (vs *videoServiceImpl) DeleteVideo(ctx context.Context, id string) error {
	return vs.repo.Delete(ctx, id)
}

func (vs *videoServiceImpl) PublishVideo(ctx context.Context, id string) error {
	video, err := vs.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	video.Status = "published"
	return vs.repo.Update(ctx, video)
}

func (vs *videoServiceImpl) ListVideos(ctx context.Context, limit, offset int) ([]*models.Video, error) {
	return vs.repo.GetAll(ctx, limit, offset)
}

// subtitleServiceImpl is the concrete implementation of SubtitleService
type subtitleServiceImpl struct {
	repo repository.SubtitleRepository
}

// NewSubtitleService creates a new subtitle service instance
func NewSubtitleService(repo repository.SubtitleRepository) SubtitleService {
	return &subtitleServiceImpl{repo: repo}
}

func (ss *subtitleServiceImpl) CreateSubtitle(ctx context.Context, subtitle *models.Subtitle) (*models.Subtitle, error) {
	subtitle.Status = "pending"
	if err := ss.repo.Create(ctx, subtitle); err != nil {
		return nil, err
	}
	return subtitle, nil
}

func (ss *subtitleServiceImpl) GetSubtitle(ctx context.Context, id string) (*models.Subtitle, error) {
	return ss.repo.GetByID(ctx, id)
}

func (ss *subtitleServiceImpl) GetVideoSubtitles(ctx context.Context, videoID string, language string) ([]*models.Subtitle, error) {
	return ss.repo.GetByVideoID(ctx, videoID, language)
}

func (ss *subtitleServiceImpl) UpdateSubtitle(ctx context.Context, subtitle *models.Subtitle) error {
	return ss.repo.Update(ctx, subtitle)
}

func (ss *subtitleServiceImpl) DeleteSubtitle(ctx context.Context, id string) error {
	return ss.repo.Delete(ctx, id)
}

func (ss *subtitleServiceImpl) ApproveSubtitle(ctx context.Context, id string) error {
	subtitle, err := ss.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	subtitle.Status = "approved"
	return ss.repo.Update(ctx, subtitle)
}

func (ss *subtitleServiceImpl) ListSubtitles(ctx context.Context, limit, offset int) ([]*models.Subtitle, error) {
	return ss.repo.GetAll(ctx, limit, offset)
}
