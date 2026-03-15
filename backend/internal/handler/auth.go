package handler

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type VerifyRequest struct {
	Email            string `json:"email"`
	VerificationCode string `json:"verification_code"`
}

type ResendVerificationRequest struct {
	Email string `json:"email"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Email            string `json:"email"`
	NewPassword      string `json:"new_password"`
	VerificationCode string `json:"verification_code"`
}

// Signup handles POST /api/auth/signup
// @Summary User Signup
// @Description Create a new user account and send a verification code
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body SignupRequest true "User registration data"
// @Success 201 {object} map[string]interface{} "Account created; verification required"
// @Failure 409 {object} map[string]interface{} "Email/username already registered"
// @Router /api/auth/signup [post]
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.BadRequestException("Invalid request body", err))
		return
	}

	if strings.TrimSpace(req.Username) == "" || strings.TrimSpace(req.Email) == "" || req.Password == "" {
		response.HandleError(w, response.BadRequestException("username, email and password are required", nil))
		return
	}

	if err := h.authService.Signup(ctx, req.Username, req.Email, req.Password); err != nil {
		if service.IsEmailNotVerifiedError(err) {
			response.HandleError(w, response.ConflictException("Email is not verified. Please verify your email.", err))
			return
		}
		if service.IsEmailAlreadyExistsError(err) {
			response.HandleError(w, response.ConflictException("Email already registered", err))
			return
		}
		if service.IsUsernameAlreadyTakenError(err) {
			response.HandleError(w, response.ConflictException("Username already taken", err))
			return
		}
		response.HandleError(w, response.InternalServerException("Failed to create account", err))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Account created. Please verify your email to login.",
	})
}

// Verify handles POST /api/auth/verify
// @Summary Verify Account
// @Description Verify a user account using a verification code
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body VerifyRequest true "Verification data"
// @Success 200 {object} map[string]interface{} "Account verified"
// @Failure 401 {object} map[string]interface{} "Invalid code"
// @Router /api/auth/verify [post]
func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.BadRequestException("Invalid request body", err))
		return
	}

	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.VerificationCode) == "" {
		response.HandleError(w, response.BadRequestException("email and verification_code are required", nil))
		return
	}

	if err := h.authService.VerifySignup(ctx, req.Email, req.VerificationCode); err != nil {
		response.HandleError(w, response.UnauthorizedException("Invalid or expired verification code", err))
		return
	}

	response.Success(w, map[string]interface{}{"verified": true}, "Account verified")
}

// ResendVerification handles POST /api/auth/resend-verification
// @Summary Resend Verification Code
// @Description Resend signup verification code to email (generic response)
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body ResendVerificationRequest true "Email address"
// @Success 200 {object} map[string]interface{} "Verification code resent"
// @Router /api/auth/resend-verification [post]
func (h *AuthHandler) ResendVerification(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req ResendVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.BadRequestException("Invalid request body", err))
		return
	}

	if strings.TrimSpace(req.Email) == "" {
		response.HandleError(w, response.BadRequestException("email is required", nil))
		return
	}

	_ = h.authService.ResendSignupVerification(ctx, req.Email)
	response.Success(w, map[string]interface{}{"sent": true}, "If the account exists, a verification code has been sent.")
}

// Login handles POST /api/auth/login
// @Summary User Login
// @Description Authenticate user and set access/refresh cookies
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
		response.HandleError(w, response.BadRequestException("Invalid request body", err))
		return
	}

	if strings.TrimSpace(req.Email) == "" || req.Password == "" {
		response.HandleError(w, response.BadRequestException("email and password are required", nil))
		return
	}

	userAgent := r.UserAgent()
	ip := clientIP(r)

	user, tokens, err := h.authService.Login(ctx, req.Email, req.Password, userAgent, ip)
	if err != nil {
		if service.IsEmailNotVerifiedError(err) {
			response.HandleError(w, response.ForbiddenException("Email is not verified. Please verify your email.", err))
			return
		}
		response.HandleError(w, response.UnauthorizedException("Invalid email or password", err))
		return
	}

	setAuthCookies(w, tokens)

	response.Success(w, map[string]interface{}{"user": user}, "Login successful")
}

// RefreshToken handles POST /api/auth/refresh
// @Summary Refresh Access Token
// @Description Refresh access token using refresh cookie
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Token refreshed successfully"
// @Failure 401 {object} map[string]interface{} "Invalid refresh token"
// @Router /api/auth/refresh [post]
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	rt, err := r.Cookie("refresh_token")
	if err != nil || strings.TrimSpace(rt.Value) == "" {
		response.HandleError(w, response.UnauthorizedException("Invalid refresh token", err))
		return
	}

	userAgent := r.UserAgent()
	ip := clientIP(r)

	tokens, err := h.authService.Refresh(ctx, rt.Value, userAgent, ip)
	if err != nil {
		response.HandleError(w, response.UnauthorizedException("Invalid refresh token", err))
		return
	}

	setAuthCookies(w, tokens)
	response.Success(w, map[string]interface{}{"refreshed": true}, "Token refreshed")
}

// Logout handles POST /api/auth/logout
// @Summary User Logout
// @Description Logout the current user and clear cookies
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Logout successful"
// @Router /api/auth/logout [post]
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	rt, _ := r.Cookie("refresh_token")
	if rt != nil && strings.TrimSpace(rt.Value) != "" {
		_ = h.authService.Logout(ctx, rt.Value)
	}

	clearAuthCookies(w)
	response.Success(w, map[string]interface{}{"logged_out": true}, "Logout successful")
}

// GetCurrentUser handles GET /api/auth/me
// @Summary Get Current User
// @Description Get the currently authenticated user (cookie-based)
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "User fetched successfully"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Router /api/auth/me [get]
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	at, err := r.Cookie("access_token")
	if err != nil || strings.TrimSpace(at.Value) == "" {
		response.HandleError(w, response.UnauthorizedException("Unauthorized", err))
		return
	}

	user, err := h.authService.GetCurrentUserFromAccessToken(ctx, at.Value)
	if err != nil {
		response.HandleError(w, response.UnauthorizedException("Unauthorized", err))
		return
	}

	response.Success(w, map[string]interface{}{"user": user}, "User fetched successfully")
}

// RequestPasswordReset handles POST /api/auth/forgot-password/request
// @Summary Request Password Reset
// @Description Send a password reset code to the user's email (always returns success)
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body ForgotPasswordRequest true "Password reset request"
// @Success 200 {object} map[string]interface{} "Reset code sent"
// @Router /api/auth/forgot-password/request [post]
func (h *AuthHandler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.BadRequestException("Invalid request body", err))
		return
	}

	_ = h.authService.RequestPasswordReset(ctx, req.Email)
	response.Success(w, map[string]interface{}{"sent": true}, "If the email exists, a reset code has been sent.")
}

// ForgotPassword handles POST /api/auth/forgot-password
// @Summary Forgot Password
// @Description Reset password using a verification code
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body ResetPasswordRequest true "Reset password data"
// @Success 200 {object} map[string]interface{} "Password updated"
// @Failure 401 {object} map[string]interface{} "Invalid code"
// @Router /api/auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.BadRequestException("Invalid request body", err))
		return
	}

	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.NewPassword) == "" || strings.TrimSpace(req.VerificationCode) == "" {
		response.HandleError(w, response.BadRequestException("email, new_password, and verification_code are required", nil))
		return
	}

	if err := h.authService.ResetPassword(ctx, req.Email, req.NewPassword, req.VerificationCode); err != nil {
		response.HandleError(w, response.UnauthorizedException("Invalid or expired verification code", err))
		return
	}

	clearAuthCookies(w)
	response.Success(w, map[string]interface{}{"updated": true}, "Password updated")
}

func setAuthCookies(w http.ResponseWriter, tokens service.AuthTokens) {
	secure := utils.GetEnvAsBool("COOKIE_SECURE", false)
	domain := strings.TrimSpace(utils.GetEnv("COOKIE_DOMAIN", ""))
	sameSite := parseSameSite(utils.GetEnv("COOKIE_SAMESITE", "Lax"))

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    tokens.AccessToken,
		Path:     "/",
		Domain:   domain,
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  tokens.AccessExpiresAt,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		Path:     "/",
		Domain:   domain,
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  tokens.RefreshExpiresAt,
	})
}

func clearAuthCookies(w http.ResponseWriter) {
	secure := utils.GetEnvAsBool("COOKIE_SECURE", false)
	domain := strings.TrimSpace(utils.GetEnv("COOKIE_DOMAIN", ""))
	sameSite := parseSameSite(utils.GetEnv("COOKIE_SAMESITE", "Lax"))
	exp := time.Unix(0, 0)

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		Domain:   domain,
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  exp,
		MaxAge:   -1,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Domain:   domain,
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  exp,
		MaxAge:   -1,
	})
}

func parseSameSite(v string) http.SameSite {
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "strict":
		return http.SameSiteStrictMode
	case "none":
		return http.SameSiteNoneMode
	default:
		return http.SameSiteLaxMode
	}
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			return strings.TrimSpace(parts[0])
		}
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
