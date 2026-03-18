package domain

import "time"

// Movie represents a movie entity
type Movie struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Rating      *float32   `json:"rating"`
	ReleaseDate *time.Time `json:"release_date"`
	PosterURL   string     `json:"poster_url"`
	Overview    string     `json:"overview"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// CreateMovieRequest represents the request to create a movie
type CreateMovieRequest struct {
	Title       string   `json:"title" binding:"required"`
	Slug        string   `json:"slug"`
	Rating      *float32 `json:"rating"`
	ReleaseDate string   `json:"release_date"`
	PosterURL   string   `json:"poster_url"`
	Overview    string   `json:"overview"`
}

// UpdateMovieRequest represents the request to update a movie
type UpdateMovieRequest struct {
	Title       string   `json:"title"`
	Slug        string   `json:"slug"`
	Rating      *float32 `json:"rating"`
	ReleaseDate string   `json:"release_date"`
	PosterURL   string   `json:"poster_url"`
	Overview    string   `json:"overview"`
}

// BulkCreateMoviesRequest represents bulk create request
type BulkCreateMoviesRequest struct {
	Movies []CreateMovieRequest `json:"movies" binding:"required"`
}

// BulkUpdateMoviesRequest represents bulk update request
type BulkUpdateMoviesRequest struct {
	Movies []BulkUpdateMovieItem `json:"movies" binding:"required"`
}

// BulkUpdateMovieItem represents a single movie to update in bulk
type BulkUpdateMovieItem struct {
	ID          int        `json:"id" binding:"required"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Rating      *float32   `json:"rating"`
	ReleaseDate *time.Time `json:"release_date"`
	PosterURL   string     `json:"poster_url"`
}

