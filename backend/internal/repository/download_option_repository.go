package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// DownloadOptionRepository handles download option database operations
type DownloadOptionRepository struct {
	db *sql.DB
}

// NewDownloadOptionRepository creates a new download option repository
func NewDownloadOptionRepository(db *sql.DB) *DownloadOptionRepository {
	return &DownloadOptionRepository{db: db}
}

// Create adds a download option to a movie
func (r *DownloadOptionRepository) Create(option *domain.DownloadOption) error {
	query := `
		INSERT INTO movie_download_options (movie_id, download_option, download_option_url, download_option_type, file_size, video_quality, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, option.MovieID, option.DownloadOption, option.DownloadOptionURL, option.DownloadOptionType, option.FileSize, option.VideoQuality).
		Scan(&option.ID, &option.CreatedAt, &option.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			return errors.New("movie not found")
		}
		return err
	}

	return nil
}

// GetByID retrieves a download option by ID
func (r *DownloadOptionRepository) GetByID(id int) (*domain.DownloadOption, error) {
	query := `
		SELECT id, movie_id, download_option, download_option_url, download_option_type, file_size, video_quality, created_at, updated_at
		FROM movie_download_options
		WHERE id = $1
	`

	option := &domain.DownloadOption{}
	err := r.db.QueryRow(query, id).
		Scan(&option.ID, &option.MovieID, &option.DownloadOption, &option.DownloadOptionURL, &option.DownloadOptionType, &option.FileSize, &option.VideoQuality, &option.CreatedAt, &option.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("download option not found")
		}
		return nil, err
	}

	return option, nil
}

// List retrieves download options for a movie
func (r *DownloadOptionRepository) List(movieID int, page, limit int, videoQuality, downloadType string) ([]*domain.DownloadOption, int, error) {
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

	if downloadType != "" {
		whereClause += " AND download_option_type = $" + string(rune(48+argIndex))
		countArgs = append(countArgs, downloadType)
		queryArgs = append(queryArgs, downloadType)
		argIndex++
	}

	// Get total count
	countQuery := "SELECT COUNT(*) FROM movie_download_options " + whereClause
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
		SELECT id, movie_id, download_option, download_option_url, download_option_type, file_size, video_quality, created_at, updated_at
		FROM movie_download_options
		` + whereClause + `
		ORDER BY created_at DESC
		LIMIT $` + limitParam + ` OFFSET $` + offsetParam

	queryArgs = append(queryArgs, limit, offset)

	rows, err := r.db.Query(query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	options := make([]*domain.DownloadOption, 0)
	for rows.Next() {
		option := &domain.DownloadOption{}
		err := rows.Scan(&option.ID, &option.MovieID, &option.DownloadOption, &option.DownloadOptionURL, &option.DownloadOptionType, &option.FileSize, &option.VideoQuality, &option.CreatedAt, &option.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		options = append(options, option)
	}

	return options, total, nil
}

// Update updates a download option
func (r *DownloadOptionRepository) Update(id int, option *domain.DownloadOption) error {
	query := `
		UPDATE movie_download_options
		SET download_option = COALESCE(NULLIF($1, ''), download_option),
			download_option_url = COALESCE(NULLIF($2, ''), download_option_url),
			download_option_type = COALESCE(NULLIF($3, ''), download_option_type),
			file_size = COALESCE(NULLIF($4, ''), file_size),
			video_quality = COALESCE(NULLIF($5, ''), video_quality),
			updated_at = NOW()
		WHERE id = $6
		RETURNING id, movie_id, created_at, updated_at
	`

	err := r.db.QueryRow(query, option.DownloadOption, option.DownloadOptionURL, option.DownloadOptionType, option.FileSize, option.VideoQuality, id).
		Scan(&option.ID, &option.MovieID, &option.CreatedAt, &option.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("download option not found")
		}
		return err
	}

	option.ID = id
	return nil
}

// Delete removes a download option
func (r *DownloadOptionRepository) Delete(id int) error {
	query := "DELETE FROM movie_download_options WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("download option not found")
	}

	return nil
}

// BulkCreate adds multiple download options to a movie
func (r *DownloadOptionRepository) BulkCreate(movieID int, options []*domain.DownloadOption) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO movie_download_options (movie_id, download_option, download_option_url, download_option_type, file_size, video_quality, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	for _, option := range options {
		err := tx.QueryRow(query, movieID, option.DownloadOption, option.DownloadOptionURL, option.DownloadOptionType, option.FileSize, option.VideoQuality).
			Scan(&option.ID, &option.CreatedAt, &option.UpdatedAt)

		if err != nil {
			return err
		}
		option.MovieID = movieID
	}

	return tx.Commit()
}
