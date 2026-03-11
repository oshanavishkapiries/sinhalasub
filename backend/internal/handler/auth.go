package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	authService service.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// LoginRequest represents the request body for login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignupRequest represents the request body for signup
type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshTokenRequest represents the request body for refreshing token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// AuthResponse represents the auth response with user and tokens
type AuthResponse struct {
	User         map[string]interface{} `json:"user"`
	Token        string                 `json:"token"`
	RefreshToken string                 `json:"refresh_token"`
}

// Login handles POST /api/auth/login
// @Summary User Login
// @Description Authenticate user and return access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} map[string]interface{} "Login successful"
// @Failure 401 {object} map[string]interface{} "Invalid credentials"
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiErr := response.BadRequestException("Invalid request body", err)
		response.HandleError(w, apiErr)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		apiErr := response.BadRequestException("Email and password are required", nil)
		response.HandleError(w, apiErr)
		return
	}

	// Authenticate user
	user, token, refreshToken, err := h.authService.Login(ctx, req.Email, req.Password)
	if err != nil {
		apiErr := response.UnauthorizedException("Invalid email or password", err)
		response.HandleError(w, apiErr)
		return
	}

	// Prepare response
	userResponse := map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"role":       user.Role,
		"avatar":     user.Avatar,
		"is_active":  user.IsActive,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	}

	authResp := AuthResponse{
		User:         userResponse,
		Token:        token,
		RefreshToken: refreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Login successful",
		"data":    authResp,
	})
}

// Signup handles POST /api/auth/signup
// @Summary User Signup
// @Description Create a new user account
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body SignupRequest true "User registration data"
// @Success 201 {object} map[string]interface{} "Account created successfully"
// @Failure 409 {object} map[string]interface{} "Email already registered"
// @Router /api/auth/signup [post]
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiErr := response.BadRequestException("Invalid request body", err)
		response.HandleError(w, apiErr)
		return
	}

	// Validate input
	if req.Name == "" || req.Email == "" || req.Password == "" {
		apiErr := response.BadRequestException("Name, email, and password are required", nil)
		response.HandleError(w, apiErr)
		return
	}

	// Create user
	user, token, refreshToken, err := h.authService.Signup(ctx, req.Name, req.Email, req.Password)
	if err != nil {
		if strings.Contains(err.Error(), "already registered") {
			apiErr := response.ConflictException("Email already registered", err)
			response.HandleError(w, apiErr)
			return
		}
		apiErr := response.InternalServerException("Failed to create account", err)
		response.HandleError(w, apiErr)
		return
	}

	// Prepare response
	userResponse := map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"role":       user.Role,
		"avatar":     user.Avatar,
		"is_active":  user.IsActive,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	}

	authResp := AuthResponse{
		User:         userResponse,
		Token:        token,
		RefreshToken: refreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Account created successfully",
		"data":    authResp,
	})
}

// GetCurrentUser handles GET /api/auth/me
// @Summary Get Current User
// @Description Get the currently authenticated user
// @Tags Auth
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "User fetched successfully"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Router /api/auth/me [get]
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

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

	// Get user from token
	user, err := h.authService.GetCurrentUser(ctx, token)
	if err != nil {
		apiErr := response.UnauthorizedException("Invalid or expired token", err)
		response.HandleError(w, apiErr)
		return
	}

	// Prepare response
	userResponse := map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"role":       user.Role,
		"avatar":     user.Avatar,
		"is_active":  user.IsActive,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User fetched successfully",
		"data": map[string]interface{}{
			"user": userResponse,
		},
	})
}

// RefreshToken handles POST /api/auth/refresh
// @Summary Refresh Access Token
// @Description Refresh access token using refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body RefreshTokenRequest true "Refresh token"
// @Success 200 {object} map[string]interface{} "Token refreshed successfully"
// @Failure 401 {object} map[string]interface{} "Invalid refresh token"
// @Router /api/auth/refresh [post]
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiErr := response.BadRequestException("Invalid request body", err)
		response.HandleError(w, apiErr)
		return
	}

	// Validate input
	if req.RefreshToken == "" {
		apiErr := response.BadRequestException("Refresh token is required", nil)
		response.HandleError(w, apiErr)
		return
	}

	// Refresh access token
	accessToken, err := h.authService.RefreshToken(ctx, req.RefreshToken)
	if err != nil {
		apiErr := response.UnauthorizedException("Invalid refresh token", err)
		response.HandleError(w, apiErr)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Token refreshed successfully",
		"data": map[string]interface{}{
			"token": accessToken,
		},
	})
}

// Logout handles POST /api/auth/logout
// @Summary User Logout
// @Description Logout the current user
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Logout successful"
// @Router /api/auth/logout [post]
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logout successful",
	})
}
