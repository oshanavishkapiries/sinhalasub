# Routes Organization

This directory contains the routing configuration for the Sinhala Subtitle API.

## Structure

The routes are now organized into separate files for better maintainability:

- **routes.go** - Main routes loader and middleware setup
- **routes_auth.go** - Authentication endpoints
- **routes_user.go** - User management endpoints
- **routes_movie.go** - Movie and related resource endpoints

## API Structure

All API endpoints are prefixed with `/api`:

### Stable API (No version prefix)

These endpoints are considered stable and won't change:

- **Auth**: `/api/auth/*`
  - POST `/api/auth/signup`
  - POST `/api/auth/login`
  - POST `/api/auth/verify`
  - POST `/api/auth/resend-verification`
  - POST `/api/auth/refresh`
  - POST `/api/auth/logout`
  - POST `/api/auth/forgot-password/request`
  - POST `/api/auth/forgot-password`
  - GET `/api/auth/me`

- **Users**: `/api/users/*` (Admin/Moderator only)
  - POST `/api/users/`
  - GET `/api/users/`
  - GET `/api/users/{id}`
  - PUT `/api/users/{id}`
  - PATCH `/api/users/{id}/role` (Admin only)
  - DELETE `/api/users/{id}` (Admin only)

### Versioned API (v1)

Movie-related endpoints are versioned under `/api/v1`:

- **Movies**: `/api/v1/movies/*`
  - GET `/api/v1/movies` - List movies (public)
  - GET `/api/v1/movies/{id}` - Get by ID (public)
  - GET `/api/v1/movies/slug/{slug}` - Get by slug (public)
  - POST `/api/v1/movies` - Create (protected)
  - POST `/api/v1/movies/bulk` - Bulk create (protected)
  - PUT `/api/v1/movies/{id}` - Update (protected)
  - DELETE `/api/v1/movies/{id}` - Delete (protected)

- **Movie Categories**: `/api/v1/movies/{movieId}/categories/*`
  - GET `/api/v1/movies/{movieId}/categories` (public)
  - POST `/api/v1/movies/{movieId}/categories` (protected)
  - POST `/api/v1/movies/{movieId}/categories/bulk` (protected)
  - DELETE `/api/v1/movies/{movieId}/categories/{categoryId}` (protected)

- **Cast**: `/api/v1/movies/{movieId}/cast/*` and `/api/v1/cast/*`
  - GET `/api/v1/movies/{movieId}/cast` (public)
  - POST `/api/v1/movies/{movieId}/cast` (protected)
  - POST `/api/v1/movies/{movieId}/cast/bulk` (protected)
  - PUT `/api/v1/cast/{id}` (protected)
  - DELETE `/api/v1/cast/{id}` (protected)

- **Movie Details**: `/api/v1/movies/{movieId}/details/*`
  - GET `/api/v1/movies/{movieId}/details` (public)
  - PUT `/api/v1/movies/{movieId}/details` (protected)

- **Subtitles**: `/api/v1/movies/{movieId}/subtitles/*` and `/api/v1/subtitles/*`
  - GET `/api/v1/movies/{movieId}/subtitles` (public)
  - POST `/api/v1/movies/{movieId}/subtitles` (protected)
  - POST `/api/v1/movies/{movieId}/subtitles/bulk` (protected)
  - PUT `/api/v1/subtitles/{id}` (protected)
  - DELETE `/api/v1/subtitles/{id}` (protected)

- **Player Providers**: `/api/v1/movies/{movieId}/players/*` and `/api/v1/players/*`
  - GET `/api/v1/movies/{movieId}/players` (public)
  - POST `/api/v1/movies/{movieId}/players` (protected)
  - POST `/api/v1/movies/{movieId}/players/bulk` (protected)
  - PUT `/api/v1/players/{id}` (protected)
  - DELETE `/api/v1/players/{id}` (protected)

- **Download Options**: `/api/v1/movies/{movieId}/downloads/*` and `/api/v1/downloads/*`
  - GET `/api/v1/movies/{movieId}/downloads` (public)
  - POST `/api/v1/movies/{movieId}/downloads` (protected)
  - POST `/api/v1/movies/{movieId}/downloads/bulk` (protected)
  - PUT `/api/v1/downloads/{id}` (protected)
  - DELETE `/api/v1/downloads/{id}` (protected)

### Utility Endpoints

- **Swagger**: `/api/swagger/*` and `/api/docs/*`
- **Health**: `/api/health`

## Adding New Routes

To add new routes in the future:

1. Create a new file `routes_<feature>.go` in this directory
2. Create a function `register<Feature>Routes(router chi.Router, container *config.Container)`
3. Add the route registration call in `routes.go` under the appropriate section
4. Add swagger annotations to your handlers with paths relative to `/api` (not including `/api`)

Example:

```go
// routes_analytics.go
package app

import (
	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
)

func registerAnalyticsRoutes(router chi.Router, container *config.Container) {
	analyticsHandler := container.AnalyticsHandler()
	if analyticsHandler == nil {
		return
	}

	router.Route("/analytics", func(r chi.Router) {
		r.Get("/stats", analyticsHandler.GetStats)
	})
}
```

Then in `routes.go`:

```go
// Register API routes
router.Route("/api", func(r chi.Router) {
	// ... existing routes ...
	
	// Analytics routes
	registerAnalyticsRoutes(r, container)
})
```

## Swagger Configuration

The swagger `@BasePath` is set to `/api` in `cmd/main.go`. All `@Router` annotations in handlers should be relative paths without the `/api` prefix.

Example:
```go
// @Router /v1/movies [get]  ✅ Correct
// @Router /api/v1/movies [get]  ❌ Wrong (will cause duplicate /api/api/v1/movies)
```
