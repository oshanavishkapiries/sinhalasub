package service

import (
	"context"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/security"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// UserService defines the business logic for user operations
type UserService interface {
	CreateUser(ctx context.Context, username, email, password string) (*models.User, error)
	GetUser(ctx context.Context, id string) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
	DeleteUser(ctx context.Context, id string) error
	ListUsers(ctx context.Context, query UserListQuery) ([]*models.User, int, error)
}

type UserListQuery struct {
	Search     string
	Role       string
	IsActive   *bool
	IsVerified *bool
	SortBy     string
	SortOrder  string
	Limit      int
	Offset     int
}

// userServiceImpl is the concrete implementation of UserService
type userServiceImpl struct {
	repo repository.UserRepository
}

// NewUserService creates a new user service instance
func NewUserService(repo repository.UserRepository) UserService {
	return &userServiceImpl{repo: repo}
}

func (us *userServiceImpl) CreateUser(ctx context.Context, username, email, password string) (*models.User, error) {
	passwordHash, err := security.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: passwordHash,
		Role:         "platform-user",
		IsVerified:   false,
		IsActive:     true,
	}
	if err := us.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	user.PasswordHash = ""
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

func (us *userServiceImpl) ListUsers(ctx context.Context, query UserListQuery) ([]*models.User, int, error) {
	filter := repository.UserListFilter{
		Search:     strings.TrimSpace(query.Search),
		Role:       strings.TrimSpace(query.Role),
		IsActive:   query.IsActive,
		IsVerified: query.IsVerified,
		SortBy:     strings.TrimSpace(query.SortBy),
		SortOrder:  strings.TrimSpace(query.SortOrder),
		Limit:      query.Limit,
		Offset:     query.Offset,
	}

	users, total, err := us.repo.List(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	for _, user := range users {
		user.PasswordHash = ""
	}
	return users, total, nil
}
