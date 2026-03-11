# Mock Server API Structure Analysis

## Executive Summary

The project uses **Mocks Server** with a well-organized architecture supporting both static mock data and dynamic TMDB API fetching. The API is centered around content management (movies/TV shows) with authentication support, following a consistent pattern for all endpoints.

---

## 1. Current API Endpoint Patterns

### Base URL Configuration
- **Development (Mock)**: `http://localhost:3100/api`
- **Production (Real)**: `https://api.themoviedb.org/3`
- **Mock Server Admin**: `http://localhost:3110`
- **Network Delay**: 500ms (simulated)

### Route Structure Format

All routes follow this standardized Mocks Server structure:

```javascript
module.exports = [
  {
    id: "route-identifier",          // Unique route ID
    url: "/api/endpoint/path",       // Full API path
    method: "GET|POST|PUT|DELETE",   // HTTP method
    variants: [
      {
        id: "success",               // Response variant
        type: "json|middleware",     // Response type
        options: {
          status: 200,               // HTTP status
          body: {...}                // Response body
        }
      },
      // Multiple variants per route
    ]
  }
];
```

---

## 2. Complete Endpoint Inventory

### 2.1 Authentication Endpoints (`/api/auth/*`)

#### POST `/api/auth/login`
**Purpose**: User login  
**Variants**: `success`, `invalid-email`, `server-error`
```json
Request: { "email": "admin@sinhalasub.lk", "password": "test@123" }
Response 200: {
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id", "email", "name", "role", "avatar", "isActive" },
    "token": "base64_encoded_jwt",
    "refreshToken": "base64_encoded_refresh_token"
  }
}
```
**Error 401**: Invalid credentials

#### POST `/api/auth/signup`
**Purpose**: User registration  
**Variants**: `success`, `email-exists`, `validation-error`
```json
Request: { "email": "user@example.com", "password": "pass", "name": "John" }
Response 201: Same as login response
```
**Error 409**: Email already exists

#### GET `/api/auth/me`
**Purpose**: Get current authenticated user  
**Variants**: `success`, `unauthorized`, `invalid-token`
**Headers Required**: `Authorization: Bearer <token>`
```json
Response 200: {
  "success": true,
  "data": { "user": {...} }
}
```

