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

// CastHandler handles cast HTTP requests
type CastHandler struct {
	service *service.CastService
}

// NewCastHandler creates a new cast handler
func NewCastHandler(service *service.CastService) *CastHandler {
	return &CastHandler{service: service}
}

// List handles GET /movies/:movieId/cast
// @Summary List Cast Members
// @Description Get paginated list of cast members for a movie
// @Tags Cast
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/cast [get]
func (h *CastHandler) List(w http.ResponseWriter, r *http.Request) {
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

	cast, total, err := h.service.List(movieID, page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to retrieve cast")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": cast,
		"meta": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// Create handles POST /movies/:movieId/cast
// @Summary Add Cast Member
// @Description Add a new cast member to a movie
// @Tags Cast
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.AddCastRequest true "Cast member details"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/cast [post]
func (h *CastHandler) Create(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.AddCastRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	cast, err := h.service.Create(movieID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add cast member")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, cast, "Cast member added successfully")
}

// Update handles PUT /cast/:id
// @Summary Update Cast Member
// @Description Update an existing cast member
// @Tags Cast
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Cast Member ID"
// @Param request body domain.UpdateCastRequest true "Updated cast member details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/cast/{id} [put]
func (h *CastHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid cast ID")
		return
	}

	var req domain.UpdateCastRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	cast, err := h.service.Update(id, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Cast member not found")
			return
		}
		response.InternalServerError(w, "Failed to update cast member")
		return
	}

	response.Success(w, cast, "Cast member updated successfully")
}

// Delete handles DELETE /cast/:id
// @Summary Delete Cast Member
// @Description Delete a cast member
// @Tags Cast
// @Security BearerAuth
// @Param id path int true "Cast Member ID"
// @Success 204
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/cast/{id} [delete]
func (h *CastHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid cast ID")
		return
	}

	if err := h.service.Delete(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Cast member not found")
			return
		}
		response.InternalServerError(w, "Failed to delete cast member")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// BulkCreate handles POST /movies/:movieId/cast/bulk
// @Summary Bulk Add Cast Members
// @Description Add multiple cast members to a movie
// @Tags Cast
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param request body domain.BulkAddCastRequest true "Cast members array"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /v1/movies/{movieId}/cast/bulk [post]
func (h *CastHandler) BulkCreate(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.BulkAddCastRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if len(req.Cast) == 0 {
		response.BadRequest(w, "Cast array is required and must not be empty")
		return
	}

	castReq := make([]*domain.AddCastRequest, len(req.Cast))
	for i := range req.Cast {
		castReq[i] = &req.Cast[i]
	}

	cast, err := h.service.BulkCreate(movieID, castReq)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add cast members")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, cast, "Cast members added successfully")
}
