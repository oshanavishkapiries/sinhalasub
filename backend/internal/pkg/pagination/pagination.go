package pagination

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type Params struct {
	Page      int
	PerPage   int
	SortBy    string
	SortOrder string
}

type Options struct {
	DefaultPage    int
	DefaultPerPage int
	MaxPerPage     int
	DefaultSortBy  string
	AllowedSortBy  map[string]struct{}
}

type Meta struct {
	Page       int  `json:"page"`
	PerPage    int  `json:"per_page"`
	TotalItems int  `json:"total_items"`
	TotalPages int  `json:"total_pages"`
	HasNext    bool `json:"has_next"`
	HasPrev    bool `json:"has_prev"`
}

func ParseRequest(r *http.Request, opts Options) (Params, error) {
	q := r.URL.Query()

	page := parsePositiveInt(q.Get("page"), opts.DefaultPage)
	perPage := parsePositiveInt(q.Get("per_page"), opts.DefaultPerPage)
	if opts.MaxPerPage > 0 && perPage > opts.MaxPerPage {
		perPage = opts.MaxPerPage
	}

	sortBy := strings.TrimSpace(q.Get("sort_by"))
	if sortBy == "" {
		sortBy = opts.DefaultSortBy
	}
	if len(opts.AllowedSortBy) > 0 {
		if _, ok := opts.AllowedSortBy[sortBy]; !ok {
			return Params{}, fmt.Errorf("invalid sort_by")
		}
	}

	sortOrder := strings.ToLower(strings.TrimSpace(q.Get("sort_order")))
	if sortOrder == "" {
		sortOrder = "desc"
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return Params{}, fmt.Errorf("invalid sort_order")
	}

	return Params{
		Page:      page,
		PerPage:   perPage,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}, nil
}

func (p Params) Offset() int {
	return (p.Page - 1) * p.PerPage
}

func NewMeta(page, perPage, totalItems int) Meta {
	totalPages := 0
	if perPage > 0 {
		totalPages = (totalItems + perPage - 1) / perPage
	}

	return Meta{
		Page:       page,
		PerPage:    perPage,
		TotalItems: totalItems,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1 && totalPages > 0,
	}
}

func parsePositiveInt(raw string, fallback int) int {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return fallback
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}
