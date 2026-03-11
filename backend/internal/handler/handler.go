package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

// HealthHandler handles health check requests
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Check handles GET /health requests
func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"status":  "OK",
		"service": "sinhala-sub",
		"version": "v1.0.0",
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
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
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

	user, err := h.userService.CreateUser(ctx, req.Name, req.Email, req.Password)
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

// VideoHandler handles video-related requests
type VideoHandler struct {
	videoService service.VideoService
}

// NewVideoHandler creates a new video handler
func NewVideoHandler(videoService service.VideoService) *VideoHandler {
	return &VideoHandler{
		videoService: videoService,
	}
}

// GetByID handles GET /videos/:id requests
func (h *VideoHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	videoID := chi.URLParam(r, "id")

	if videoID == "" {
		response.BadRequest(w, "Video ID is required")
		return
	}

	video, err := h.videoService.GetVideo(ctx, videoID)
	if err != nil {
		apiErr := response.NotFoundException("Video not found", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, video, "Video retrieved successfully")
}

// List handles GET /videos requests
func (h *VideoHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	videos, err := h.videoService.ListVideos(ctx, 20, 0)
	if err != nil {
		apiErr := response.InternalServerException("Failed to fetch videos", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, videos, "Videos retrieved successfully")
}

// SubtitleHandler handles subtitle-related requests
type SubtitleHandler struct {
	subtitleService service.SubtitleService
}

// NewSubtitleHandler creates a new subtitle handler
func NewSubtitleHandler(subtitleService service.SubtitleService) *SubtitleHandler {
	return &SubtitleHandler{
		subtitleService: subtitleService,
	}
}

// GetByID handles GET /subtitles/:id requests
func (h *SubtitleHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	subtitleID := chi.URLParam(r, "id")

	if subtitleID == "" {
		response.BadRequest(w, "Subtitle ID is required")
		return
	}

	subtitle, err := h.subtitleService.GetSubtitle(ctx, subtitleID)
	if err != nil {
		apiErr := response.NotFoundException("Subtitle not found", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, subtitle, "Subtitle retrieved successfully")
}

// List handles GET /subtitles requests
func (h *SubtitleHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	subtitles, err := h.subtitleService.ListSubtitles(ctx, 50, 0)
	if err != nil {
		apiErr := response.InternalServerException("Failed to fetch subtitles", err)
		response.HandleError(w, apiErr)
		return
	}

	response.Success(w, subtitles, "Subtitles retrieved successfully")
}
