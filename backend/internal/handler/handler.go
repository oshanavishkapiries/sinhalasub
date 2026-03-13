package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/metrics"
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

// Create handles POST /users requests
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
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// In a real application, you would parse query parameters for limit and offset
	users, err := h.userService.ListUsers(ctx, 10, 0)
	if err != nil {
		apiErr := response.InternalServerException("Failed to fetch users", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, users, "Users retrieved successfully")
}

// Update handles PUT /users/:id requests
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
