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

// DownloadOptionHandler handles download option HTTP requests
type DownloadOptionHandler struct {
	service *service.DownloadOptionService
}

// NewDownloadOptionHandler creates a new download option handler
func NewDownloadOptionHandler(service *service.DownloadOptionService) *DownloadOptionHandler {
	return &DownloadOptionHandler{service: service}
}

// List handles GET /movies/:movieId/downloads
// @Summary List Download Options
// @Description Get paginated list of download options for a movie
// @Tags Download Options
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param video_quality query string false "Filter by video quality"
// @Param download_option_type query string false "Filter by download type"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/movies/{movieId}/downloads [get]
func (h *DownloadOptionHandler) List(w http.ResponseWriter, r *http.Request) {
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

	videoQuality := r.URL.Query().Get("video_quality")
	downloadType := r.URL.Query().Get("download_option_type")

	options, total, err := h.service.List(movieID, page, limit, videoQuality, downloadType)
	if err != nil {
		response.InternalServerError(w, "Failed to retrieve downloads")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": options,
		"meta": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// Create handles POST /movies/:movieId/downloads
// @Summary Add Download Option
// @Description Add a new download option to a movie
// @Tags Download Options
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.AddDownloadOptionRequest true "Download option details"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/movies/{movieId}/downloads [post]
func (h *DownloadOptionHandler) Create(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.AddDownloadOptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	option, err := h.service.Create(movieID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add download option")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, option, "Download option added successfully")
}

// Update handles PUT /downloads/:id
// @Summary Update Download Option
// @Description Update an existing download option
// @Tags Download Options
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Download Option ID"
// @Param request body domain.UpdateDownloadOptionRequest true "Updated download option details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/downloads/{id} [put]
func (h *DownloadOptionHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid download ID")
		return
	}

	var req domain.UpdateDownloadOptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	option, err := h.service.Update(id, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Download option not found")
			return
		}
		response.InternalServerError(w, "Failed to update download option")
		return
	}

	response.Success(w, option, "Download option updated successfully")
}

// Delete handles DELETE /downloads/:id
// @Summary Delete Download Option
// @Description Delete a download option
// @Tags Download Options
// @Security BearerAuth
// @Param id path int true "Download Option ID"
// @Success 204
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/downloads/{id} [delete]
func (h *DownloadOptionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid download ID")
		return
	}

	if err := h.service.Delete(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Download option not found")
			return
		}
		response.InternalServerError(w, "Failed to delete download option")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// BulkCreate handles POST /movies/:movieId/downloads/bulk
// @Summary Bulk Add Download Options
// @Description Add multiple download options to a movie
// @Tags Download Options
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.BulkAddDownloadOptionsRequest true "Download options array"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/movies/{movieId}/downloads/bulk [post]
func (h *DownloadOptionHandler) BulkCreate(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.BulkAddDownloadOptionsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if len(req.Downloads) == 0 {
		response.BadRequest(w, "Downloads array is required and must not be empty")
		return
	}

	downloadsReq := make([]*domain.AddDownloadOptionRequest, len(req.Downloads))
	for i := range req.Downloads {
		downloadsReq[i] = &req.Downloads[i]
	}

	options, err := h.service.BulkCreate(movieID, downloadsReq)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add download options")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, options, "Download options added successfully")
}
