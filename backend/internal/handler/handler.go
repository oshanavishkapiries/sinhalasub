package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/metrics"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/pagination"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

// HealthHandler handles health check requests
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Check handles GET /health requests
// @Summary Health Check
// @Description Get health status of the server with system metrics
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Server health status"
// @Router /health [get]
func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	// Get system metrics
	sysMetrics, err := metrics.GetSystemMetrics()
	if err != nil {
		utils.WarnLog("Failed to get system metrics: %s", err)
		// Continue with health check even if metrics fail
		sysMetrics = nil
	}

	data := map[string]interface{}{
		"status":    "OK",
		"service":   "sinhala-sub",
		"version":   "v1.0.0",
		"timestamp": time.Now().UTC(),
	}

	// Add system metrics if available
	if sysMetrics != nil {
		data["metrics"] = map[string]interface{}{
			"cpu": map[string]interface{}{
				"usage_percent": sysMetrics.CPU.UsagePercent,
				"cores":         sysMetrics.CPU.Cores,
				"logical_cores": sysMetrics.CPU.LogicalCores,
			},
			"memory": map[string]interface{}{
				"total_bytes":     sysMetrics.Memory.Total,
				"available_bytes": sysMetrics.Memory.Available,
				"used_bytes":      sysMetrics.Memory.Used,
				"used_percent":    sysMetrics.Memory.UsedPercent,
				"free_bytes":      sysMetrics.Memory.Free,
			},
		}
	}

	response.Success(w, data, "Server is running")
}

// UserHandler handles user-related requests
type UserHandler struct {
	userService service.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateUserRequest struct {
	Username *string `json:"username"`
	Email    *string `json:"email"`
	Avatar   *string `json:"avatar"`
}

type ChangeUserRoleRequest struct {
	Role string `json:"role"`
}

// Create handles POST /users requests
// @Summary Create User
// @Description Create a new user
// @Tags Users
// @Accept json
// @Produce json
// @Param request body CreateUserRequest true "User data"
// @Success 200 {object} map[string]interface{} "User created"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 500 {object} map[string]interface{} "Server error"
// @Router /users/ [post]
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateUserRequest

	if err := r.ParseForm(); err != nil {
		apiErr := response.BadRequestException("Invalid request body", err)
		response.HandleError(w, apiErr)
		return
	}

	// In a real application, you would parse JSON from r.Body
	// This is simplified for demonstration

	user, err := h.userService.CreateUser(ctx, req.Username, req.Email, req.Password)
	if err != nil {
		apiErr := response.InternalServerException("Failed to create user", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, user, "User created successfully")
}

// GetByID handles GET /users/:id requests
// @Summary Get User By ID
// @Description Get one user by id
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{} "User fetched"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 404 {object} map[string]interface{} "User not found"
// @Router /users/{id} [get]
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := chi.URLParam(r, "id")

	if userID == "" {
		response.BadRequest(w, "User ID is required")
		return
	}

	user, err := h.userService.GetUser(ctx, userID)
	if err != nil {
		apiErr := response.NotFoundException("User not found", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, user, "User retrieved successfully")
}

// List handles GET /users requests
// @Summary List Users
// @Description List users with pagination and filters
// @Tags Users
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Param sort_by query string false "Sort field" Enums(created_at,updated_at,last_login_at,username,email) default(created_at)
// @Param sort_order query string false "Sort order" Enums(asc,desc) default(desc)
// @Param search query string false "Search by username/email"
// @Param role query string false "Filter by role"
// @Param is_active query boolean false "Filter by active status"
// @Param is_verified query boolean false "Filter by verification status"
// @Success 200 {object} map[string]interface{} "Users fetched"
// @Failure 500 {object} map[string]interface{} "Server error"
// @Router /users/ [get]
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	pg, err := pagination.ParseRequest(r, pagination.Options{
		DefaultPage:    1,
		DefaultPerPage: 10,
		MaxPerPage:     100,
		DefaultSortBy:  "created_at",
		AllowedSortBy: map[string]struct{}{
			"created_at":    {},
			"updated_at":    {},
			"last_login_at": {},
			"username":      {},
			"email":         {},
		},
	})
	if err != nil {
		apiErr := response.BadRequestException("Invalid pagination parameters", err)
		response.HandleError(w, apiErr)
		return
	}

	users, total, err := h.userService.ListUsers(ctx, service.UserListQuery{
		Search:     strings.TrimSpace(r.URL.Query().Get("search")),
		Role:       strings.TrimSpace(r.URL.Query().Get("role")),
		IsActive:   parseOptionalBool(r.URL.Query().Get("is_active")),
		IsVerified: parseOptionalBool(r.URL.Query().Get("is_verified")),
		SortBy:     pg.SortBy,
		SortOrder:  pg.SortOrder,
		Limit:      pg.PerPage,
		Offset:     pg.Offset(),
	})
	if err != nil {
		apiErr := response.InternalServerException("Failed to fetch users", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, map[string]interface{}{
		"items": users,
		"meta":  pagination.NewMeta(pg.Page, pg.PerPage, total),
	}, "Users retrieved successfully")
}

// Update handles PUT /users/:id requests
// @Summary Update User
// @Description Update user profile fields
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body UpdateUserRequest true "Fields to update"
// @Success 200 {object} map[string]interface{} "User updated"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 404 {object} map[string]interface{} "User not found"
// @Failure 500 {object} map[string]interface{} "Server error"
// @Router /users/{id} [put]
func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := chi.URLParam(r, "id")
	if strings.TrimSpace(userID) == "" {
		response.BadRequest(w, "User ID is required")
		return
	}

	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiErr := response.BadRequestException("Invalid request body", err)
		response.HandleError(w, apiErr)
		return
	}

	user, err := h.userService.GetUser(ctx, userID)
	if err != nil || user == nil {
		apiErr := response.NotFoundException("User not found", err)
		response.HandleError(w, apiErr)
		return
	}

	updated := false
	if req.Username != nil && strings.TrimSpace(*req.Username) != "" {
		user.Username = strings.TrimSpace(*req.Username)
		updated = true
	}
	if req.Email != nil && strings.TrimSpace(*req.Email) != "" {
		user.Email = strings.TrimSpace(*req.Email)
		updated = true
	}
	if req.Avatar != nil {
		user.Avatar = strings.TrimSpace(*req.Avatar)
		updated = true
	}

	if !updated {
		apiErr := response.BadRequestException("No valid fields provided to update", nil)
		response.HandleError(w, apiErr)
		return
	}

	if err := h.userService.UpdateUser(ctx, user); err != nil {
		apiErr := response.InternalServerException("Failed to update user", err)
		response.HandleError(w, apiErr)
		return
	}

	user.PasswordHash = ""
	response.Success(w, user, "User updated successfully")
}

