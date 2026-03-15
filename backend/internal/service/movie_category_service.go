package service

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// MovieCategoryService handles movie category business logic
type MovieCategoryService struct {
	repo *repository.MovieCategoryRepository
}

// NewMovieCategoryService creates a new movie category service
func NewMovieCategoryService(repo *repository.MovieCategoryRepository) *MovieCategoryService {
	return &MovieCategoryService{repo: repo}
}

// Add adds a category to a movie
func (s *MovieCategoryService) Add(movieID int, req *domain.AddCategoryRequest) (*domain.MovieCategory, error) {
	category := &domain.MovieCategory{
		MovieID:      movieID,
		CategoryID:   req.CategoryID,
		CategoryName: req.CategoryName,
	}

	if err := s.repo.Add(movieID, category); err != nil {
		return nil, err
	}

	return category, nil
}

// List retrieves categories for a movie
func (s *MovieCategoryService) List(movieID int, page, limit int) ([]*domain.MovieCategory, int, error) {
	return s.repo.List(movieID, page, limit)
}

// Delete removes a category from a movie
func (s *MovieCategoryService) Delete(movieID, categoryID int) error {
	return s.repo.Delete(movieID, categoryID)
}

// BulkAdd adds multiple categories to a movie
func (s *MovieCategoryService) BulkAdd(movieID int, reqs []*domain.AddCategoryRequest) ([]*domain.MovieCategory, error) {
	categories := make([]*domain.MovieCategory, 0)

	for _, req := range reqs {
		category := &domain.MovieCategory{
			MovieID:      movieID,
			CategoryID:   req.CategoryID,
			CategoryName: req.CategoryName,
		}
		categories = append(categories, category)
	}

	if err := s.repo.BulkAdd(movieID, categories); err != nil {
		return nil, err
	}

	return categories, nil
}
