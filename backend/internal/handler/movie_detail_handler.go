package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

// MovieDetailHandler handles movie detail HTTP requests
type MovieDetailHandler struct {
	service *service.MovieDetailService
}

// NewMovieDetailHandler creates a new movie detail handler
func NewMovieDetailHandler(service *service.MovieDetailService) *MovieDetailHandler {
	return &MovieDetailHandler{service: service}
}

// GetByMovieID handles GET /movies/:movieId/details
// @Summary Get Movie Details
// @Description Get detailed information for a movie
// @Tags Movie Details
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/details [get]
func (h *MovieDetailHandler) GetByMovieID(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	detail, err := h.service.GetByMovieID(movieID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie detail not found")
			return
		}
		response.InternalServerError(w, "Failed to retrieve movie detail")
		return
	}

	response.Success(w, detail, "")
}

// CreateOrUpdate handles PUT /movies/:movieId/details
// @Summary Create or Update Movie Details
// @Description Create or update detailed information for a movie
// @Tags Movie Details
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.CreateUpdateMovieDetailRequest true "Movie detail information"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/details [put]
func (h *MovieDetailHandler) CreateOrUpdate(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.CreateUpdateMovieDetailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	detail, err := h.service.CreateOrUpdate(movieID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to save movie detail")
		return
	}

	response.Success(w, detail, "Movie detail saved successfully")
}