// ChangeRole handles PATCH /users/:id/role requests
// @Summary Change User Role
// @Description Change user role between platform-user and moderator
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body ChangeUserRoleRequest true "Target role"
// @Success 200 {object} map[string]interface{} "Role updated"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 404 {object} map[string]interface{} "User not found"
// @Failure 500 {object} map[string]interface{} "Server error"
// @Router /users/{id}/role [patch]
func (h *UserHandler) ChangeRole(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := chi.URLParam(r, "id")
	if strings.TrimSpace(userID) == "" {
		response.BadRequest(w, "User ID is required")
		return
	}

	var req ChangeUserRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiErr := response.BadRequestException("Invalid request body", err)
		response.HandleError(w, apiErr)
		return
	}

	user, err := h.userService.ChangeUserRole(ctx, userID, req.Role)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			apiErr := response.NotFoundException("User not found", err)
			response.HandleError(w, apiErr)
			return
		}
		if errors.Is(err, service.ErrInvalidRoleChange) {
			apiErr := response.BadRequestException("Role must be platform-user or moderator", err)
			response.HandleError(w, apiErr)
			return
		}
		apiErr := response.InternalServerException("Failed to change user role", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, user, "User role updated successfully")
}

// Delete handles DELETE /users/:id requests
// @Summary Delete User
// @Description Soft delete a user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{} "User deleted"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 500 {object} map[string]interface{} "Server error"
// @Router /users/{id} [delete]
func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := chi.URLParam(r, "id")
	if strings.TrimSpace(userID) == "" {
		response.BadRequest(w, "User ID is required")
		return
	}

	if err := h.userService.DeleteUser(ctx, userID); err != nil {
		apiErr := response.InternalServerException("Failed to delete user", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, map[string]interface{}{"deleted": true}, "User deleted successfully")
}

func parseOptionalBool(raw string) *bool {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	v, err := strconv.ParseBool(raw)
	if err != nil {
		return nil
	}
	return &v
}
