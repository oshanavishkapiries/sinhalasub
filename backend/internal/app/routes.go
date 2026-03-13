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
		port = "5001"
	}
	swaggerURL := fmt.Sprintf("http://localhost:%s/swagger/doc.json", port)

	// Swagger UI endpoints
	swaggerHandler := httpSwagger.Handler(
		httpSwagger.URL(swaggerURL),
		httpSwagger.DocExpansion("none"),
	)
	router.Get("/swagger/*", swaggerHandler)
	router.Get("/api/docs", swaggerHandler)
	router.Get("/api/docs/*", swaggerHandler)

	// Health check endpoint
	healthHandler := container.HealthHandler()
	router.Get("/health", healthHandler.Check)

	// Auth routes (public)
	if authHandler := container.AuthHandler(); authHandler != nil {
		router.Route("/api/auth", func(r chi.Router) {
			r.Post("/signup", authHandler.Signup)
			r.Post("/verify", authHandler.Verify)
			r.Post("/login", authHandler.Login)
			r.Post("/refresh", authHandler.RefreshToken)
			r.Post("/logout", authHandler.Logout)
			r.Post("/forgot-password/request", authHandler.RequestPasswordReset)
			r.Post("/forgot-password", authHandler.ForgotPassword)

			// Protected route - requires JWT
			r.With(customMiddleware.JWTMiddleware).Get("/me", authHandler.GetCurrentUser)
		})
	}

	// User routes
	if userHandler := container.UserHandler(); userHandler != nil {
		router.Route("/users", func(r chi.Router) {
			r.Use(customMiddleware.JWTMiddleware)
			r.Use(customMiddleware.RequireRoles("admin", "moderator"))
			r.Post("/", userHandler.Create)
			r.Get("/", userHandler.List)
			r.Get("/{id}", userHandler.GetByID)
			r.Put("/{id}", userHandler.Update)
		})
	}

	return router
}
