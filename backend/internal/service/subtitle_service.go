package service

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// SubtitleService handles subtitle business logic
type SubtitleService struct {
	repo *repository.SubtitleRepository
}

// NewSubtitleService creates a new subtitle service
func NewSubtitleService(repo *repository.SubtitleRepository) *SubtitleService {
	return &SubtitleService{repo: repo}
}

// Create adds a subtitle to a movie
func (s *SubtitleService) Create(movieID int, req *domain.AddSubtitleRequest) (*domain.Subtitle, error) {
	subtitle := &domain.Subtitle{
		MovieID:        movieID,
		Language:       req.Language,
		SubtitleURL:    req.SubtitleURL,
		SubtitleAuthor: req.SubtitleAuthor,
	}

	if err := s.repo.Create(subtitle); err != nil {
		return nil, err
	}

	return subtitle, nil
}

// GetByID retrieves a subtitle by ID
func (s *SubtitleService) GetByID(id int) (*domain.Subtitle, error) {
	return s.repo.GetByID(id)
}

// List retrieves subtitles for a movie
func (s *SubtitleService) List(movieID int, page, limit int, language string) ([]*domain.Subtitle, int, error) {
	return s.repo.List(movieID, page, limit, language)
}

// Update updates a subtitle
func (s *SubtitleService) Update(id int, req *domain.UpdateSubtitleRequest) (*domain.Subtitle, error) {
	subtitle := &domain.Subtitle{
		Language:       req.Language,
		SubtitleURL:    req.SubtitleURL,
		SubtitleAuthor: req.SubtitleAuthor,
	}

	if err := s.repo.Update(id, subtitle); err != nil {
		return nil, err
	}

	return subtitle, nil
}

// Delete removes a subtitle
func (s *SubtitleService) Delete(id int) error {
	return s.repo.Delete(id)
}

// BulkCreate adds multiple subtitles to a movie
func (s *SubtitleService) BulkCreate(movieID int, reqs []*domain.AddSubtitleRequest) ([]*domain.Subtitle, error) {
	subtitles := make([]*domain.Subtitle, 0)

	for _, req := range reqs {
		subtitle := &domain.Subtitle{
			MovieID:        movieID,
			Language:       req.Language,
			SubtitleURL:    req.SubtitleURL,
			SubtitleAuthor: req.SubtitleAuthor,
		}
		subtitles = append(subtitles, subtitle)
	}

	if err := s.repo.BulkCreate(movieID, subtitles); err != nil {
		return nil, err
	}

	return subtitles, nil
}
