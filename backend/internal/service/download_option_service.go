package service

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// DownloadOptionService handles download option business logic
type DownloadOptionService struct {
	repo *repository.DownloadOptionRepository
}

// NewDownloadOptionService creates a new download option service
func NewDownloadOptionService(repo *repository.DownloadOptionRepository) *DownloadOptionService {
	return &DownloadOptionService{repo: repo}
}

// Create adds a download option to a movie
func (s *DownloadOptionService) Create(movieID int, req *domain.AddDownloadOptionRequest) (*domain.DownloadOption, error) {
	option := &domain.DownloadOption{
		MovieID:            movieID,
		DownloadOption:     req.DownloadOption,
		DownloadOptionURL:  req.DownloadOptionURL,
		DownloadOptionType: req.DownloadOptionType,
		FileSize:           req.FileSize,
		VideoQuality:       req.VideoQuality,
	}

	if err := s.repo.Create(option); err != nil {
		return nil, err
	}

	return option, nil
}

// GetByID retrieves a download option by ID
func (s *DownloadOptionService) GetByID(id int) (*domain.DownloadOption, error) {
	return s.repo.GetByID(id)
}

// List retrieves download options for a movie
func (s *DownloadOptionService) List(movieID int, page, limit int, videoQuality, downloadType string) ([]*domain.DownloadOption, int, error) {
	return s.repo.List(movieID, page, limit, videoQuality, downloadType)
}

// Update updates a download option
func (s *DownloadOptionService) Update(id int, req *domain.UpdateDownloadOptionRequest) (*domain.DownloadOption, error) {
	option := &domain.DownloadOption{
		DownloadOption:     req.DownloadOption,
		DownloadOptionURL:  req.DownloadOptionURL,
		DownloadOptionType: req.DownloadOptionType,
		FileSize:           req.FileSize,
		VideoQuality:       req.VideoQuality,
	}

	if err := s.repo.Update(id, option); err != nil {
		return nil, err
	}

	return option, nil
}

// Delete removes a download option
func (s *DownloadOptionService) Delete(id int) error {
	return s.repo.Delete(id)
}

// BulkCreate adds multiple download options to a movie
func (s *DownloadOptionService) BulkCreate(movieID int, reqs []*domain.AddDownloadOptionRequest) ([]*domain.DownloadOption, error) {
	options := make([]*domain.DownloadOption, 0)

	for _, req := range reqs {
		option := &domain.DownloadOption{
			MovieID:            movieID,
			DownloadOption:     req.DownloadOption,
			DownloadOptionURL:  req.DownloadOptionURL,
			DownloadOptionType: req.DownloadOptionType,
			FileSize:           req.FileSize,
			VideoQuality:       req.VideoQuality,
		}
		options = append(options, option)
	}

	if err := s.repo.BulkCreate(movieID, options); err != nil {
		return nil, err
	}

	return options, nil
}
