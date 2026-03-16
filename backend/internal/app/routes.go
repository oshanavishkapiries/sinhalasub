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

	// Apply global middleware
	setupMiddleware(router)

	// Setup documentation and health endpoints
	setupUtilityRoutes(router, container)

	// Register API routes
	router.Route("/api", func(r chi.Router) {
		// Auth routes
		registerAuthRoutes(r, container)

		// User management routes
		registerUserRoutes(r, container)

		r.Route("/v1", func(v1 chi.Router) {
			registerMovieRoutes(v1, container)
		})
	})

	return router
}

// setupMiddleware applies all global middleware to the router
func setupMiddleware(router *chi.Mux) {
	// Standard middleware
	router.Use(middleware.Recoverer)
	router.Use(middleware.Logger)
	router.Use(middleware.RequestID)

	// Custom middleware
	router.Use(customMiddleware.CORSMiddleware)
	router.Use(customMiddleware.SecureHeadersMiddleware)
	router.Use(customMiddleware.RateLimitMiddleware)
}

// setupUtilityRoutes configures documentation and health check endpoints
func setupUtilityRoutes(router *chi.Mux, container *config.Container) {
	// Get dynamic port for Swagger URL
	port := os.Getenv("PORT")
	if port == "" {
		port = "5001"
	}
	swaggerURL := fmt.Sprintf("http://localhost:%s/api/swagger/doc.json", port)

	// Swagger UI endpoints
	swaggerHandler := httpSwagger.Handler(
		httpSwagger.URL(swaggerURL),
		httpSwagger.DocExpansion("none"),
	)
	router.Get("/api/swagger/*", swaggerHandler)
	router.Get("/api/docs", swaggerHandler)
	router.Get("/api/docs/*", swaggerHandler)

	// Health check endpoint
	healthHandler := container.HealthHandler()
	router.Get("/api/health", healthHandler.Check)
}
