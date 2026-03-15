package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// MovieDetailRepository handles movie details database operations
type MovieDetailRepository struct {
	db *sql.DB
}

// NewMovieDetailRepository creates a new movie detail repository
func NewMovieDetailRepository(db *sql.DB) *MovieDetailRepository {
	return &MovieDetailRepository{db: db}
}

// GetByMovieID retrieves movie details for a specific movie
func (r *MovieDetailRepository) GetByMovieID(movieID int) (*domain.MovieDetail, error) {
	query := `
		SELECT id, movie_id, overview, tmdb_id, imdb_id, adult, language, duration, backdrop_url, trailer_url, director, country, created_at, updated_at
		FROM movie_details
		WHERE movie_id = $1
	`

	detail := &domain.MovieDetail{}
	err := r.db.QueryRow(query, movieID).
		Scan(&detail.ID, &detail.MovieID, &detail.Overview, &detail.TMDBID, &detail.IMDBID, &detail.Adult, &detail.Language, &detail.Duration, &detail.BackdropURL, &detail.TrailerURL, &detail.Director, &detail.Country, &detail.CreatedAt, &detail.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("movie detail not found")
		}
		return nil, err
	}

	return detail, nil
}

// CreateOrUpdate creates or updates movie details
func (r *MovieDetailRepository) CreateOrUpdate(detail *domain.MovieDetail) error {
	query := `
		INSERT INTO movie_details (movie_id, overview, tmdb_id, imdb_id, adult, language, duration, backdrop_url, trailer_url, director, country, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		ON CONFLICT (movie_id) DO UPDATE SET
			overview = COALESCE(NULLIF($2, ''), movie_details.overview),
			tmdb_id = COALESCE($3, movie_details.tmdb_id),
			imdb_id = COALESCE(NULLIF($4, ''), movie_details.imdb_id),
			adult = COALESCE($5, movie_details.adult),
			language = COALESCE(NULLIF($6, ''), movie_details.language),
			duration = COALESCE($7, movie_details.duration),
			backdrop_url = COALESCE(NULLIF($8, ''), movie_details.backdrop_url),
			trailer_url = COALESCE(NULLIF($9, ''), movie_details.trailer_url),
			director = COALESCE(NULLIF($10, ''), movie_details.director),
			country = COALESCE(NULLIF($11, ''), movie_details.country),
			updated_at = NOW()
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, detail.MovieID, detail.Overview, detail.TMDBID, detail.IMDBID, detail.Adult, detail.Language, detail.Duration, detail.BackdropURL, detail.TrailerURL, detail.Director, detail.Country).
		Scan(&detail.ID, &detail.CreatedAt, &detail.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			return errors.New("movie not found")
		}
		return err
	}

	return nil
}
