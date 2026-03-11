package app

import (
	"context"
	"net/http"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/config"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

type App struct {
	router    http.Handler
	container *config.Container
}

func New() *App {
	container := config.NewContainer()
	app := &App{
		router:    loadRoutes(container),
		container: container,
	}
	return app
}

// NewWithContainer creates an App with a specific container (useful for testing)
func NewWithContainer(container *config.Container) *App {
	return &App{
		router:    loadRoutes(container),
		container: container,
	}
}

func (a *App) Start(ctx context.Context, port string) error {
	server := &http.Server{
		Addr:    ":" + port,
		Handler: a.router,
	}

	utils.SuccessLog("starting server on port %s", port)

	err := server.ListenAndServe()
	if err != nil {
		utils.ErrorLog("starting server : %s", err)
		return err
	}

	return nil
}

// GetContainer returns the dependency container
func (a *App) GetContainer() *config.Container {
	return a.container
}
