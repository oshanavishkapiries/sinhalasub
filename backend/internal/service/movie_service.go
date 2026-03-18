package service

import (
	"regexp"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// MovieService handles movie business logic
type MovieService struct {
	repo *repository.MovieRepository
}

// NewMovieService creates a new movie service
func NewMovieService(repo *repository.MovieRepository) *MovieService {
	return &MovieService{repo: repo}
}

// GenerateSlug generates a URL-safe slug from a title
func (s *MovieService) GenerateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)

	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters, keep only alphanumeric and hyphens
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")

	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")

	// Replace multiple consecutive hyphens with single hyphen
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}

	return slug
}

// Create creates a new movie
func (s *MovieService) Create(req *domain.CreateMovieRequest) (*domain.Movie, error) {
	movie := &domain.Movie{
		Title:       req.Title,
		Rating:      req.Rating,
		ReleaseDate: req.ReleaseDate,
		PosterURL:   req.PosterURL,
		Overview:    req.Overview,
	}

	// Generate slug if not provided
	if req.Slug == "" {
		movie.Slug = s.GenerateSlug(req.Title)
	} else {
		movie.Slug = s.GenerateSlug(req.Slug)
	}

	// Ensure slug is unique
	i := 1
	baseSlug := movie.Slug
	for {
		exists, err := s.repo.SlugExists(movie.Slug)
		if err != nil {
			return nil, err
		}
		if !exists {
			break
		}
		movie.Slug = baseSlug + "-" + string(rune(i))
		i++
	}

	if err := s.repo.Create(movie); err != nil {
		return nil, err
	}

	return movie, nil
}

// GetByID retrieves a movie by ID
func (s *MovieService) GetByID(id int) (*domain.Movie, error) {
	return s.repo.GetByID(id)
}

// GetBySlug retrieves a movie by slug
func (s *MovieService) GetBySlug(slug string) (*domain.Movie, error) {
	return s.repo.GetBySlug(slug)
}

// List retrieves paginated movies
func (s *MovieService) List(page, limit int, filters map[string]interface{}) ([]*domain.Movie, int, error) {
	return s.repo.List(page, limit, filters)
}

// Update updates a movie
func (s *MovieService) Update(id int, req *domain.UpdateMovieRequest) (*domain.Movie, error) {
	movie := &domain.Movie{
		Title:       req.Title,
		Rating:      req.Rating,
		ReleaseDate: req.ReleaseDate,
		PosterURL:   req.PosterURL,
		Overview:    req.Overview,
	}

	// Generate new slug if provided
	if req.Slug != "" {
		movie.Slug = s.GenerateSlug(req.Slug)

		// Ensure new slug is unique (excluding current movie)
		exists, err := s.repo.SlugExists(movie.Slug)
		if err != nil {
			return nil, err
		}

		if exists {
			// Check if it's the same movie
			existing, err := s.repo.GetBySlug(movie.Slug)
			if err == nil && existing.ID != id {
				i := 1
				baseSlug := movie.Slug
				for {
					newSlug := baseSlug + "-" + string(rune(i))
					exists, err := s.repo.SlugExists(newSlug)
					if err != nil {
						return nil, err
					}
					if !exists {
						movie.Slug = newSlug
						break
					}
					i++
				}
			}
		}
	}

	if err := s.repo.Update(id, movie); err != nil {
		return nil, err
	}

	return movie, nil
}

// Delete deletes a movie
func (s *MovieService) Delete(id int) error {
	return s.repo.Delete(id)
}

// BulkCreate creates multiple movies
func (s *MovieService) BulkCreate(reqs []*domain.CreateMovieRequest) ([]*domain.Movie, error) {
	movies := make([]*domain.Movie, 0)

	for _, req := range reqs {
		movie := &domain.Movie{
			Title:       req.Title,
			Rating:      req.Rating,
			ReleaseDate: req.ReleaseDate,
			PosterURL:   req.PosterURL,
			Overview:    req.Overview,
		}

		// Generate slug if not provided
		if req.Slug == "" {
			movie.Slug = s.GenerateSlug(req.Title)
		} else {
			movie.Slug = s.GenerateSlug(req.Slug)
		}

		// Ensure slug is unique
		i := 1
		baseSlug := movie.Slug
		for {
			exists, err := s.repo.SlugExists(movie.Slug)
			if err != nil {
				return nil, err
			}
			if !exists {
				break
			}
			movie.Slug = baseSlug + "-" + string(rune(i))
			i++
		}

		movies = append(movies, movie)
	}

	if err := s.repo.BulkCreate(movies); err != nil {
		return nil, err
	}

	return movies, nil
}
