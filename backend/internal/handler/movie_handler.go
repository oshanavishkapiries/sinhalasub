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

// MovieHandler handles movie-related HTTP requests
type MovieHandler struct {
	service *service.MovieService
}

// NewMovieHandler creates a new movie handler
func NewMovieHandler(service *service.MovieService) *MovieHandler {
	return &MovieHandler{service: service}
}

// List handles GET /movies
// @Summary List Movies
// @Description Get paginated list of movies with filtering and sorting
// @Tags Movies
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search by title"
// @Param slug query string false "Filter by slug"
// @Param rating_min query number false "Minimum IMDB rating"
// @Param rating_max query number false "Maximum IMDB rating"
// @Param release_year query int false "Filter by release year"
// @Param sort_by query string false "Sort field (title, rating, release_date)" default(release_date)
// @Param sort_order query string false "asc or desc" default(desc)
// @Success 200 {object} map[string]interface{}
// @Router /v1/movies [get]
func (h *MovieHandler) List(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	filters := make(map[string]interface{})

	if search := r.URL.Query().Get("search"); search != "" {
		filters["search"] = search
	}

	if slug := r.URL.Query().Get("slug"); slug != "" {
		filters["slug"] = slug
	}

	if ratingMin := r.URL.Query().Get("rating_min"); ratingMin != "" {
		if val, err := strconv.ParseFloat(ratingMin, 32); err == nil {
			filters["rating_min"] = float32(val)
		}
	}

	if ratingMax := r.URL.Query().Get("rating_max"); ratingMax != "" {
		if val, err := strconv.ParseFloat(ratingMax, 32); err == nil {
			filters["rating_max"] = float32(val)
		}
	}

	if releaseYear := r.URL.Query().Get("release_year"); releaseYear != "" {
		if val, err := strconv.Atoi(releaseYear); err == nil {
			filters["release_year"] = val
		}
	}

	if sortBy := r.URL.Query().Get("sort_by"); sortBy != "" {
		filters["sort_by"] = sortBy
	}

	if sortOrder := r.URL.Query().Get("sort_order"); sortOrder != "" {
		filters["sort_order"] = sortOrder
	}

	movies, total, err := h.service.List(page, limit, filters)
	if err != nil {
		response.InternalServerError(w, "Failed to retrieve movies")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": movies,
		"meta": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetByID handles GET /movies/:id
// @Summary Get Movie by ID
// @Description Get a specific movie by its ID
// @Tags Movies
// @Accept json
// @Produce json
// @Param id path int true "Movie ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{} "Movie not found"
// @Router /v1/movies/{id} [get]
func (h *MovieHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	movie, err := h.service.GetByID(id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to retrieve movie")
		return
	}

	response.Success(w, movie, "")
}

// GetBySlug handles GET /movies/slug/:slug
// @Summary Get Movie by Slug
// @Description Get a specific movie by its slug
// @Tags Movies
// @Accept json
// @Produce json
// @Param slug path string true "Movie Slug"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{} "Movie not found"
// @Router /v1/movies/slug/{slug} [get]
func (h *MovieHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	movie, err := h.service.GetBySlug(slug)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to retrieve movie")
		return
	}

	response.Success(w, movie, "")
}

// Create handles POST /movies
// @Summary Create Movie
// @Description Create a new movie (Admin/Moderator only)
// @Tags Movies
// @Accept json
// @Produce json
// @Security Bearer
// @Param movie body domain.CreateMovieRequest true "Movie data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Router /v1/movies [post]
func (h *MovieHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateMovieRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Title == "" {
		response.BadRequest(w, "Title is required")
		return
	}

	movie, err := h.service.Create(&req)
	if err != nil {
		response.InternalServerError(w, "Failed to create movie")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, movie, "Movie created successfully")
}

// Update handles PUT /movies/:id
// @Summary Update Movie
// @Description Update a movie (Admin/Moderator only)
// @Tags Movies
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "Movie ID"
// @Param movie body domain.UpdateMovieRequest true "Movie data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Failure 404 {object} map[string]interface{} "Movie not found"
// @Router /v1/movies/{id} [put]
func (h *MovieHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.UpdateMovieRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	movie, err := h.service.Update(id, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to update movie")
		return
	}

	response.Success(w, movie, "Movie updated successfully")
}

// Delete handles DELETE /movies/:id
// @Summary Delete Movie
// @Description Delete a movie (Admin/Moderator only)
// @Tags Movies
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "Movie ID"
// @Success 204
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Failure 404 {object} map[string]interface{} "Movie not found"
// @Router /v1/movies/{id} [delete]
func (h *MovieHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	if err := h.service.Delete(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to delete movie")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// BulkCreate handles POST /movies/bulk
// @Summary Bulk Create Movies
// @Description Create multiple movies at once (Admin/Moderator only)
// @Tags Movies
// @Accept json
// @Produce json
// @Security Bearer
// @Param movies body domain.BulkCreateMoviesRequest true "Movies data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Router /v1/movies/bulk [post]
func (h *MovieHandler) BulkCreate(w http.ResponseWriter, r *http.Request) {
	var req domain.BulkCreateMoviesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if len(req.Movies) == 0 {
		response.BadRequest(w, "Movies array is required and must not be empty")
		return
	}

	moviesReq := make([]*domain.CreateMovieRequest, len(req.Movies))
	for i := range req.Movies {
		moviesReq[i] = &req.Movies[i]
	}
	movies, err := h.service.BulkCreate(moviesReq)
	if err != nil {
		response.InternalServerError(w, "Failed to create movies")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, movies, "Movies created successfully")
}