// MovieCategory represents a movie-category relationship
type MovieCategory struct {
	ID           int       `json:"id"`
	MovieID      int       `json:"movie_id"`
	CategoryID   int       `json:"category_id"`
	CategoryName string    `json:"category_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// AddCategoryRequest represents request to add category to movie
type AddCategoryRequest struct {
	CategoryID   int    `json:"category_id" binding:"required"`
	CategoryName string `json:"category_name" binding:"required"`
}

// BulkAddCategoriesRequest represents bulk add categories request
type BulkAddCategoriesRequest struct {
	Categories []AddCategoryRequest `json:"categories" binding:"required"`
}

// Cast represents a cast member
type Cast struct {
	ID            int       `json:"id"`
	MovieID       int       `json:"movie_id"`
	TMDBID        int       `json:"tmdb_id"`
	ActorName     string    `json:"actor_name"`
	ActorImageURL string    `json:"actor_image_url"`
	CharacterName string    `json:"character_name"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// AddCastRequest represents request to add cast to movie
type AddCastRequest struct {
	TMDBID        int    `json:"tmdb_id" binding:"required"`
	ActorName     string `json:"actor_name" binding:"required"`
	ActorImageURL string `json:"actor_image_url"`
	CharacterName string `json:"character_name"`
}

// UpdateCastRequest represents request to update cast
type UpdateCastRequest struct {
	TMDBID        int    `json:"tmdb_id"`
	ActorName     string `json:"actor_name"`
	ActorImageURL string `json:"actor_image_url"`
	CharacterName string `json:"character_name"`
}

// BulkAddCastRequest represents bulk add cast request
type BulkAddCastRequest struct {
	Cast []AddCastRequest `json:"cast" binding:"required"`
}

// MovieDetail represents detailed information about a movie
type MovieDetail struct {
	ID          int       `json:"id"`
	MovieID     int       `json:"movie_id"`
	Overview    string    `json:"overview"`
	TMDBID      *int      `json:"tmdb_id"`
	IMDBID      string    `json:"imdb_id"`
	Adult       *bool     `json:"adult"`
	Language    string    `json:"language"`
	Duration    *int      `json:"duration"`
	BackdropURL string    `json:"backdrop_url"`
	TrailerURL  string    `json:"trailer_url"`
	Director    string    `json:"director"`
	Country     string    `json:"country"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateUpdateMovieDetailRequest represents request to create/update movie details
type CreateUpdateMovieDetailRequest struct {
	Overview    string `json:"overview"`
	TMDBID      *int   `json:"tmdb_id"`
	IMDBID      string `json:"imdb_id"`
	Adult       *bool  `json:"adult"`
	Language    string `json:"language"`
	Duration    *int   `json:"duration"`
	BackdropURL string `json:"backdrop_url"`
	TrailerURL  string `json:"trailer_url"`
	Director    string `json:"director"`
	Country     string `json:"country"`
}

// Subtitle represents a subtitle file
type Subtitle struct {
	ID             int       `json:"id"`
	MovieID        int       `json:"movie_id"`
	Language       string    `json:"language"`
	SubtitleURL    string    `json:"subtitle_url"`
	SubtitleAuthor string    `json:"subtitle_author"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// AddSubtitleRequest represents request to add subtitle to movie
type AddSubtitleRequest struct {
	Language       string `json:"language" binding:"required"`
	SubtitleURL    string `json:"subtitle_url" binding:"required"`
	SubtitleAuthor string `json:"subtitle_author"`
}

// UpdateSubtitleRequest represents request to update subtitle
type UpdateSubtitleRequest struct {
	Language       string `json:"language"`
	SubtitleURL    string `json:"subtitle_url"`
	SubtitleAuthor string `json:"subtitle_author"`
}

// BulkAddSubtitlesRequest represents bulk add subtitles request
type BulkAddSubtitlesRequest struct {
	Subtitles []AddSubtitleRequest `json:"subtitles" binding:"required"`
}

// PlayerProvider represents a video player provider
type PlayerProvider struct {
	ID                 int       `json:"id"`
	MovieID            int       `json:"movie_id"`
	PlayerProvider     string    `json:"player_provider"`
	PlayerProviderURL  string    `json:"player_provider_url"`
	PlayerProviderType string    `json:"player_provider_type"`
	VideoQuality       string    `json:"video_quality"`
	IsDefault          bool      `json:"is_default"`
	IsAdsAvailable     bool      `json:"is_ads_available"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// AddPlayerProviderRequest represents request to add player provider
type AddPlayerProviderRequest struct {
	PlayerProvider     string `json:"player_provider" binding:"required"`
	PlayerProviderURL  string `json:"player_provider_url" binding:"required"`
	PlayerProviderType string `json:"player_provider_type"`
	VideoQuality       string `json:"video_quality"`
	IsDefault          bool   `json:"is_default"`
	IsAdsAvailable     bool   `json:"is_ads_available"`
}

// UpdatePlayerProviderRequest represents request to update player provider
type UpdatePlayerProviderRequest struct {
	PlayerProvider     string `json:"player_provider"`
	PlayerProviderURL  string `json:"player_provider_url"`
	PlayerProviderType string `json:"player_provider_type"`
	VideoQuality       string `json:"video_quality"`
	IsDefault          *bool  `json:"is_default"`
	IsAdsAvailable     *bool  `json:"is_ads_available"`
}

// BulkAddPlayerProvidersRequest represents bulk add player providers request
type BulkAddPlayerProvidersRequest struct {
	Players []AddPlayerProviderRequest `json:"players" binding:"required"`
}

// DownloadOption represents a download option for a movie
type DownloadOption struct {
	ID                 int       `json:"id"`
	MovieID            int       `json:"movie_id"`
	DownloadOption     string    `json:"download_option"`
	DownloadOptionURL  string    `json:"download_option_url"`
	DownloadOptionType string    `json:"download_option_type"`
	FileSize           string    `json:"file_size"`
	VideoQuality       string    `json:"video_quality"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// AddDownloadOptionRequest represents request to add download option
type AddDownloadOptionRequest struct {
	DownloadOption     string `json:"download_option" binding:"required"`
	DownloadOptionURL  string `json:"download_option_url" binding:"required"`
	DownloadOptionType string `json:"download_option_type"`
	FileSize           string `json:"file_size"`
	VideoQuality       string `json:"video_quality"`
}

// UpdateDownloadOptionRequest represents request to update download option
type UpdateDownloadOptionRequest struct {
	DownloadOption     string `json:"download_option"`
	DownloadOptionURL  string `json:"download_option_url"`
	DownloadOptionType string `json:"download_option_type"`
	FileSize           string `json:"file_size"`
	VideoQuality       string `json:"video_quality"`
}

// BulkAddDownloadOptionsRequest represents bulk add download options request
type BulkAddDownloadOptionsRequest struct {
	Downloads []AddDownloadOptionRequest `json:"downloads" binding:"required"`
}
