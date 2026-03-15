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

// SubtitleHandler handles subtitle HTTP requests
type SubtitleHandler struct {
	service *service.SubtitleService
}

// NewSubtitleHandler creates a new subtitle handler
func NewSubtitleHandler(service *service.SubtitleService) *SubtitleHandler {
	return &SubtitleHandler{service: service}
}

// List handles GET /movies/:movieId/subtitles
// @Summary List Subtitles
// @Description Get paginated list of subtitles for a movie
// @Tags Subtitles
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param language query string false "Filter by language"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/movies/{movieId}/subtitles [get]
func (h *SubtitleHandler) List(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	language := r.URL.Query().Get("language")

	subtitles, total, err := h.service.List(movieID, page, limit, language)
	if err != nil {
		response.InternalServerError(w, "Failed to retrieve subtitles")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": subtitles,
		"meta": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// Create handles POST /movies/:movieId/subtitles
// @Summary Add Subtitle
// @Description Add a new subtitle to a movie
// @Tags Subtitles
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.AddSubtitleRequest true "Subtitle details"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/movies/{movieId}/subtitles [post]
func (h *SubtitleHandler) Create(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.AddSubtitleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	subtitle, err := h.service.Create(movieID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add subtitle")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, subtitle, "Subtitle added successfully")
}

// Update handles PUT /subtitles/:id
// @Summary Update Subtitle
// @Description Update an existing subtitle
// @Tags Subtitles
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Subtitle ID"
// @Param request body domain.UpdateSubtitleRequest true "Updated subtitle details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/subtitles/{id} [put]
func (h *SubtitleHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid subtitle ID")
		return
	}

	var req domain.UpdateSubtitleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	subtitle, err := h.service.Update(id, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Subtitle not found")
			return
		}
		response.InternalServerError(w, "Failed to update subtitle")
		return
	}

	response.Success(w, subtitle, "Subtitle updated successfully")
}

// Delete handles DELETE /subtitles/:id
// @Summary Delete Subtitle
// @Description Delete a subtitle
// @Tags Subtitles
// @Security BearerAuth
// @Param id path int true "Subtitle ID"
// @Success 204
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/subtitles/{id} [delete]
func (h *SubtitleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid subtitle ID")
		return
	}

	if err := h.service.Delete(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Subtitle not found")
			return
		}
		response.InternalServerError(w, "Failed to delete subtitle")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// BulkCreate handles POST /movies/:movieId/subtitles/bulk
// @Summary Bulk Add Subtitles
// @Description Add multiple subtitles to a movie
// @Tags Subtitles
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.BulkAddSubtitlesRequest true "Subtitles array"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/movies/{movieId}/subtitles/bulk [post]
func (h *SubtitleHandler) BulkCreate(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.BulkAddSubtitlesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if len(req.Subtitles) == 0 {
		response.BadRequest(w, "Subtitles array is required and must not be empty")
		return
	}

	subtitlesReq := make([]*domain.AddSubtitleRequest, len(req.Subtitles))
	for i := range req.Subtitles {
		subtitlesReq[i] = &req.Subtitles[i]
	}

	subtitles, err := h.service.BulkCreate(movieID, subtitlesReq)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add subtitles")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, subtitles, "Subtitles added successfully")
}
