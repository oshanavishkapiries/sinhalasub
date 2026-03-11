# Mock API Endpoints

This document lists all available mock endpoints in the MSW (Mock Service Worker) setup.

## Content Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trending/all/week` | GET | Get trending content for the week |
| `/api/movie/popular` | GET | Get popular movies |
| `/api/tv/popular` | GET | Get popular TV shows |
| `/api/movie/top_rated` | GET | Get top rated movies |
| `/api/tv/top_rated` | GET | Get top rated TV shows |
| `/api/movie/now_playing` | GET | Get now playing movies |

## Discover Endpoints

| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/api/movie/:category` | GET | Discover movies by category | `with_genres`, `with_original_language` |
| `/api/discover/tv` | GET | Discover TV shows | `with_genres`, `with_original_language`, `on_the_air` |
| `/api/tv/:category` | GET | Get TV shows by category | `with_genres`, `with_original_language` |
| `/api/tv/:tvId/season/:seasonNumber` | GET | Get TV season details | - |

**Categories:** `popular`, `top_rated`, `now_playing`, `upcoming`

## Details Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/movie/:id` | GET | Get movie details |
| `/api/tv/:id` | GET | Get TV show details |
| `/api/movie/:id/similar` | GET | Get similar movies |
| `/api/tv/:id/similar` | GET | Get similar TV shows |

## Search Endpoints

| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/api/search/multi` | GET | Search movies and TV shows | `query` |

## Genre Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/genre/movie/list` | GET | Get movie genres |
| `/api/genre/tv/list` | GET | Get TV genres |

## Configuration Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/configuration/languages` | GET | Get available languages |

## Variants

Each endpoint supports multiple variants (response modes):

- **`success`** - Returns mock data from local JSON
- **`dynamic`** - Fetches live data from TMDB API
- **`empty`** - Returns empty results
- **`error`** - Returns error response
- **`not-found`** - Returns 404 response

### Setting Variants

The default variant is `success`. To use dynamic (live TMDB) data, set the `variant` query parameter:

```
/api/movie/popular?variant=dynamic
```

Or configure it in the MSW dashboard (if available).
