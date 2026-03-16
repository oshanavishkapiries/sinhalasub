package app

import (
	"github.com/go-chi/chi/v5"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
)

// registerAuthRoutes registers authentication-related routes
func registerAuthRoutes(router chi.Router, container *config.Container) {
	authHandler := container.AuthHandler()
	if authHandler == nil {
		return
	}

	router.Route("/auth", func(r chi.Router) {
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
