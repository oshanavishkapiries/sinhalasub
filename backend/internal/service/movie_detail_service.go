package service

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// MovieDetailService handles movie detail business logic
type MovieDetailService struct {
	repo *repository.MovieDetailRepository
}

// NewMovieDetailService creates a new movie detail service
func NewMovieDetailService(repo *repository.MovieDetailRepository) *MovieDetailService {
	return &MovieDetailService{repo: repo}
}

// GetByMovieID retrieves movie details for a specific movie
func (s *MovieDetailService) GetByMovieID(movieID int) (*domain.MovieDetail, error) {
	return s.repo.GetByMovieID(movieID)
}

// CreateOrUpdate creates or updates movie details
func (s *MovieDetailService) CreateOrUpdate(movieID int, req *domain.CreateUpdateMovieDetailRequest) (*domain.MovieDetail, error) {
	detail := &domain.MovieDetail{
		MovieID:     movieID,
		Overview:    req.Overview,
		TMDBID:      req.TMDBID,
		IMDBID:      req.IMDBID,
		Adult:       req.Adult,
		Language:    req.Language,
		Duration:    req.Duration,
		BackdropURL: req.BackdropURL,
		TrailerURL:  req.TrailerURL,
		Director:    req.Director,
		Country:     req.Country,
	}

	if err := s.repo.CreateOrUpdate(detail); err != nil {
		return nil, err
	}

	return detail, nil
}
