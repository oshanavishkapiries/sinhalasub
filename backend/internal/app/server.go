package app

import (
	"context"
	"net/http"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

type App struct {
	router http.Handler
}

func New() *App {
	app := &App{
		router: loadRoutes(),
	}
	return app
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
