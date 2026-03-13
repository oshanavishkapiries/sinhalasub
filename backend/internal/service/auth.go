package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain/models"
	emailpkg "github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/email"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/security"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

var (
	ErrInvalidCredentials   = errors.New("invalid email or password")
	ErrEmailNotVerified     = errors.New("email not verified")
	ErrEmailAlreadyExists   = errors.New("email already registered")
	ErrUsernameAlreadyTaken = errors.New("username already taken")
)

func IsEmailNotVerifiedError(err error) bool {
	return errors.Is(err, ErrEmailNotVerified)
}

func IsEmailAlreadyExistsError(err error) bool {
	return errors.Is(err, ErrEmailAlreadyExists)
}

func IsUsernameAlreadyTakenError(err error) bool {
	return errors.Is(err, ErrUsernameAlreadyTaken)
}

type AuthService interface {
	Signup(ctx context.Context, username, email, password string) error
	VerifySignup(ctx context.Context, email, code string) error
	ResendSignupVerification(ctx context.Context, email string) error

	Login(ctx context.Context, email, password, userAgent, ipAddress string) (*models.User, AuthTokens, error)
	Refresh(ctx context.Context, refreshToken, userAgent, ipAddress string) (AuthTokens, error)
	Logout(ctx context.Context, refreshToken string) error

	GetCurrentUserFromAccessToken(ctx context.Context, accessToken string) (*models.User, error)

	RequestPasswordReset(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, email, newPassword, code string) error
}

type AuthTokens struct {
	AccessToken      string
	RefreshToken     string
	AccessExpiresAt  time.Time
	RefreshExpiresAt time.Time
}

type authServiceImpl struct {
	userRepo           repository.UserRepository
	codeRepo           repository.VerificationCodeRepository
	refreshSessionRepo repository.RefreshSessionRepository
}

func NewAuthService(
	userRepo repository.UserRepository,
	codeRepo repository.VerificationCodeRepository,
	refreshSessionRepo repository.RefreshSessionRepository,
) AuthService {
	return &authServiceImpl{
		userRepo:           userRepo,
		codeRepo:           codeRepo,
		refreshSessionRepo: refreshSessionRepo,
	}
}

func (as *authServiceImpl) Signup(ctx context.Context, username, email, password string) error {
	// Avoid storing users with case/whitespace differences.
	username = strings.TrimSpace(username)
	email = strings.TrimSpace(email)

	if username == "" || email == "" || password == "" {
		return fmt.Errorf("invalid signup data")
	}

	existingByEmail, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}
	if existingByEmail != nil {
		if !existingByEmail.IsVerified {
			return ErrEmailNotVerified
		}
		return ErrEmailAlreadyExists
	}

	existingByUsername, err := as.userRepo.GetByUsername(ctx, username)
	if err != nil {
		return err
	}
	if existingByUsername != nil {
		return ErrUsernameAlreadyTaken
	}

	passwordHash, err := security.HashPassword(password)
	if err != nil {
		utils.ErrorLog("failed to hash password: %s", err)
		return err
	}

	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: passwordHash,
		Role:         "platform-user",
		IsVerified:   false,
		IsActive:     true,
	}

	if err := as.userRepo.Create(ctx, user); err != nil {
		return err
	}

	if err := as.createAndSendSignupVerificationCode(ctx, user.ID, email); err != nil {
		utils.ErrorLog("failed to send signup verification email: %s", err)
		return err
	}

	return nil
}

func (as *authServiceImpl) VerifySignup(ctx context.Context, email, code string) error {
	email = strings.TrimSpace(email)
	code = strings.TrimSpace(code)
	if email == "" || code == "" {
		return fmt.Errorf("invalid verification data")
	}

	user, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("invalid verification code")
	}
	if user.IsVerified {
		return nil
	}

	ok, err := as.codeRepo.UseIfValid(
		ctx,
		user.ID,
		models.VerificationTypeSignup,
		func(codeHash string) bool { return security.VerifyPassword(codeHash, code) },
		time.Now().UTC(),
	)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("invalid verification code")
	}

	user.IsVerified = true
	if err := as.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return nil
}

func (as *authServiceImpl) ResendSignupVerification(ctx context.Context, email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return nil
	}

	user, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}

	// Keep response generic to avoid account enumeration.
	if user == nil || user.IsVerified {
		return nil
	}

	if err := as.createAndSendSignupVerificationCode(ctx, user.ID, email); err != nil {
		utils.ErrorLog("failed to resend verification email: %s", err)
		return err
	}
	return nil
}

