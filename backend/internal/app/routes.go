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

		// Movie routes
		if movieHandler := container.MovieHandler(); movieHandler != nil {
			api.Route("/v1/movies", func(r chi.Router) {
				// Public read endpoints
				r.Get("/", movieHandler.List)
				r.Get("/{id}", movieHandler.GetByID)
				r.Get("/slug/{slug}", movieHandler.GetBySlug)

				// Admin/Moderator write endpoints
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", movieHandler.Create)
				r.Post("/bulk", movieHandler.BulkCreate)
				r.Put("/{id}", movieHandler.Update)
				r.Delete("/{id}", movieHandler.Delete)
			})
		}

		// Movie Categories routes
		if movieCategoryHandler := container.MovieCategoryHandler(); movieCategoryHandler != nil {
			api.Route("/v1/movies/{movieId}/categories", func(r chi.Router) {
				// Public read
				r.Get("/", movieCategoryHandler.List)

				// Admin/Moderator write
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", movieCategoryHandler.Add)
				r.Post("/bulk", movieCategoryHandler.BulkAdd)
				r.Delete("/{categoryId}", movieCategoryHandler.Delete)
			})
		}

		// Cast routes
		if castHandler := container.CastHandler(); castHandler != nil {
			api.Route("/v1/movies/{movieId}/cast", func(r chi.Router) {
				// Public read
				r.Get("/", castHandler.List)

				// Admin/Moderator write
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", castHandler.Create)
				r.Post("/bulk", castHandler.BulkCreate)
			})

			api.Route("/v1/cast", func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Put("/{id}", castHandler.Update)
				r.Delete("/{id}", castHandler.Delete)
			})
		}

		// Movie Details routes
		if movieDetailHandler := container.MovieDetailHandler(); movieDetailHandler != nil {
			api.Route("/v1/movies/{movieId}/details", func(r chi.Router) {
				// Public read
				r.Get("/", movieDetailHandler.GetByMovieID)

				// Admin/Moderator write
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Put("/", movieDetailHandler.CreateOrUpdate)
			})
		}

		// Subtitles routes
		if subtitleHandler := container.SubtitleHandler(); subtitleHandler != nil {
			api.Route("/v1/movies/{movieId}/subtitles", func(r chi.Router) {
				// Public read
				r.Get("/", subtitleHandler.List)

				// Admin/Moderator write
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", subtitleHandler.Create)
				r.Post("/bulk", subtitleHandler.BulkCreate)
			})

			api.Route("/v1/subtitles", func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Put("/{id}", subtitleHandler.Update)
				r.Delete("/{id}", subtitleHandler.Delete)
			})
		}

		// Player Providers routes
		if playerProviderHandler := container.PlayerProviderHandler(); playerProviderHandler != nil {
			api.Route("/v1/movies/{movieId}/players", func(r chi.Router) {
				// Public read
				r.Get("/", playerProviderHandler.List)

				// Admin/Moderator write
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", playerProviderHandler.Create)
				r.Post("/bulk", playerProviderHandler.BulkCreate)
			})

			api.Route("/v1/players", func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Put("/{id}", playerProviderHandler.Update)
				r.Delete("/{id}", playerProviderHandler.Delete)
			})
		}

		// Download Options routes
		if downloadOptionHandler := container.DownloadOptionHandler(); downloadOptionHandler != nil {
			api.Route("/v1/movies/{movieId}/downloads", func(r chi.Router) {
				// Public read
				r.Get("/", downloadOptionHandler.List)

				// Admin/Moderator write
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Post("/", downloadOptionHandler.Create)
				r.Post("/bulk", downloadOptionHandler.BulkCreate)
			})

			api.Route("/v1/downloads", func(r chi.Router) {
				r.Use(customMiddleware.JWTMiddleware)
				r.Use(customMiddleware.RequireRoles("admin", "moderator"))
				r.Put("/{id}", downloadOptionHandler.Update)
				r.Delete("/{id}", downloadOptionHandler.Delete)
			})
		}
	})

	return router
}
