package service

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// PlayerProviderService handles player provider business logic
type PlayerProviderService struct {
	repo *repository.PlayerProviderRepository
}

// NewPlayerProviderService creates a new player provider service
func NewPlayerProviderService(repo *repository.PlayerProviderRepository) *PlayerProviderService {
	return &PlayerProviderService{repo: repo}
}

// Create adds a player provider to a movie
func (s *PlayerProviderService) Create(movieID int, req *domain.AddPlayerProviderRequest) (*domain.PlayerProvider, error) {
	provider := &domain.PlayerProvider{
		MovieID:            movieID,
		PlayerProvider:     req.PlayerProvider,
		PlayerProviderURL:  req.PlayerProviderURL,
		PlayerProviderType: req.PlayerProviderType,
		VideoQuality:       req.VideoQuality,
		IsDefault:          req.IsDefault,
		IsAdsAvailable:     req.IsAdsAvailable,
	}

	if err := s.repo.Create(provider); err != nil {
		return nil, err
	}

	return provider, nil
}

// GetByID retrieves a player provider by ID
func (s *PlayerProviderService) GetByID(id int) (*domain.PlayerProvider, error) {
	return s.repo.GetByID(id)
}

// List retrieves player providers for a movie
func (s *PlayerProviderService) List(movieID int, page, limit int, videoQuality string, isDefault *bool) ([]*domain.PlayerProvider, int, error) {
	return s.repo.List(movieID, page, limit, videoQuality, isDefault)
}

// Update updates a player provider
func (s *PlayerProviderService) Update(id int, req *domain.UpdatePlayerProviderRequest) (*domain.PlayerProvider, error) {
	provider := &domain.PlayerProvider{
		PlayerProvider:     req.PlayerProvider,
		PlayerProviderURL:  req.PlayerProviderURL,
		PlayerProviderType: req.PlayerProviderType,
		VideoQuality:       req.VideoQuality,
	}

	if req.IsDefault != nil {
		provider.IsDefault = *req.IsDefault
	}
	if req.IsAdsAvailable != nil {
		provider.IsAdsAvailable = *req.IsAdsAvailable
	}

	if err := s.repo.Update(id, provider); err != nil {
		return nil, err
	}

	return provider, nil
}

// Delete removes a player provider
func (s *PlayerProviderService) Delete(id int) error {
	return s.repo.Delete(id)
}

// BulkCreate adds multiple player providers to a movie
func (s *PlayerProviderService) BulkCreate(movieID int, reqs []*domain.AddPlayerProviderRequest) ([]*domain.PlayerProvider, error) {
	providers := make([]*domain.PlayerProvider, 0)

	for _, req := range reqs {
		provider := &domain.PlayerProvider{
			MovieID:            movieID,
			PlayerProvider:     req.PlayerProvider,
			PlayerProviderURL:  req.PlayerProviderURL,
			PlayerProviderType: req.PlayerProviderType,
			VideoQuality:       req.VideoQuality,
			IsDefault:          req.IsDefault,
			IsAdsAvailable:     req.IsAdsAvailable,
		}
		providers = append(providers, provider)
	}

	if err := s.repo.BulkCreate(movieID, providers); err != nil {
		return nil, err
	}

	return providers, nil
}
