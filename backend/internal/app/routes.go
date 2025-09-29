package app

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	customMiddleware "github.com/oshanavishkapiries/sinhalasub/backend/internal/middleware"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
)

func loadRoutes() *chi.Mux {
	router := chi.NewRouter()

	router.Use(middleware.Recoverer)
	router.Use(middleware.Logger)
	router.Use(middleware.RequestID)
	router.Use(customMiddleware.CORSMiddleware)
	router.Use(customMiddleware.SecureHeadersMiddleware)
	router.Use(customMiddleware.RateLimitMiddleware)

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		response.Success(w, map[string]any{
			"status":    "OK",
			"timestamp": time.Now().UTC(),
			"service":   "sihala sub",
			"version":   "v1.0.0",
		}, "server is running")
	})
	return router
}