func (as *authServiceImpl) Login(ctx context.Context, email, password, userAgent, ipAddress string) (*models.User, AuthTokens, error) {
	email = strings.TrimSpace(email)
	if email == "" || password == "" {
		return nil, AuthTokens{}, ErrInvalidCredentials
	}

	user, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, AuthTokens{}, err
	}
	if user == nil {
		return nil, AuthTokens{}, ErrInvalidCredentials
	}

	if !user.IsVerified {
		return nil, AuthTokens{}, ErrEmailNotVerified
	}

	if !user.IsActive {
		return nil, AuthTokens{}, ErrInvalidCredentials
	}

	if !security.VerifyPassword(user.PasswordHash, password) {
		return nil, AuthTokens{}, ErrInvalidCredentials
	}

	accessToken, err := security.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, AuthTokens{}, err
	}

	refreshToken, refreshTokenHash, err := generateRefreshToken()
	if err != nil {
		return nil, AuthTokens{}, err
	}

	now := time.Now().UTC()
	refreshExpiresAt := now.Add(getRefreshSessionTTL())
	s := &models.RefreshSession{
		UserID:    user.ID,
		TokenHash: refreshTokenHash,
		UserAgent: userAgent,
		IPAddress: ipAddress,
		ExpiresAt: refreshExpiresAt,
	}
	if err := as.refreshSessionRepo.Create(ctx, s); err != nil {
		return nil, AuthTokens{}, err
	}

	_ = as.userRepo.UpdateLastLoginAt(ctx, user.ID, now)

	// Never return password hash.
	user.PasswordHash = ""

	accessExpiresAt := now.Add(getAccessTokenTTL())
	return user, AuthTokens{
		AccessToken:      accessToken,
		RefreshToken:     refreshToken,
		AccessExpiresAt:  accessExpiresAt,
		RefreshExpiresAt: refreshExpiresAt,
	}, nil
}

func (as *authServiceImpl) Refresh(ctx context.Context, refreshToken, userAgent, ipAddress string) (AuthTokens, error) {
	refreshToken = strings.TrimSpace(refreshToken)
	if refreshToken == "" {
		return AuthTokens{}, fmt.Errorf("invalid refresh token")
	}

	tokenHash := hashToken(refreshToken)
	now := time.Now().UTC()

	session, err := as.refreshSessionRepo.GetByTokenHash(ctx, tokenHash, now)
	if err != nil {
		return AuthTokens{}, err
	}
	if session == nil {
		return AuthTokens{}, fmt.Errorf("invalid refresh token")
	}

	user, err := as.userRepo.GetByID(ctx, session.UserID)
	if err != nil {
		return AuthTokens{}, err
	}
	if user == nil || !user.IsActive || !user.IsVerified {
		return AuthTokens{}, fmt.Errorf("invalid refresh token")
	}

	accessToken, err := security.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return AuthTokens{}, err
	}

	// Rotate refresh token.
	newRefreshToken, newRefreshTokenHash, err := generateRefreshToken()
	if err != nil {
		return AuthTokens{}, err
	}
	if err := as.refreshSessionRepo.RotateTokenHash(ctx, session.ID, newRefreshTokenHash, now); err != nil {
		return AuthTokens{}, err
	}

	_ = userAgent
	_ = ipAddress

	accessExpiresAt := now.Add(getAccessTokenTTL())
	refreshExpiresAt := session.ExpiresAt

	return AuthTokens{
		AccessToken:      accessToken,
		RefreshToken:     newRefreshToken,
		AccessExpiresAt:  accessExpiresAt,
		RefreshExpiresAt: refreshExpiresAt,
	}, nil
}

func (as *authServiceImpl) Logout(ctx context.Context, refreshToken string) error {
	refreshToken = strings.TrimSpace(refreshToken)
	if refreshToken == "" {
		return nil
	}
	now := time.Now().UTC()
	return as.refreshSessionRepo.RevokeByTokenHash(ctx, hashToken(refreshToken), now)
}

