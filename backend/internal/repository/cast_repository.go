package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// CastRepository handles cast database operations
type CastRepository struct {
	db *sql.DB
}

// NewCastRepository creates a new cast repository
func NewCastRepository(db *sql.DB) *CastRepository {
	return &CastRepository{db: db}
}

// Create adds a cast member to a movie
func (r *CastRepository) Create(cast *domain.Cast) error {
	query := `
		INSERT INTO cast (movie_id, tmdb_id, actor_name, actor_image_url, character_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, cast.MovieID, cast.TMDBID, cast.ActorName, cast.ActorImageURL, cast.CharacterName).
		Scan(&cast.ID, &cast.CreatedAt, &cast.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value") {
			return errors.New("cast member with this TMDB ID already exists")
		}
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			return errors.New("movie not found")
		}
		return err
	}

	return nil
}

// GetByID retrieves a cast member by ID
func (r *CastRepository) GetByID(id int) (*domain.Cast, error) {
	query := `
		SELECT id, movie_id, tmdb_id, actor_name, actor_image_url, character_name, created_at, updated_at
		FROM cast
		WHERE id = $1
	`

	cast := &domain.Cast{}
	err := r.db.QueryRow(query, id).
		Scan(&cast.ID, &cast.MovieID, &cast.TMDBID, &cast.ActorName, &cast.ActorImageURL, &cast.CharacterName, &cast.CreatedAt, &cast.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("cast member not found")
		}
		return nil, err
	}

	return cast, nil
}

// List retrieves cast members for a movie
func (r *CastRepository) List(movieID int, page, limit int) ([]*domain.Cast, int, error) {
	// Get total count
	countQuery := "SELECT COUNT(*) FROM cast WHERE movie_id = $1"
	var total int
	err := r.db.QueryRow(countQuery, movieID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := `
		SELECT id, movie_id, tmdb_id, actor_name, actor_image_url, character_name, created_at, updated_at
		FROM cast
		WHERE movie_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, movieID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	castMembers := make([]*domain.Cast, 0)
	for rows.Next() {
		cast := &domain.Cast{}
		err := rows.Scan(&cast.ID, &cast.MovieID, &cast.TMDBID, &cast.ActorName, &cast.ActorImageURL, &cast.CharacterName, &cast.CreatedAt, &cast.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		castMembers = append(castMembers, cast)
	}

	return castMembers, total, nil
}

// Update updates a cast member
func (r *CastRepository) Update(id int, cast *domain.Cast) error {
	query := `
		UPDATE cast
		SET tmdb_id = COALESCE(NULLIF($1, 0), tmdb_id),
			actor_name = COALESCE(NULLIF($2, ''), actor_name),
			actor_image_url = COALESCE(NULLIF($3, ''), actor_image_url),
			character_name = COALESCE(NULLIF($4, ''), character_name),
			updated_at = NOW()
		WHERE id = $5
		RETURNING id, movie_id, created_at, updated_at
	`

	err := r.db.QueryRow(query, cast.TMDBID, cast.ActorName, cast.ActorImageURL, cast.CharacterName, id).
		Scan(&cast.ID, &cast.MovieID, &cast.CreatedAt, &cast.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("cast member not found")
		}
		if strings.Contains(err.Error(), "duplicate key value") {
			return errors.New("cast member with this TMDB ID already exists")
		}
		return err
	}

	cast.ID = id
	return nil
}

// Delete removes a cast member
func (r *CastRepository) Delete(id int) error {
	query := "DELETE FROM cast WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("cast member not found")
	}

	return nil
}

// BulkCreate adds multiple cast members to a movie
func (r *CastRepository) BulkCreate(movieID int, castMembers []*domain.Cast) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO cast (movie_id, tmdb_id, actor_name, actor_image_url, character_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	for _, cast := range castMembers {
		err := tx.QueryRow(query, movieID, cast.TMDBID, cast.ActorName, cast.ActorImageURL, cast.CharacterName).
			Scan(&cast.ID, &cast.CreatedAt, &cast.UpdatedAt)

		if err != nil {
			return err
		}
		cast.MovieID = movieID
	}

	return tx.Commit()
}