#### POST `/api/auth/refresh`
**Purpose**: Refresh access token  
**Variants**: `success`, `invalid-token`
```json
Request: { "refreshToken": "base64_token" }
Response 200: {
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### POST `/api/auth/logout`
**Purpose**: User logout  
**Variants**: `success`
```json
Response 200: { "success": true, "message": "Logout successful" }
```

---

### 2.2 Configuration Endpoints (`/api/configuration/*`)

#### GET `/api/configuration/languages`
**Purpose**: Get available languages  
**Variants**: `success`, `dynamic`, `error`
```json
Response 200: [
  {
    "english_name": "English",
    "iso_639_1": "en",
    "name": "English"
  },
  {
    "english_name": "Sinhala",
    "iso_639_1": "si",
    "name": "සිංහල"
  }
]
```
**Supported Languages**: English (en), Sinhala (si), Tamil (ta), Spanish (es), French (fr), German (de), Japanese (ja), Korean (ko), Hindi (hi)

---

### 2.3 Genre Endpoints (`/api/genre/*`)

#### GET `/api/genre/movie/list`
**Purpose**: Get all movie genres  
**Variants**: `success`, `dynamic`, `error`
```json
Response 200: {
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    ...19 total genres
  ]
}
```

#### GET `/api/genre/tv/list`
**Purpose**: Get all TV show genres  
**Variants**: `success`, `dynamic`, `error`
```json
Response 200: {
  "genres": [
    { "id": 10759, "name": "Action & Adventure" },
    { "id": 16, "name": "Animation" },
    ...16 total genres
  ]
}
```

---

### 2.4 Content List Endpoints

#### GET `/api/trending/all/week`
**Purpose**: Get trending content (movies + TV)  
**Variants**: `success`, `dynamic`, `empty`, `error`
```json
Response 200: {
  "page": 1,
  "results": [
    {
      "id": 1,
      "title": "The Shawshank Redemption",
      "overview": "...",
      "poster_path": "/...",
      "vote_average": 8.7,
      "media_type": "movie"
    }
  ]
}
```

#### GET `/api/movie/popular`
**Purpose**: Get popular movies  
**Variants**: `success`, `dynamic`, `error`
**Response**: Same format as trending, filtered to movies only

#### GET `/api/tv/popular`
**Purpose**: Get popular TV shows  
**Variants**: `success`, `dynamic`, `error`
**Response**: Same format as trending, filtered to TV only

#### GET `/api/movie/top_rated`
**Purpose**: Get top-rated movies  
**Variants**: `success`, `dynamic`, `error`

#### GET `/api/tv/top_rated`
**Purpose**: Get top-rated TV shows  
**Variants**: `success`, `dynamic`, `error`

#### GET `/api/movie/now_playing`
**Purpose**: Get movies currently in theaters  
**Variants**: `success`, `dynamic`, `error`

---

### 2.5 Details Endpoints

#### GET `/api/movie/:id`
**Purpose**: Get detailed information about a movie  
**Variants**: `success`, `dynamic`, `not-found`
**Path Params**: `id` (movie ID)
```json
Response 200: {
  "id": 1,
  "title": "The Shawshank Redemption",
  "original_title": "...",
  "overview": "...",
  "poster_path": "/...",
  "backdrop_path": "/...",
  "vote_average": 8.7,
  "release_date": "1994-09-23",
  "genre_ids": [18, 80],
  "media_type": "movie"
}
```
**Error 404**: Movie not found

#### GET `/api/tv/:id`
**Purpose**: Get detailed information about a TV show  
**Variants**: `success`, `dynamic`, `not-found`
**Path Params**: `id` (TV show ID)
**Response**: Similar to movie details + `seasons` array
```json
{
  ...content details,
  "name": "Breaking Bad",
  "first_air_date": "2008-01-20",
  "seasons": [
    {
      "air_date": "2008-01-20",
      "episode_count": 7,
      "id": 1,
      "name": "Season 1",
      "season_number": 1
    }
  ]
}
```

---

### 2.6 Similar Content Endpoints

#### GET `/api/movie/:id/similar`
**Purpose**: Get movies similar to a given movie  
**Variants**: `success`, `dynamic`
**Path Params**: `id` (movie ID)
```json
Response 200: {
  "page": 1,
  "results": [similar movies array]
}
```

#### GET `/api/tv/:id/similar`
**Purpose**: Get TV shows similar to a given show  
**Variants**: `success`, `dynamic`

---

### 2.7 Search Endpoints

#### GET `/api/search/multi`
**Purpose**: Search for movies and TV shows  
**Variants**: `success`, `dynamic`, `empty`
**Query Params**: 
- `query` (required): Search term
```
GET /api/search/multi?query=avatar
```
```json
Response 200: {
  "page": 1,
  "results": [
    {
      "id": 19995,
      "title": "Avatar",
      "media_type": "movie",
      ...
    }
  ]
}
```

---

### 2.8 Discover Endpoints

#### GET `/api/movie/:category`
**Purpose**: Discover movies by category with optional filters  
**Variants**: `success`, `dynamic`
**Path Params**: 
- `category`: `popular`, `top_rated`, `now_playing`, `upcoming`
**Query Params**:
- `with_genres`: Comma-separated genre IDs (e.g., `28,12`)
- `with_original_language`: Language code (e.g., `en`)
```
GET /api/movie/popular?with_genres=28,12&with_original_language=en
```
```json
Response 200: {
  "page": 1,
  "results": [movies array]
}
```

#### GET `/api/discover/tv`
**Purpose**: Discover TV shows with optional filters  
**Variants**: `success`, `dynamic`
**Query Params**:
- `with_genres`: Comma-separated genre IDs
- `with_original_language`: Language code
- `on_the_air`: Filter to currently airing shows

#### GET `/api/tv/:category`
**Purpose**: Get TV shows by category  
**Variants**: `success`, `dynamic`
**Path Params**: `category`: `popular`, `top_rated`, etc.
**Query Params**: Same as discover/tv

---

### 2.9 TV Season Endpoints

#### GET `/api/tv/:tvId/season/:seasonNumber`
**Purpose**: Get episode details for a specific TV season  
**Variants**: `success`, `dynamic`, `not-found`
**Path Params**:
- `tvId`: TV show ID
- `seasonNumber`: Season number (1-based)
```json
Response 200: {
  "air_date": "2008-01-20",
  "episode_count": 7,
  "id": 1,
  "name": 
