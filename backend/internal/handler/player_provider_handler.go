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

// PlayerProviderHandler handles player provider HTTP requests
type PlayerProviderHandler struct {
	service *service.PlayerProviderService
}

// NewPlayerProviderHandler creates a new player provider handler
func NewPlayerProviderHandler(service *service.PlayerProviderService) *PlayerProviderHandler {
	return &PlayerProviderHandler{service: service}
}

// List handles GET /movies/:movieId/players
// @Summary List Player Providers
// @Description Get paginated list of player providers for a movie
// @Tags Player Providers
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param video_quality query string false "Filter by video quality"
// @Param is_default query boolean false "Filter by default status"
// @Success 200 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/players [get]
func (h *PlayerProviderHandler) List(w http.ResponseWriter, r *http.Request) {
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

	var isDefault *bool
	if isDefaultStr := r.URL.Query().Get("is_default"); isDefaultStr != "" {
		val := isDefaultStr == "true"
		isDefault = &val
	}

	providers, total, err := h.service.List(movieID, page, limit, videoQuality, isDefault)
	if err != nil {
		response.InternalServerError(w, "Failed to retrieve players")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": providers,
		"meta": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// Create handles POST /movies/:movieId/players
// @Summary Add Player Provider
// @Description Add a new player provider to a movie
// @Tags Player Providers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.AddPlayerProviderRequest true "Player provider details"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/players [post]
func (h *PlayerProviderHandler) Create(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.AddPlayerProviderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	provider, err := h.service.Create(movieID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add player provider")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, provider, "Player provider added successfully")
}

// Update handles PUT /players/:id
// @Summary Update Player Provider
// @Description Update an existing player provider
// @Tags Player Providers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Player Provider ID"
// @Param request body domain.UpdatePlayerProviderRequest true "Updated player provider details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/players/{id} [put]
func (h *PlayerProviderHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid player ID")
		return
	}

	var req domain.UpdatePlayerProviderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	provider, err := h.service.Update(id, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Player provider not found")
			return
		}
		response.InternalServerError(w, "Failed to update player provider")
		return
	}

	response.Success(w, provider, "Player provider updated successfully")
}

// Delete handles DELETE /players/:id
// @Summary Delete Player Provider
// @Description Delete a player provider
// @Tags Player Providers
// @Security BearerAuth
// @Param id path int true "Player Provider ID"
// @Success 204
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/players/{id} [delete]
func (h *PlayerProviderHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid player ID")
		return
	}

	if err := h.service.Delete(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Player provider not found")
			return
		}
		response.InternalServerError(w, "Failed to delete player provider")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// BulkCreate handles POST /movies/:movieId/players/bulk
// @Summary Bulk Add Player Providers
// @Description Add multiple player providers to a movie
// @Tags Player Providers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.BulkAddPlayerProvidersRequest true "Player providers array"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/players/bulk [post]
func (h *PlayerProviderHandler) BulkCreate(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.BulkAddPlayerProvidersRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if len(req.Players) == 0 {
		response.BadRequest(w, "Players array is required and must not be empty")
		return
	}

	playersReq := make([]*domain.AddPlayerProviderRequest, len(req.Players))
	for i := range req.Players {
		playersReq[i] = &req.Players[i]
	}

	providers, err := h.service.BulkCreate(movieID, playersReq)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add player providers")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, providers, "Player providers added successfully")
}
