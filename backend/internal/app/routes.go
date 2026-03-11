package app

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
	customMiddleware "github.com/oshanavishkapiries/sinhalasub/backend/internal/middleware"
)

func loadRoutes(container *config.Container) *chi.Mux {
	router := chi.NewRouter()

	// Standard middleware
	router.Use(middleware.Recoverer)
	router.Use(middleware.Logger)
	router.Use(middleware.RequestID)

	// Custom middleware
	router.Use(customMiddleware.CORSMiddleware)
	router.Use(customMiddleware.SecureHeadersMiddleware)
	router.Use(customMiddleware.RateLimitMiddleware)

	// Health check endpoint
	healthHandler := container.HealthHandler()
	router.Get("/health", healthHandler.Check)

	// User routes
	if userHandler := container.UserHandler(); userHandler != nil {
		router.Route("/users", func(r chi.Router) {
			r.Post("/", userHandler.Create)
			r.Get("/", userHandler.List)
			r.Get("/{id}", userHandler.GetByID)
		})
	}

	// Video routes
	if videoHandler := container.VideoHandler(); videoHandler != nil {
		router.Route("/videos", func(r chi.Router) {
			r.Get("/", videoHandler.List)
			r.Get("/{id}", videoHandler.GetByID)
		})
	}

	// Subtitle routes
	if subtitleHandler := container.SubtitleHandler(); subtitleHandler != nil {
		router.Route("/subtitles", func(r chi.Router) {
			r.Get("/", subtitleHandler.List)
			r.Get("/{id}", subtitleHandler.GetByID)
		})
	}

	return router
}
