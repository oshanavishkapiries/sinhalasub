package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// PlayerProviderRepository handles player provider database operations
type PlayerProviderRepository struct {
	db *sql.DB
}

// NewPlayerProviderRepository creates a new player provider repository
func NewPlayerProviderRepository(db *sql.DB) *PlayerProviderRepository {
	return &PlayerProviderRepository{db: db}
}

// Create adds a player provider to a movie
func (r *PlayerProviderRepository) Create(provider *domain.PlayerProvider) error {
	query := `
		INSERT INTO movie_player_providers (movie_id, player_provider, player_provider_url, player_provider_type, video_quality, is_default, is_ads_available, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, provider.MovieID, provider.PlayerProvider, provider.PlayerProviderURL, provider.PlayerProviderType, provider.VideoQuality, provider.IsDefault, provider.IsAdsAvailable).
		Scan(&provider.ID, &provider.CreatedAt, &provider.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			return errors.New("movie not found")
		}
		return err
	}

	return nil
}

// GetByID retrieves a player provider by ID
func (r *PlayerProviderRepository) GetByID(id int) (*domain.PlayerProvider, error) {
	query := `
		SELECT id, movie_id, player_provider, player_provider_url, player_provider_type, video_quality, is_default, is_ads_available, created_at, updated_at
		FROM movie_player_providers
		WHERE id = $1
	`

	provider := &domain.PlayerProvider{}
	err := r.db.QueryRow(query, id).
		Scan(&provider.ID, &provider.MovieID, &provider.PlayerProvider, &provider.PlayerProviderURL, &provider.PlayerProviderType, &provider.VideoQuality, &provider.IsDefault, &provider.IsAdsAvailable, &provider.CreatedAt, &provider.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("player provider not found")
		}
		return nil, err
	}

	return provider, nil
}

// List retrieves player providers for a movie
func (r *PlayerProviderRepository) List(movieID int, page, limit int, videoQuality string, isDefault *bool) ([]*domain.PlayerProvider, int, error) {
	whereClause := "WHERE movie_id = $1"
	var countArgs []interface{}
	var queryArgs []interface{}

	countArgs = append(countArgs, movieID)
	queryArgs = append(queryArgs, movieID)

	argIndex := 2

	if videoQuality != "" {
		whereClause += " AND video_quality = $" + string(rune(48+argIndex))
		countArgs = append(countArgs, videoQuality)
		queryArgs = append(queryArgs, videoQuality)
		argIndex++
	}

	if isDefault != nil {
		whereClause += " AND is_default = $" + string(rune(48+argIndex))
		countArgs = append(countArgs, *isDefault)
		queryArgs = append(queryArgs, *isDefault)
		argIndex++
	}

	// Get total count
	countQuery := "SELECT COUNT(*) FROM movie_player_providers " + whereClause
	var total int
	err := r.db.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * limit
	limitParam := string(rune(48 + argIndex))
	offsetParam := string(rune(48 + argIndex + 1))

	query := `
		SELECT id, movie_id, player_provider, player_provider_url, player_provider_type, video_quality, is_default, is_ads_available, created_at, updated_at
		FROM movie_player_providers
		` + whereClause + `
		ORDER BY created_at DESC
		LIMIT $` + limitParam + ` OFFSET $` + offsetParam

	queryArgs = append(queryArgs, limit, offset)

	rows, err := r.db.Query(query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	providers := make([]*domain.PlayerProvider, 0)
	for rows.Next() {
		provider := &domain.PlayerProvider{}
		err := rows.Scan(&provider.ID, &provider.MovieID, &provider.PlayerProvider, &provider.PlayerProviderURL, &provider.PlayerProviderType, &provider.VideoQuality, &provider.IsDefault, &provider.IsAdsAvailable, &provider.CreatedAt, &provider.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		providers = append(providers, provider)
	}

	return providers, total, nil
}

// Update updates a player provider
func (r *PlayerProviderRepository) Update(id int, provider *domain.PlayerProvider) error {
	query := `
		UPDATE movie_player_providers
		SET player_provider = COALESCE(NULLIF($1, ''), player_provider),
			player_provider_url = COALESCE(NULLIF($2, ''), player_provider_url),
			player_provider_type = COALESCE(NULLIF($3, ''), player_provider_type),
			video_quality = COALESCE(NULLIF($4, ''), video_quality),
			is_default = COALESCE($5, is_default),
			is_ads_available = COALESCE($6, is_ads_available),
			updated_at = NOW()
		WHERE id = $7
		RETURNING id, movie_id, created_at, updated_at
	`

	err := r.db.QueryRow(query, provider.PlayerProvider, provider.PlayerProviderURL, provider.PlayerProviderType, provider.VideoQuality, provider.IsDefault, provider.IsAdsAvailable, id).
		Scan(&provider.ID, &provider.MovieID, &provider.CreatedAt, &provider.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("player provider not found")
		}
		return err
	}

	provider.ID = id
	return nil
}

// Delete removes a player provider
func (r *PlayerProviderRepository) Delete(id int) error {
	query := "DELETE FROM movie_player_providers WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("player provider not found")
	}

	return nil
}

// BulkCreate adds multiple player providers to a movie
func (r *PlayerProviderRepository) BulkCreate(movieID int, providers []*domain.PlayerProvider) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO movie_player_providers (movie_id, player_provider, player_provider_url, player_provider_type, video_quality, is_default, is_ads_available, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	for _, provider := range providers {
		err := tx.QueryRow(query, movieID, provider.PlayerProvider, provider.PlayerProviderURL, provider.PlayerProviderType, provider.VideoQuality, provider.IsDefault, provider.IsAdsAvailable).
			Scan(&provider.ID, &provider.CreatedAt, &provider.UpdatedAt)

		if err != nil {
			return err
		}
		provider.MovieID = movieID
	}

	return tx.Commit()
}
