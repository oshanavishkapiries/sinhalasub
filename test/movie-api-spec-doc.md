# Movie API Specification

## Base URL
```
/api
```

---

## Movies

### List Movies
```
GET /movies
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| search | string | Search by title |
| slug | string | Filter by slug |
| rating_min | float | Minimum IMDB rating |
| rating_max | float | Maximum IMDB rating |
| release_year | integer | Filter by release year |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Movie Title",
      "slug": "movie-title",
      "rating": 8.5,
      "release_date": "2024-01-15",
      "poster_url": "https://..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Get Movie by ID
```
GET /movies/:id
```

Response:
```json
{
  "id": 1,
  "title": "Movie Title",
  "slug": "movie-title",
  "rating": 8.5,
  "release_date": "2024-01-15",
  "poster_url": "https://..."
}
```

### Get Movie by Slug
```
GET /movies/slug/:slug
```

### Create Movie
```
POST /movies
```

Request Body:
```json
{
  "title": "Movie Title",
  "slug": "movie-title",
  "rating": 8.5,
  "release_date": "2024-01-15",
  "poster_url": "https://..."
}
```

### Update Movie
```
PUT /movies/:id
```

### Delete Movie
```
DELETE /movies/:id
```

---

## Cast

### Get Movie Cast
```
GET /movies/:movieId/cast
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "tmdb_id": 12345,
      "actor_name": "John Doe",
      "actor_image_url": "https://...",
      "character_name": "Hero"
    }
  ]
}
```

### Add Cast Member
```
POST /movies/:movieId/cast
```

Request Body:
```json
{
  "tmdb_id": 12345,
  "actor_name": "John Doe",
  "actor_image_url": "https://...",
  "character_name": "Hero"
}
```

### Update Cast Member
```
PUT /cast/:id
```

### Delete Cast Member
```
DELETE /cast/:id
```

---

## Movie Details

### Get Movie Details
```
GET /movies/:movieId/details
```

Response:
```json
{
  "id": 1,
  "movie_id": 1,
  "overview": "Movie description...",
  "tmdb_id": 12345,
  "imdb_id": "tt1234567",
  "adult": false,
  "category_ids": [28, 12],
  "language": "en",
  "duration": 120,
  "poster_url": "https://...",
  "backdrop_url": "https://...",
  "trailer_url": "https://youtube.com/...",
  "director": "Director Name",
  "country": "USA",
  "cast": [1, 2, 3]
}
```

### Create/Update Movie Details
```
PUT /movies/:movieId/details
```

Request Body:
```json
{
  "overview": "Movie description...",
  "tmdb_id": 12345,
  "imdb_id": "tt1234567",
  "adult": false,
  "category_ids": [28, 12],
  "language": "en",
  "duration": 120,
  "poster_url": "https://...",
  "backdrop_url": "https://...",
  "trailer_url": "https://youtube.com/...",
  "director": "Director Name",
  "country": "USA"
}
```

---

## Subtitles

### Get Movie Subtitles
```
GET /movies/:movieId/subtitles
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "language": "English",
      "subtitle_url": "https://...",
      "subtitle_author": "John Doe"
    }
  ]
}
```

### Add Subtitle
```
POST /movies/:movieId/subtitles
```

Request Body:
```json
{
  "language": "English",
  "subtitle_url": "https://...",
  "subtitle_author": "John Doe"
}
```

### Delete Subtitle
```
DELETE /subtitles/:id
```

---

## Player Providers

### Get Movie Players
```
GET /movies/:movieId/players
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "player_provider": "Vimeo",
      "player_provider_url": "https://vimeo.com/...",
      "player_provider_type": "embed",
      "video_quality": "1080p",
      "is_default": true,
      "is_ads_available": false
    }
  ]
}
```

### Add Player Provider
```
POST /movies/:movieId/players
```

Request Body:
```json
{
  "player_provider": "Vimeo",
  "player_provider_url": "https://vimeo.com/...",
  "player_provider_type": "embed",
  "video_quality": "1080p",
  "is_default": true,
  "is_ads_available": false
}
```

### Update Player Provider
```
PUT /players/:id
```

### Delete Player Provider
```
DELETE /players/:id
```

---

## Download Options

### Get Movie Downloads
```
GET /movies/:movieId/downloads
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "download_option": "Server 1",
      "download_option_url": "https://...",
      "download_option_type": "direct",
      "file_size": "1.5 GB",
      "video_quality": "1080p"
    }
  ]
}
```

### Add Download Option
```
POST /movies/:movieId/downloads
```

Request Body:
```json
{
  "download_option": "Server 1",
  "download_option_url": "https://...",
  "download_option_type": "direct",
  "file_size": "1.5 GB",
  "video_quality": "1080p"
}
```

### Update Download Option
```
PUT /downloads/:id
```

### Delete Download Option
```
DELETE /downloads/:id
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": {
    "code": 404,
    "message": "Resource not found"
  }
}
```

Common HTTP Status Codes:
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |
