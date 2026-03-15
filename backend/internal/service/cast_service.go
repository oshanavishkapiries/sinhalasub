package service

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
)

// CastService handles cast business logic
type CastService struct {
	repo *repository.CastRepository
}

// NewCastService creates a new cast service
func NewCastService(repo *repository.CastRepository) *CastService {
	return &CastService{repo: repo}
}

// Create adds a cast member to a movie
func (s *CastService) Create(movieID int, req *domain.AddCastRequest) (*domain.Cast, error) {
	cast := &domain.Cast{
		MovieID:       movieID,
		TMDBID:        req.TMDBID,
		ActorName:     req.ActorName,
		ActorImageURL: req.ActorImageURL,
		CharacterName: req.CharacterName,
	}

	if err := s.repo.Create(cast); err != nil {
		return nil, err
	}

	return cast, nil
}

// GetByID retrieves a cast member by ID
func (s *CastService) GetByID(id int) (*domain.Cast, error) {
	return s.repo.GetByID(id)
}

// List retrieves cast members for a movie
func (s *CastService) List(movieID int, page, limit int) ([]*domain.Cast, int, error) {
	return s.repo.List(movieID, page, limit)
}

// Update updates a cast member
func (s *CastService) Update(id int, req *domain.UpdateCastRequest) (*domain.Cast, error) {
	cast := &domain.Cast{
		TMDBID:        req.TMDBID,
		ActorName:     req.ActorName,
		ActorImageURL: req.ActorImageURL,
		CharacterName: req.CharacterName,
	}

	if err := s.repo.Update(id, cast); err != nil {
		return nil, err
	}

	return cast, nil
}

// Delete removes a cast member
func (s *CastService) Delete(id int) error {
	return s.repo.Delete(id)
}

// BulkCreate adds multiple cast members to a movie
func (s *CastService) BulkCreate(movieID int, reqs []*domain.AddCastRequest) ([]*domain.Cast, error) {
	castMembers := make([]*domain.Cast, 0)

	for _, req := range reqs {
		cast := &domain.Cast{
			MovieID:       movieID,
			TMDBID:        req.TMDBID,
			ActorName:     req.ActorName,
			ActorImageURL: req.ActorImageURL,
			CharacterName: req.CharacterName,
		}
		castMembers = append(castMembers, cast)
	}

	if err := s.repo.BulkCreate(movieID, castMembers); err != nil {
		return nil, err
	}

	return castMembers, nil
}
