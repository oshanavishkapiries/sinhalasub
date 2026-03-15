package repository

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/domain"
)

// MovieCategoryRepository handles movie-category relationships
type MovieCategoryRepository struct {
	db *sql.DB
}

// NewMovieCategoryRepository creates a new movie category repository
func NewMovieCategoryRepository(db *sql.DB) *MovieCategoryRepository {
	return &MovieCategoryRepository{db: db}
}

// Add adds a category to a movie
func (r *MovieCategoryRepository) Add(movieID int, category *domain.MovieCategory) error {
	query := `
		INSERT INTO movie_categories (movie_id, category_id, category_name, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(query, movieID, category.CategoryID, category.CategoryName).
		Scan(&category.ID, &category.CreatedAt, &category.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value") {
			return errors.New("category already added to this movie")
		}
		if strings.Contains(err.Error(), "violates foreign key constraint") {
			return errors.New("movie not found")
		}
		return err
	}

	category.ID = category.ID
	category.MovieID = movieID
	return nil
}

// List retrieves categories for a movie
func (r *MovieCategoryRepository) List(movieID int, page, limit int) ([]*domain.MovieCategory, int, error) {
	// Get total count
	countQuery := "SELECT COUNT(*) FROM movie_categories WHERE movie_id = $1"
	var total int
	err := r.db.QueryRow(countQuery, movieID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * limit
	query := `
		SELECT id, movie_id, category_id, category_name, created_at, updated_at
		FROM movie_categories
		WHERE movie_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, movieID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	categories := make([]*domain.MovieCategory, 0)
	for rows.Next() {
		category := &domain.MovieCategory{}
		err := rows.Scan(&category.ID, &category.MovieID, &category.CategoryID, &category.CategoryName, &category.CreatedAt, &category.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		categories = append(categories, category)
	}

	return categories, total, nil
}

// Delete removes a category from a movie
func (r *MovieCategoryRepository) Delete(movieID, categoryID int) error {
	query := "DELETE FROM movie_categories WHERE movie_id = $1 AND category_id = $2"
	result, err := r.db.Exec(query, movieID, categoryID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("category not found for this movie")
	}

	return nil
}

// BulkAdd adds multiple categories to a movie
func (r *MovieCategoryRepository) BulkAdd(movieID int, categories []*domain.MovieCategory) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO movie_categories (movie_id, category_id, category_name, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	for _, category := range categories {
		err := tx.QueryRow(query, movieID, category.CategoryID, category.CategoryName).
			Scan(&category.ID, &category.CreatedAt, &category.UpdatedAt)

		if err != nil {
			return err
		}
		category.MovieID = movieID
	}

	return tx.Commit()
}
