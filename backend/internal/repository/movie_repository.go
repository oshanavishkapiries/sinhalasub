package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// MovieRepository handles movie database operations
type MovieRepository struct {
	db *sql.DB
}

// NewMovieRepository creates a new movie repository
func NewMovieRepository(db *sql.DB) *MovieRepository {
	return &MovieRepository{db: db}
}

// Create creates a new movie
func (r *MovieRepository) Create(movie *domain.Movie) error {
	query := `
		INSERT INTO movies (title, slug, rating, release_date, poster_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, movie.Title, movie.Slug, movie.Rating, movie.ReleaseDate, movie.PosterURL).
		Scan(&movie.ID, &movie.CreatedAt, &movie.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value") {
			return errors.New("slug already exists")
		}
		return err
	}

	return nil
}

// GetByID retrieves a movie by ID
func (r *MovieRepository) GetByID(id int) (*domain.Movie, error) {
	query := `
		SELECT id, title, slug, rating, release_date, poster_url, created_at, updated_at
		FROM movies
		WHERE id = $1
	`

	movie := &domain.Movie{}
	err := r.db.QueryRow(query, id).
		Scan(&movie.ID, &movie.Title, &movie.Slug, &movie.Rating, &movie.ReleaseDate, &movie.PosterURL, &movie.CreatedAt, &movie.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("movie not found")
		}
		return nil, err
	}

	return movie, nil
}

// GetBySlug retrieves a movie by slug
func (r *MovieRepository) GetBySlug(slug string) (*domain.Movie, error) {
	query := `
		SELECT id, title, slug, rating, release_date, poster_url, created_at, updated_at
		FROM movies
		WHERE slug = $1
	`

	movie := &domain.Movie{}
	err := r.db.QueryRow(query, slug).
		Scan(&movie.ID, &movie.Title, &movie.Slug, &movie.Rating, &movie.ReleaseDate, &movie.PosterURL, &movie.CreatedAt, &movie.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("movie not found")
		}
		return nil, err
	}

	return movie, nil
}

// List retrieves paginated movies with filtering and sorting
func (r *MovieRepository) List(page, limit int, filters map[string]interface{}) ([]*domain.Movie, int, error) {
	// Build where clause
	whereConditions := []string{}
	args := []interface{}{}
	argIndex := 1

	if search, ok := filters["search"].(string); ok && search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("title ILIKE $%d", argIndex))
		args = append(args, "%"+search+"%")
		argIndex++
	}

	if slug, ok := filters["slug"].(string); ok && slug != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("slug = $%d", argIndex))
		args = append(args, slug)
		argIndex++
	}

	if ratingMin, ok := filters["rating_min"].(float32); ok && ratingMin > 0 {
		whereConditions = append(whereConditions, fmt.Sprintf("rating >= $%d", argIndex))
		args = append(args, ratingMin)
		argIndex++
	}

	if ratingMax, ok := filters["rating_max"].(float32); ok && ratingMax > 0 {
		whereConditions = append(whereConditions, fmt.Sprintf("rating <= $%d", argIndex))
		args = append(args, ratingMax)
		argIndex++
	}

	if releaseYear, ok := filters["release_year"].(int); ok && releaseYear > 0 {
		whereConditions = append(whereConditions, fmt.Sprintf("EXTRACT(YEAR FROM release_date) = $%d", argIndex))
		args = append(args, releaseYear)
		argIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM movies %s", whereClause)
	var total int
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Build sorting
	sortBy := "release_date"
	if s, ok := filters["sort_by"].(string); ok && s != "" {
		validSortFields := map[string]bool{"title": true, "rating": true, "release_date": true}
		if validSortFields[s] {
			sortBy = s
		}
	}

	sortOrder := "DESC"
	if order, ok := filters["sort_order"].(string); ok && strings.ToUpper(order) == "ASC" {
		sortOrder = "ASC"
	}

	// Pagination
	offset := (page - 1) * limit
	args = append(args, limit, offset)

	query := fmt.Sprintf(`
		SELECT id, title, slug, rating, release_date, poster_url, created_at, updated_at
		FROM movies
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argIndex, argIndex+1)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	movies := make([]*domain.Movie, 0)
	for rows.Next() {
		movie := &domain.Movie{}
		err := rows.Scan(&movie.ID, &movie.Title, &movie.Slug, &movie.Rating, &movie.ReleaseDate, &movie.PosterURL, &movie.CreatedAt, &movie.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		movies = append(movies, movie)
	}

	return movies, total, nil
}

// Update updates a movie
func (r *MovieRepository) Update(id int, movie *domain.Movie) error {
	query := `
		UPDATE movies
		SET title = COALESCE(NULLIF($1, ''), title),
			slug = COALESCE(NULLIF($2, ''), slug),
			rating = COALESCE($3, rating),
			release_date = COALESCE($4, release_date),
			poster_url = COALESCE(NULLIF($5, ''), poster_url),
			updated_at = NOW()
		WHERE id = $6
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, movie.Title, movie.Slug, movie.Rating, movie.ReleaseDate, movie.PosterURL, id).
		Scan(&movie.ID, &movie.CreatedAt, &movie.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("movie not found")
		}
		if strings.Contains(err.Error(), "duplicate key value") {
			return errors.New("slug already exists")
		}
		return err
	}

	movie.ID = id
	return nil
}

// Delete deletes a movie
func (r *MovieRepository) Delete(id int) error {
	query := "DELETE FROM movies WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("movie not found")
	}

	return nil
}

// BulkCreate creates multiple movies
func (r *MovieRepository) BulkCreate(movies []*domain.Movie) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, movie := range movies {
		query := `
			INSERT INTO movies (title, slug, rating, release_date, poster_url, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
			RETURNING id, created_at, updated_at
		`

		err := tx.QueryRow(query, movie.Title, movie.Slug, movie.Rating, movie.ReleaseDate, movie.PosterURL).
			Scan(&movie.ID, &movie.CreatedAt, &movie.UpdatedAt)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// SlugExists checks if a slug already exists
func (r *MovieRepository) SlugExists(slug string) (bool, error) {
	query := "SELECT EXISTS(SELECT 1 FROM movies WHERE slug = $1)"
	var exists bool
	err := r.db.QueryRow(query, slug).Scan(&exists)
	return exists, err
}
