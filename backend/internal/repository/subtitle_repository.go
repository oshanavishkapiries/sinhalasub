package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// SubtitleRepository handles subtitle database operations
type SubtitleRepository struct {
	db *sql.DB
}

// NewSubtitleRepository creates a new subtitle repository
func NewSubtitleRepository(db *sql.DB) *SubtitleRepository {
	return &SubtitleRepository{db: db}
}

// Create adds a subtitle to a movie
func (r *SubtitleRepository) Create(subtitle *domain.Subtitle) error {
	query := `
		INSERT INTO movie_subtitles (movie_id, language, subtitle_url, subtitle_author, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, subtitle.MovieID, subtitle.Language, subtitle.SubtitleURL, subtitle.SubtitleAuthor).
		Scan(&subtitle.ID, &subtitle.CreatedAt, &subtitle.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			return errors.New("movie not found")
		}
		return err
	}

	return nil
}

// GetByID retrieves a subtitle by ID
func (r *SubtitleRepository) GetByID(id int) (*domain.Subtitle, error) {
	query := `
		SELECT id, movie_id, language, subtitle_url, subtitle_author, created_at, updated_at
		FROM movie_subtitles
		WHERE id = $1
	`

	subtitle := &domain.Subtitle{}
	err := r.db.QueryRow(query, id).
		Scan(&subtitle.ID, &subtitle.MovieID, &subtitle.Language, &subtitle.SubtitleURL, &subtitle.SubtitleAuthor, &subtitle.CreatedAt, &subtitle.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("subtitle not found")
		}
		return nil, err
	}

	return subtitle, nil
}

// List retrieves subtitles for a movie
func (r *SubtitleRepository) List(movieID int, page, limit int, language string) ([]*domain.Subtitle, int, error) {
	whereClause := "WHERE movie_id = $1"
	var countArgs []interface{}
	var queryArgs []interface{}

	countArgs = append(countArgs, movieID)
	queryArgs = append(queryArgs, movieID)

	if language != "" {
		whereClause += " AND language = $2"
		countArgs = append(countArgs, language)
		queryArgs = append(queryArgs, language)
	}

	// Get total count
	countQuery := "SELECT COUNT(*) FROM movie_subtitles " + whereClause
	var total int
	err := r.db.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * limit
	paramIndex := 2
	if language != "" {
		paramIndex = 3
	}

	query := `
		SELECT id, movie_id, language, subtitle_url, subtitle_author, created_at, updated_at
		FROM movie_subtitles
		` + whereClause + `
		ORDER BY created_at DESC
		LIMIT $` + string(rune(paramIndex+1)) + ` OFFSET $` + string(rune(paramIndex+2))

	queryArgs = append(queryArgs, limit, offset)

	rows, err := r.db.Query(query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	subtitles := make([]*domain.Subtitle, 0)
	for rows.Next() {
		subtitle := &domain.Subtitle{}
		err := rows.Scan(&subtitle.ID, &subtitle.MovieID, &subtitle.Language, &subtitle.SubtitleURL, &subtitle.SubtitleAuthor, &subtitle.CreatedAt, &subtitle.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		subtitles = append(subtitles, subtitle)
	}

	return subtitles, total, nil
}

// Update updates a subtitle
func (r *SubtitleRepository) Update(id int, subtitle *domain.Subtitle) error {
	query := `
		UPDATE movie_subtitles
		SET language = COALESCE(NULLIF($1, ''), language),
			subtitle_url = COALESCE(NULLIF($2, ''), subtitle_url),
			subtitle_author = COALESCE(NULLIF($3, ''), subtitle_author),
			updated_at = NOW()
		WHERE id = $4
		RETURNING id, movie_id, created_at, updated_at
	`

	err := r.db.QueryRow(query, subtitle.Language, subtitle.SubtitleURL, subtitle.SubtitleAuthor, id).
		Scan(&subtitle.ID, &subtitle.MovieID, &subtitle.CreatedAt, &subtitle.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("subtitle not found")
		}
		return err
	}

	subtitle.ID = id
	return nil
}

// Delete removes a subtitle
func (r *SubtitleRepository) Delete(id int) error {
	query := "DELETE FROM movie_subtitles WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("subtitle not found")
	}

	return nil
}

// BulkCreate adds multiple subtitles to a movie
func (r *SubtitleRepository) BulkCreate(movieID int, subtitles []*domain.Subtitle) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO movie_subtitles (movie_id, language, subtitle_url, subtitle_author, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	for _, subtitle := range subtitles {
		err := tx.QueryRow(query, movieID, subtitle.Language, subtitle.SubtitleURL, subtitle.SubtitleAuthor).
			Scan(&subtitle.ID, &subtitle.CreatedAt, &subtitle.UpdatedAt)

		if err != nil {
			return err
		}
		subtitle.MovieID = movieID
	}

	return tx.Commit()
}
