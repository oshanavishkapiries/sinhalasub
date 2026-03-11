package security

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

// TokenClaims contains the JWT claims
type TokenClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Type   string `json:"type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

// GenerateAccessToken generates a JWT access token
func GenerateAccessToken(userID, email, role string) (string, error) {
	jwtSecret := utils.GetEnv("JWT_SECRET", "default-secret-key")
	expiryStr := utils.GetEnv("JWT_EXPIRY", "24h")

	// Parse expiry duration
	expiry, err := time.ParseDuration(expiryStr)
	if err != nil {
		expiry = 24 * time.Hour
	}

	claims := TokenClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		utils.ErrorLog("failed to generate access token: %s", err)
		return "", err
	}

	return tokenString, nil
}

// GenerateRefreshToken generates a JWT refresh token
func GenerateRefreshToken(userID string) (string, error) {
	jwtSecret := utils.GetEnv("JWT_SECRET", "default-secret-key")
	expiryStr := utils.GetEnv("REFRESH_TOKEN_EXPIRY", "7d")

	// Parse expiry duration
	expiry, err := time.ParseDuration(expiryStr)
	if err != nil {
		expiry = 7 * 24 * time.Hour
	}

	claims := TokenClaims{
		UserID: userID,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		utils.ErrorLog("failed to generate refresh token: %s", err)
		return "", err
	}

	return tokenString, nil
}

// VerifyToken verifies and parses a JWT token
func VerifyToken(tokenString string) (*TokenClaims, error) {
	jwtSecret := utils.GetEnv("JWT_SECRET", "default-secret-key")

	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify the alg is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		utils.ErrorLog("failed to parse token: %s", err)
		return nil, err
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}
