package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/security"
)

// ContextKeyUserID is the key for storing user ID in context
type ContextKey string

const UserIDContextKey ContextKey = "user_id"
const UserEmailContextKey ContextKey = "user_email"
const UserRoleContextKey ContextKey = "user_role"

// JWTMiddleware verifies JWT tokens and adds user info to context
func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			apiErr := response.UnauthorizedException("Authorization header required", nil)
			response.HandleError(w, apiErr)
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			apiErr := response.UnauthorizedException("Invalid authorization header format", nil)
			response.HandleError(w, apiErr)
			return
		}

		token := parts[1]

		// Verify token
		claims, err := security.VerifyToken(token)
		if err != nil {
			apiErr := response.UnauthorizedException("Invalid or expired token", err)
			response.HandleError(w, apiErr)
			return
		}

		// Check if it's an access token
		if claims.Type != "access" {
			apiErr := response.UnauthorizedException("Invalid token type", nil)
			response.HandleError(w, apiErr)
			return
		}

		// Add user info to context
		ctx := r.Context()
		ctx = context.WithValue(ctx, UserIDContextKey, claims.UserID)
		ctx = context.WithValue(ctx, UserEmailContextKey, claims.Email)
		ctx = context.WithValue(ctx, UserRoleContextKey, claims.Role)

		// Call next handler with updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// OptionalJWTMiddleware verifies JWT tokens if provided but doesn't require them
func OptionalJWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader != "" {
			// Extract token from "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token := parts[1]

				// Verify token
				claims, err := security.VerifyToken(token)
				if err == nil && claims.Type == "access" {
					// Add user info to context
					ctx := r.Context()
					ctx = context.WithValue(ctx, UserIDContextKey, claims.UserID)
					ctx = context.WithValue(ctx, UserEmailContextKey, claims.Email)
					ctx = context.WithValue(ctx, UserRoleContextKey, claims.Role)
					r = r.WithContext(ctx)
				}
			}
		}

		// Call next handler regardless of token validity
		next.ServeHTTP(w, r)
	})
}

// GetUserIDFromContext extracts user ID from context
func GetUserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDContextKey).(string)
	return userID, ok
}

// GetUserEmailFromContext extracts user email from context
func GetUserEmailFromContext(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(UserEmailContextKey).(string)
	return email, ok
}

// GetUserRoleFromContext extracts user role from context
func GetUserRoleFromContext(ctx context.Context) (string, bool) {
	role, ok := ctx.Value(UserRoleContextKey).(string)
	return role, ok
}
