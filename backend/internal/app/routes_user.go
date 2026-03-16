package app

import (
	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
	customMiddleware "github.com/oshanavishkapiries/sinhalasub/backend/internal/middleware"
)

// registerUserRoutes registers user management routes
func registerUserRoutes(router chi.Router, container *config.Container) {
	userHandler := container.UserHandler()
	if userHandler == nil {
		return
	}

	router.Route("/users", func(r chi.Router) {
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
