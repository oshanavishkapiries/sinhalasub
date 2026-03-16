package app

import (
	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
	customMiddleware "github.com/oshanavishkapiries/sinhalasub/backend/internal/middleware"
)

// registerMovieRoutes registers all movie-related routes under /v1
func registerMovieRoutes(router chi.Router, container *config.Container) {
	// Movies CRUD
	if movieHandler := container.MovieHandler(); movieHandler != nil {
		router.Route("/movies", func(r chi.Router) {
			// Public read endpoints
			r.Get("/", movieHandler.List)
			r.Get("/{id}", movieHandler.GetByID)
			r.Get("/slug/{slug}", movieHandler.GetBySlug)

			// Admin/Moderator write endpoints
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", movieHandler.Create)
				r.Post("/bulk", movieHandler.BulkCreate)
				r.Put("/{id}", movieHandler.Update)
				r.Delete("/{id}", movieHandler.Delete)
			})
		})
	}

	// Movie Categories
	if movieCategoryHandler := container.MovieCategoryHandler(); movieCategoryHandler != nil {
		router.Route("/movies/{movieId}/categories", func(r chi.Router) {
			// Public read
			r.Get("/", movieCategoryHandler.List)

			// Admin/Moderator write
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", movieCategoryHandler.Add)
				r.Post("/bulk", movieCategoryHandler.BulkAdd)
				r.Delete("/{categoryId}", movieCategoryHandler.Delete)
			})
		})
	}

	// Cast
	if castHandler := container.CastHandler(); castHandler != nil {
		router.Route("/movies/{movieId}/cast", func(r chi.Router) {
			// Public read
			r.Get("/", castHandler.List)

			// Admin/Moderator write
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", castHandler.Create)
				r.Post("/bulk", castHandler.BulkCreate)
			})
		})

		router.Route("/cast", func(r chi.Router) {
			r.Use(customMiddleware.JWTMiddleware)
			r.Use(customMiddleware.RequireRoles("admin", "moderator"))
			r.Put("/{id}", castHandler.Update)
			r.Delete("/{id}", castHandler.Delete)
		})
	}

	// Movie Details
	if movieDetailHandler := container.MovieDetailHandler(); movieDetailHandler != nil {
		router.Route("/movies/{movieId}/details", func(r chi.Router) {
			// Public read
			r.Get("/", movieDetailHandler.GetByMovieID)

			// Admin/Moderator write
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Put("/", movieDetailHandler.CreateOrUpdate)
			})
		})
	}

	// Subtitles
	if subtitleHandler := container.SubtitleHandler(); subtitleHandler != nil {
		router.Route("/movies/{movieId}/subtitles", func(r chi.Router) {
			// Public read
			r.Get("/", subtitleHandler.List)

			// Admin/Moderator write
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", subtitleHandler.Create)
				r.Post("/bulk", subtitleHandler.BulkCreate)
			})
		})

		router.Route("/subtitles", func(r chi.Router) {
			r.Use(customMiddleware.JWTMiddleware)
			r.Use(customMiddleware.RequireRoles("admin", "moderator"))
			r.Put("/{id}", subtitleHandler.Update)
			r.Delete("/{id}", subtitleHandler.Delete)
		})
	}

	// Player Providers
	if playerProviderHandler := container.PlayerProviderHandler(); playerProviderHandler != nil {
		router.Route("/movies/{movieId}/players", func(r chi.Router) {
			// Public read
			r.Get("/", playerProviderHandler.List)

			// Admin/Moderator write
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", playerProviderHandler.Create)
				r.Post("/bulk", playerProviderHandler.BulkCreate)
			})
		})

		router.Route("/players", func(r chi.Router) {
			r.Use(customMiddleware.JWTMiddleware)
			r.Use(customMiddleware.RequireRoles("admin", "moderator"))
			r.Put("/{id}", playerProviderHandler.Update)
			r.Delete("/{id}", playerProviderHandler.Delete)
		})
	}

	// Download Options
	if downloadOptionHandler := container.DownloadOptionHandler(); downloadOptionHandler != nil {
		router.Route("/movies/{movieId}/downloads", func(r chi.Router) {
			// Public read
			r.Get("/", downloadOptionHandler.List)

			// Admin/Moderator write
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", downloadOptionHandler.Create)
				r.Post("/bulk", downloadOptionHandler.BulkCreate)
			})
		})

		router.Route("/downloads", func(r chi.Router) {
			r.Use(customMiddleware.JWTMiddleware)
			r.Use(customMiddleware.RequireRoles("admin", "moderator"))
			r.Put("/{id}", downloadOptionHandler.Update)
			r.Delete("/{id}", downloadOptionHandler.Delete)
		})
	}
}
