package service

import (
	"context"
	"fmt"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/security"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// AuthService defines authentication-related operations
type AuthService interface {
	Login(ctx context.Context, email, password string) (*models.User, string, string, error)
	Signup(ctx context.Context, name, email, password string) (*models.User, string, string, error)
	RefreshToken(ctx context.Context, refreshToken string) (string, error)
	GetCurrentUser(ctx context.Context, token string) (*models.User, error)
}

// authServiceImpl implements AuthService
type authServiceImpl struct {
	userRepo repository.UserRepository
}

// NewAuthService creates a new auth service instance
func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authServiceImpl{userRepo: userRepo}
}

// Login authenticates a user and returns tokens
func (as *authServiceImpl) Login(ctx context.Context, email, password string) (*models.User, string, string, error) {
	// Find user by email
	user, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		utils.ErrorLog("failed to get user by email: %s", err)
		return nil, "", "", err
	}

	if user == nil {
		return nil, "", "", fmt.Errorf("invalid email or password")
	}

	// Check if user is active
	if !user.IsUserActive() {
		return nil, "", "", fmt.Errorf("user account is inactive")
	}

	// Verify password
	if !security.VerifyPassword(user.Password, password) {
		return nil, "", "", fmt.Errorf("invalid email or password")
	}

	// Generate tokens
	accessToken, err := security.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		utils.ErrorLog("failed to generate access token: %s", err)
		return nil, "", "", err
	}

	refreshToken, err := security.GenerateRefreshToken(user.ID)
	if err != nil {
		utils.ErrorLog("failed to generate refresh token: %s", err)
		return nil, "", "", err
	}

	// Remove password from response
	user.Password = ""

	return user, accessToken, refreshToken, nil
}

// Signup creates a new user account
func (as *authServiceImpl) Signup(ctx context.Context, name, email, password string) (*models.User, string, string, error) {
	// Check if user already exists
	existingUser, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		utils.ErrorLog("failed to check existing user: %s", err)
		return nil, "", "", err
	}

	if existingUser != nil {
		return nil, "", "", fmt.Errorf("email already registered")
	}

	// Hash password
	hashedPassword, err := security.HashPassword(password)
	if err != nil {
		utils.ErrorLog("failed to hash password: %s", err)
		return nil, "", "", err
	}

	// Create new user
	user := &models.User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
		Role:     "user",
		IsActive: true,
	}

	// Save user to database
	if err := as.userRepo.Create(ctx, user); err != nil {
		utils.ErrorLog("failed to create user: %s", err)
		return nil, "", "", err
	}

	// Generate tokens
	accessToken, err := security.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		utils.ErrorLog("failed to generate access token: %s", err)
		return nil, "", "", err
	}

	refreshToken, err := security.GenerateRefreshToken(user.ID)
	if err != nil {
		utils.ErrorLog("failed to generate refresh token: %s", err)
		return nil, "", "", err
	}

	// Remove password from response
	user.Password = ""

	return user, accessToken, refreshToken, nil
}

// RefreshToken generates a new access token from a refresh token
func (as *authServiceImpl) RefreshToken(ctx context.Context, refreshTokenStr string) (string, error) {
	// Verify refresh token
	claims, err := security.VerifyToken(refreshTokenStr)
	if err != nil {
		utils.ErrorLog("failed to verify refresh token: %s", err)
		return "", fmt.Errorf("invalid refresh token")
	}

	// Check if it's actually a refresh token
	if claims.Type != "refresh" {
		return "", fmt.Errorf("invalid token type")
	}

	// Get user details
	user, err := as.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		utils.ErrorLog("failed to get user: %s", err)
		return "", err
	}

	if user == nil {
		return "", fmt.Errorf("user not found")
	}

	// Generate new access token
	accessToken, err := security.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		utils.ErrorLog("failed to generate access token: %s", err)
		return "", err
	}

	return accessToken, nil
}

// GetCurrentUser retrieves the current user from a token
func (as *authServiceImpl) GetCurrentUser(ctx context.Context, token string) (*models.User, error) {
	// Verify token
	claims, err := security.VerifyToken(token)
	if err != nil {
		utils.ErrorLog("failed to verify token: %s", err)
		return nil, fmt.Errorf("invalid token")
	}

	// Check if it's an access token
	if claims.Type != "access" {
		return nil, fmt.Errorf("invalid token type")
	}

	// Get user by ID
	user, err := as.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		utils.ErrorLog("failed to get user: %s", err)
		return nil, err
	}

	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	// Remove password from response
	user.Password = ""

	return user, nil
}
