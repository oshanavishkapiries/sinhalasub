package app

import (
	"fmt"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/oshanavishkapiries/sinhalasub/backend/docs"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
	customMiddleware "github.com/oshanavishkapiries/sinhalasub/backend/internal/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
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

	// Get dynamic port for Swagger URL
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	swaggerURL := fmt.Sprintf("http://localhost:%s/swagger/doc.json", port)

	// Swagger UI endpoints
	router.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL(swaggerURL),
	))
	router.Get("/api/docs", httpSwagger.WrapHandler)

	// Health check endpoint
	healthHandler := container.HealthHandler()
	router.Get("/health", healthHandler.Check)

	// Auth routes (public)
	if authHandler := container.AuthHandler(); authHandler != nil {
		router.Route("/api/auth", func(r chi.Router) {
			r.Post("/signup", authHandler.Signup)
			r.Post("/login", authHandler.Login)
			r.Post("/refresh", authHandler.RefreshToken)
			r.Post("/logout", authHandler.Logout)

			// Protected route - requires JWT
			r.With(customMiddleware.JWTMiddleware).Get("/me", authHandler.GetCurrentUser)
		})
	}

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
