===== TV SERIES DETAILS =====

{
  "table": "tv_shows",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true, "form_field": "number", "required": true },
    { "name": "tmdb_id", "db_type": "INTEGER", "form_field": "number", "required": true },
    { "name": "name", "db_type": "VARCHAR(255)", "form_field": "text", "required": true },
    { "name": "original_name", "db_type": "VARCHAR(255)", "form_field": "text" },
    { "name": "overview", "db_type": "TEXT", "form_field": "textarea" },
    { "name": "tagline", "db_type": "VARCHAR(255)", "form_field": "text" },
    { "name": "homepage", "db_type": "VARCHAR(255)", "form_field": "url" },
    { "name": "poster_path", "db_type": "VARCHAR(255)", "form_field": "file" },
    { "name": "backdrop_path", "db_type": "VARCHAR(255)", "form_field": "file" },
    { "name": "first_air_date", "db_type": "DATE", "form_field": "date" },
    { "name": "last_air_date", "db_type": "DATE", "form_field": "date" },
    { "name": "status", "db_type": "VARCHAR(50)", "form_field": "select" },
    { "name": "type", "db_type": "VARCHAR(50)", "form_field": "text" },
    { "name": "original_language", "db_type": "VARCHAR(10)", "form_field": "text" },
    { "name": "adult", "db_type": "BOOLEAN", "form_field": "checkbox" },
    { "name": "in_production", "db_type": "BOOLEAN", "form_field": "checkbox" },
    { "name": "popularity", "db_type": "FLOAT", "form_field": "number" },
    { "name": "vote_average", "db_type": "FLOAT", "form_field": "number" },
    { "name": "vote_count", "db_type": "INTEGER", "form_field": "number" },
    { "name": "number_of_episodes", "db_type": "INTEGER", "form_field": "number" },
    { "name": "number_of_seasons", "db_type": "INTEGER", "form_field": "number" },
    { "name": "media_type", "db_type": "VARCHAR(20)", "form_field": "select" }
    { "name": "trailer_link", "db_type": "VARCHAR(255)", "form_field": "url" },
    { "name": "imdb_id", "db_type": "VARCHAR(20)", "form_field": "text" },
  ]
}

{
  "table": "genres",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true, "form_field": "number" },
    { "name": "name", "db_type": "VARCHAR(100)", "form_field": "text" }
  ]
}

{
  "table": "seasons",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true, "form_field": "hidden" },
    { "name": "tv_show_id", "db_type": "INTEGER", "foreign_key": "tv_shows.id", "form_field": "select" },
    { "name": "season_number", "db_type": "INTEGER", "form_field": "number", "required": true },
    { "name": "title", "db_type": "VARCHAR(255)", "form_field": "text" },
    { "name": "episode_count", "db_type": "INTEGER", "form_field": "number" },
    { "name": "poster", "db_type": "VARCHAR(255)", "form_field": "file" }
  ]
}

{
  "table": "episodes",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true, "form_field": "hidden" },
    { "name": "season_id", "db_type": "INTEGER", "foreign_key": "seasons.id", "form_field": "select" },
    { "name": "episode_number", "db_type": "INTEGER", "form_field": "number", "required": true },
    { "name": "title", "db_type": "VARCHAR(255)", "form_field": "text" },
    { "name": "overview", "db_type": "TEXT", "form_field": "textarea" },
    { "name": "thumbnail", "db_type": "VARCHAR(255)", "form_field": "file" }
  ]
}

{
  "table": "stream_providers",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true, "form_field": "hidden" },
    { "name": "name", "db_type": "VARCHAR(255)", "form_field": "text" },
    { "name": "has_ads", "db_type": "BOOLEAN", "form_field": "checkbox" }
  ]
}

{
  "table": "episode_stream_links",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true },
    { "name": "episode_id", "db_type": "INTEGER", "foreign_key": "episodes.id", "form_field": "select" },
    { "name": "provider_id", "db_type": "INTEGER", "foreign_key": "stream_providers.id", "form_field": "select" },
    { "name": "stream_url", "db_type": "TEXT", "form_field": "url" }
    { "name": "player_type", "db_type": "VARCHAR(50)", "form_field": "select" }
  ]
}

{
  "table": "download_providers",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true },
    { "name": "name", "db_type": "VARCHAR(255)", "form_field": "text" }
  ]
}

{
  "table": "episode_downloads",
  "fields": [
    { "name": "id", "db_type": "INTEGER", "primary_key": true },
    { "name": "episode_id", "db_type": "INTEGER", "foreign_key": "episodes.id", "form_field": "select" },
    { "name": "provider_id", "db_type": "INTEGER", "foreign_key": "download_providers.id", "form_field": "select" },
    { "name": "quality", "db_type": "VARCHAR(50)", "form_field": "select" },
    { "name": "file_size", "db_type": "VARCHAR(50)", "form_field": "text" },
    { "name": "download_url", "db_type": "TEXT", "form_field": "url" }
  ]
}

TV_SHOWS
   │
   └── SEASONS
         │
         └── EPISODES
                │
                ├── STREAM_LINKS → STREAM_PROVIDERS
                │
                └── DOWNLOADS → DOWNLOAD_PROVIDERS
