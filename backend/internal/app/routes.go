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
	swaggerURL := fmt.Sprintf("http://localhost:%s/api/swagger/doc.json", port)

	router.Route("/api", func(api chi.Router) {
		// Swagger UI endpoints
		swaggerHandler := httpSwagger.Handler(
			httpSwagger.URL(swaggerURL),
			httpSwagger.DocExpansion("none"),
		)
		api.Get("/swagger/*", swaggerHandler)
		api.Get("/docs", swaggerHandler)
		api.Get("/docs/*", swaggerHandler)

		// Health check endpoint
		healthHandler := container.HealthHandler()
		api.Get("/health", healthHandler.Check)

		// Auth routes (public)
		if authHandler := container.AuthHandler(); authHandler != nil {
			api.Route("/auth", func(r chi.Router) {
				r.Post("/signup", authHandler.Signup)
				r.Post("/verify", authHandler.Verify)
				r.Post("/resend-verification", authHandler.ResendVerification)
				r.Post("/login", authHandler.Login)
				r.Post("/refresh", authHandler.RefreshToken)
				r.Post("/logout", authHandler.Logout)
				r.Post("/forgot-password/request", authHandler.RequestPasswordReset)
				r.Post("/forgot-password", authHandler.ForgotPassword)
				r.Get("/me", authHandler.GetCurrentUser)
			})
		}

		// User routes
		if userHandler := container.UserHandler(); userHandler != nil {
			api.Route("/users", func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", userHandler.Create)
				r.Get("/", userHandler.List)
				r.Get("/{id}", userHandler.GetByID)
				r.Put("/{id}", userHandler.Update)
				r.With(customMiddleware.RequireRoles("admin")).Patch("/{id}/role", userHandler.ChangeRole)
				r.With(customMiddleware.RequireRoles("admin")).Delete("/{id}", userHandler.Delete)
			})
		}
	})

	return router
}
