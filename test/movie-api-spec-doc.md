# Movie API Specification

## Base URL
```
/api/v1
```

## Response Format

All successful responses follow this standard format:

**Single Resource:**
```json
{
  "data": { /* resource object */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Collection:**
```json
{
  "data": [ /* array of resources */ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
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
| limit | integer | Items per page (default: 20, max: 100) |
| search | string | Search by title |
| slug | string | Filter by slug |
| rating_min | float | Minimum IMDB rating |
| rating_max | float | Maximum IMDB rating |
| release_year | integer | Filter by release year |
| sort_by | string | Sort field (title, rating, release_date) |
| sort_order | string | asc or desc (default: desc) |

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
      "poster_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "timestamp": "2024-01-15T10:30:00Z"
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
  "data": {
    "id": 1,
    "title": "Movie Title",
    "slug": "movie-title",
    "rating": 8.5,
    "release_date": "2024-01-15",
    "poster_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get Movie by Slug
```
GET /movies/slug/:slug
```

Response: Same as Get Movie by ID

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

Response: `201 Created` with resource data

### Update Movie
```
PUT /movies/:id
```

Request Body: Same as Create (all fields optional)

Response: `200 OK` with updated resource data

### Delete Movie
```
DELETE /movies/:id
```

Response: `204 No Content`

### Bulk Create Movies
```
POST /movies/bulk
```

Request Body:
```json
{
  "movies": [
    {
      "title": "Movie 1",
      "slug": "movie-1",
      "rating": 8.5,
      "release_date": "2024-01-15",
      "poster_url": "https://..."
    }
  ]
}
```

Response: `201 Created` with array of created resources

### Bulk Update Movies
```
PUT /movies/bulk
```

Request Body:
```json
{
  "movies": [
    {
      "id": 1,
      "rating": 8.7
    }
  ]
}
```

Response: `200 OK` with updated resources

---

## Categories

### Get Movie Categories
```
GET /movies/:movieId/categories
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "category_id": 28,
      "category_name": "Action",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Add Category to Movie
```
POST /movies/:movieId/categories
```

Request Body:
```json
{
  "category_id": 28,
  "category_name": "Action"
}
```

Response: `201 Created` with category resource

### Remove Category from Movie
```
DELETE /movies/:movieId/categories/:categoryId
```

Response: `204 No Content`

### Add Multiple Categories
```
POST /movies/:movieId/categories/bulk
```

Request Body:
```json
{
  "categories": [
    { "category_id": 28, "category_name": "Action" },
    { "category_id": 12, "category_name": "Adventure" }
  ]
}
```

Response: `201 Created` with array of categories

---

## Cast

### Get Movie Cast
```
GET /movies/:movieId/cast
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

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
      "character_name": "Hero",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "timestamp": "2024-01-15T10:30:00Z"
  }
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

Response: `201 Created` with cast resource

### Update Cast Member
```
PUT /cast/:id
```

Request Body: Same as Add Cast Member (all fields optional)

Response: `200 OK` with updated resource

### Delete Cast Member
```
DELETE /cast/:id
```

Response: `204 No Content`

### Add Multiple Cast Members
```
POST /movies/:movieId/cast/bulk
```

Request Body:
```json
{
  "cast": [
    {
      "tmdb_id": 12345,
      "actor_name": "John Doe",
      "actor_image_url": "https://...",
      "character_name": "Hero"
    }
  ]
}
```

Response: `201 Created` with array of cast members

---

## Movie Details

### Get Movie Details
```
GET /movies/:movieId/details
```

Response:
```json
{
  "data": {
    "id": 1,
    "movie_id": 1,
    "overview": "Movie description...",
    "tmdb_id": 12345,
    "imdb_id": "tt1234567",
    "adult": false,
    "language": "en",
    "duration": 120,
    "backdrop_url": "https://...",
    "trailer_url": "https://youtube.com/...",
    "director": "Director Name",
    "country": "USA",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
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
  "language": "en",
  "duration": 120,
  "backdrop_url": "https://...",
  "trailer_url": "https://youtube.com/...",
  "director": "Director Name",
  "country": "USA"
}
```

Response: `200 OK` with updated resource

---

## Subtitles

### Get Movie Subtitles
```
GET /movies/:movieId/subtitles
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| language | string | Filter by language |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "language": "English",
      "subtitle_url": "https://...",
      "subtitle_author": "John Doe",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "timestamp": "2024-01-15T10:30:00Z"
  }
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

Response: `201 Created` with subtitle resource

### Update Subtitle
```
PUT /subtitles/:id
```

Request Body: Same as Add Subtitle (all fields optional)

Response: `200 OK` with updated resource

### Delete Subtitle
```
DELETE /subtitles/:id
```

Response: `204 No Content`

### Add Multiple Subtitles
```
POST /movies/:movieId/subtitles/bulk
```

Request Body:
```json
{
  "subtitles": [
    {
      "language": "English",
      "subtitle_url": "https://...",
      "subtitle_author": "John Doe"
    }
  ]
}
```

Response: `201 Created` with array of subtitles

---

## Player Providers

### Get Movie Players
```
GET /movies/:movieId/players
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| video_quality | string | Filter by quality (720p, 1080p, 4K) |
| is_default | boolean | Filter by default provider |

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
      "is_ads_available": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "timestamp": "2024-01-15T10:30:00Z"
  }
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

Response: `201 Created` with player resource

### Update Player Provider
```
PUT /players/:id
```

Request Body: Same as Add Player Provider (all fields optional)

Response: `200 OK` with updated resource

### Delete Player Provider
```
DELETE /players/:id
```

Response: `204 No Content`

### Add Multiple Player Providers
```
POST /movies/:movieId/players/bulk
```

Request Body:
```json
{
  "players": [
    {
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

Response: `201 Created` with array of players

---

## Download Options

### Get Movie Downloads
```
GET /movies/:movieId/downloads
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| video_quality | string | Filter by quality (720p, 1080p, 4K) |
| download_option_type | string | Filter by type (direct, torrent) |

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
      "video_quality": "1080p",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
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

Response: `201 Created` with download resource

### Update Download Option
```
PUT /downloads/:id
```

Request Body: Same as Add Download Option (all fields optional)

Response: `200 OK` with updated resource

### Delete Download Option
```
DELETE /downloads/:id
```

Response: `204 No Content`

### Add Multiple Download Options
```
POST /movies/:movieId/downloads/bulk
```

Request Body:
```json
{
  "downloads": [
    {
      "download_option": "Server 1",
      "download_option_url": "https://...",
      "download_option_type": "direct",
      "file_size": "1.5 GB",
      "video_quality": "1080p"
    }
  ]
}
```

Response: `201 Created` with array of downloads

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": {
    "code": 404,
    "message": "Resource not found",
    "details": "Movie with id 999 does not exist",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Common HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate slug, unique constraint) |
| 422 | Unprocessable Entity (semantic error) |
| 500 | Server Error |

### Error Examples

**Validation Error (400):**
```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "slug": "Slug must be unique"
    }
  }
}
```

**Not Found (404):**
```json
{
  "error": {
    "code": 404,
    "message": "Resource not found",
    "details": "Movie with id 999 does not exist"
  }
}
```

---

## API Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination defaults: page=1, limit=20, max limit=100
- All IDs are positive integers
- Slug must be unique across movies
- The `tmdb_id` field uniquely identifies cast members
- Responses are always JSON
- Content-Type: application/json for all requests/responses

