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

// MovieCategoryHandler handles movie category HTTP requests
type MovieCategoryHandler struct {
	service *service.MovieCategoryService
}

// NewMovieCategoryHandler creates a new movie category handler
func NewMovieCategoryHandler(service *service.MovieCategoryService) *MovieCategoryHandler {
	return &MovieCategoryHandler{service: service}
}

// List handles GET /movies/:movieId/categories
// @Summary List Movie Categories
// @Description Get paginated list of categories for a movie
// @Tags Movie Categories
// @Accept json
// @Produce json
// @Param movieId path int true "Movie ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{} "Invalid movie ID"
// @Router /v1/movies/{movieId}/categories [get]
func (h *MovieCategoryHandler) List(w http.ResponseWriter, r *http.Request) {
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

	categories, total, err := h.service.List(movieID, page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to retrieve categories")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": categories,
		"meta": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// Add handles POST /movies/:movieId/categories
// @Summary Add Category to Movie
// @Description Add a category to a movie (Admin/Moderator only)
// @Tags Movie Categories
// @Accept json
// @Produce json
// @Security Bearer
// @Param movieId path int true "Movie ID"
// @Param category body domain.AddCategoryRequest true "Category data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Failure 404 {object} map[string]interface{} "Movie not found"
// @Router /v1/movies/{movieId}/categories [post]
func (h *MovieCategoryHandler) Add(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.AddCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	category, err := h.service.Add(movieID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add category")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, category, "Category added successfully")
}

// Delete handles DELETE /movies/:movieId/categories/:categoryId
// @Summary Remove Category from Movie
// @Description Remove a category from a movie (Admin/Moderator only)
// @Tags Movie Categories
// @Accept json
// @Produce json
// @Security Bearer
// @Param movieId path int true "Movie ID"
// @Param categoryId path int true "Category ID"
// @Success 204
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Failure 404 {object} map[string]interface{} "Category not found"
// @Router /v1/movies/{movieId}/categories/{categoryId} [delete]
func (h *MovieCategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	categoryIDStr := chi.URLParam(r, "categoryId")
	categoryID, err := strconv.Atoi(categoryIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid category ID")
		return
	}

	if err := h.service.Delete(movieID, categoryID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Category not found")
			return
		}
		response.InternalServerError(w, "Failed to delete category")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// BulkAdd handles POST /movies/:movieId/categories/bulk
// @Summary Add Multiple Categories
// @Description Add multiple categories to a movie (Admin/Moderator only)
// @Tags Movie Categories
// @Accept json
// @Produce json
// @Security Bearer
// @Param movieId path int true "Movie ID"
// @Param categories body domain.BulkAddCategoriesRequest true "Categories data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden"
// @Failure 404 {object} map[string]interface{} "Movie not found"
// @Router /v1/movies/{movieId}/categories/bulk [post]
func (h *MovieCategoryHandler) BulkAdd(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		response.BadRequest(w, "Invalid movie ID")
		return
	}

	var req domain.BulkAddCategoriesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if len(req.Categories) == 0 {
		response.BadRequest(w, "Categories array is required and must not be empty")
		return
	}

	categoriesReq := make([]*domain.AddCategoryRequest, len(req.Categories))
	for i := range req.Categories {
		categoriesReq[i] = &req.Categories[i]
	}

	categories, err := h.service.BulkAdd(movieID, categoriesReq)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.NotFound(w, "Movie not found")
			return
		}
		response.InternalServerError(w, "Failed to add categories")
		return
	}

	w.WriteHeader(http.StatusCreated)
	response.Success(w, categories, "Categories added successfully")
}