func (as *authServiceImpl) GetCurrentUserFromAccessToken(ctx context.Context, accessToken string) (*models.User, error) {
	claims, err := security.VerifyToken(accessToken)
	if err != nil {
		return nil, fmt.Errorf("invalid token")
	}
	if claims.Type != "access" {
		return nil, fmt.Errorf("invalid token")
	}

	user, err := as.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil || !user.IsActive || !user.IsVerified {
		return nil, fmt.Errorf("user not found")
	}

	user.PasswordHash = ""
	return user, nil
}

func (as *authServiceImpl) RequestPasswordReset(ctx context.Context, email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return nil
	}

	user, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}

	// Do not reveal whether the email exists.
	if user == nil {
		return nil
	}

	code, err := generateNumericCode(6)
	if err != nil {
		return err
	}

	codeHash, err := security.HashPassword(code)
	if err != nil {
		return err
	}

	expiresAt := time.Now().UTC().Add(getVerificationCodeTTL())
	_ = as.codeRepo.InvalidateUnused(ctx, user.ID, models.VerificationTypePasswordReset)

	v := &models.VerificationCode{
		UserID:    user.ID,
		Type:      models.VerificationTypePasswordReset,
		CodeHash:  codeHash,
		ExpiresAt: expiresAt,
	}
	if err := as.codeRepo.Create(ctx, v); err != nil {
		return err
	}

	if err := emailpkg.SendPasswordResetCode(email, code); err != nil {
		utils.ErrorLog("failed to send password reset email: %s", err)
		return err
	}
	return nil
}

func (as *authServiceImpl) ResetPassword(ctx context.Context, email, newPassword, code string) error {
	email = strings.TrimSpace(email)
	newPassword = strings.TrimSpace(newPassword)
	code = strings.TrimSpace(code)
	if email == "" || newPassword == "" || code == "" {
		return fmt.Errorf("invalid reset data")
	}

	user, err := as.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("invalid reset code")
	}

	ok, err := as.codeRepo.UseIfValid(
		ctx,
		user.ID,
		models.VerificationTypePasswordReset,
		func(codeHash string) bool { return security.VerifyPassword(codeHash, code) },
		time.Now().UTC(),
	)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("invalid reset code")
	}

	passwordHash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := as.userRepo.UpdatePasswordHash(ctx, user.ID, passwordHash); err != nil {
		return err
	}

	// Revoke all sessions after password reset.
	_ = as.refreshSessionRepo.RevokeAllByUserID(ctx, user.ID, time.Now().UTC())
	return nil
}

func generateNumericCode(length int) (string, error) {
	if length <= 0 {
		return "", fmt.Errorf("invalid code length")
	}

	var sb strings.Builder
	sb.Grow(length)
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		sb.WriteByte(byte('0' + n.Int64()))
	}
	return sb.String(), nil
}

func generateRefreshToken() (token string, tokenHash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}

	token = base64.RawURLEncoding.EncodeToString(b)
	tokenHash = hashToken(token)
	return token, tokenHash, nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func getAccessTokenTTL() time.Duration {
	ttl, err := time.ParseDuration(utils.GetEnv("JWT_EXPIRY", "24h"))
	if err != nil || ttl <= 0 {
		return 24 * time.Hour
	}
	return ttl
}

func getRefreshSessionTTL() time.Duration {
	ttl := utils.ParseDuration(utils.GetEnv("REFRESH_TOKEN_EXPIRY", "7d"), 7*24*time.Hour)
	if ttl <= 0 {
		return 7 * 24 * time.Hour
	}
	return ttl
}

func getVerificationCodeTTL() time.Duration {
	ttl := utils.ParseDuration(utils.GetEnv("VERIFICATION_CODE_EXPIRY", "15m"), 15*time.Minute)
	if ttl <= 0 {
		return 15 * time.Minute
	}
	return ttl
}

func (as *authServiceImpl) createAndSendSignupVerificationCode(ctx context.Context, userID string, email string) error {
	code, err := generateNumericCode(6)
	if err != nil {
		return err
	}

	codeHash, err := security.HashPassword(code)
	if err != nil {
		return err
	}

	expiresAt := time.Now().UTC().Add(getVerificationCodeTTL())
	_ = as.codeRepo.InvalidateUnused(ctx, userID, models.VerificationTypeSignup)

	v := &models.VerificationCode{
		UserID:    userID,
		Type:      models.VerificationTypeSignup,
		CodeHash:  codeHash,
		ExpiresAt: expiresAt,
	}
	if err := as.codeRepo.Create(ctx, v); err != nil {
		return err
	}

	return emailpkg.SendVerificationCode(email, code)
}
