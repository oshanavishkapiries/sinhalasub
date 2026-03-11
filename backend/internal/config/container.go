package config

import (
	"database/sql"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/handler"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/database"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

// Container holds all application dependencies
type Container struct {
	// Database
	db *sql.DB

	// Repositories
	userRepository     repository.UserRepository
	videoRepository    repository.VideoRepository
	subtitleRepository repository.SubtitleRepository

	// Services
	userService     service.UserService
	authService     service.AuthService
	videoService    service.VideoService
	subtitleService service.SubtitleService

	// Handlers
	healthHandler   *handler.HealthHandler
	authHandler     *handler.AuthHandler
	userHandler     *handler.UserHandler
	videoHandler    *handler.VideoHandler
	subtitleHandler *handler.SubtitleHandler
}

// NewContainer creates and initializes a new dependency container
func NewContainer() *Container {
	c := &Container{}
	c.initDatabase()
	c.initRepositories()
	c.initServices()
	c.initHandlers()
	return c
}

// initDatabase initializes database connection
func (c *Container) initDatabase() {
	db, err := database.NewPostgresConnection(
		utils.GetEnv("DB_HOST", "localhost"),
		utils.GetEnv("DB_PORT", "5432"),
		utils.GetEnv("DB_USER", "postgres"),
		utils.GetEnv("DB_PASSWORD", ""),
		utils.GetEnv("DB_NAME", "sinhalasub"),
	)
	if err != nil {
		utils.ErrorLog("failed to initialize database: %s", err)
		return
	}
	c.db = db.GetConnection()
}

// initRepositories initializes all repository dependencies
func (c *Container) initRepositories() {
	if c.db != nil {
		c.userRepository = repository.NewPostgresUserRepository(c.db)
		// TODO: Initialize other repositories with database
		// c.videoRepository = repository.NewPostgresVideoRepository(c.db)
		// c.subtitleRepository = repository.NewPostgresSubtitleRepository(c.db)
	}
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	if c.userRepository != nil {
		c.userService = service.NewUserService(c.userRepository)
		c.authService = service.NewAuthService(c.userRepository)
	}
	// TODO: Initialize other services
	// if c.videoRepository != nil {
	//     c.videoService = service.NewVideoService(c.videoRepository)
	// }
	// if c.subtitleRepository != nil {
	//     c.subtitleService = service.NewSubtitleService(c.subtitleRepository)
	// }
}

// initHandlers initializes all handler dependencies
func (c *Container) initHandlers() {
	c.healthHandler = handler.NewHealthHandler()
	if c.authService != nil {
		c.authHandler = handler.NewAuthHandler(c.authService)
	}
	if c.userService != nil {
		c.userHandler = handler.NewUserHandler(c.userService)
	}
	// TODO: Initialize other handlers
	// if c.videoService != nil {
	//     c.videoHandler = handler.NewVideoHandler(c.videoService)
	// }
	// if c.subtitleService != nil {
	//     c.subtitleHandler = handler.NewSubtitleHandler(c.subtitleService)
	// }
}

// Getters for handlers
func (c *Container) HealthHandler() *handler.HealthHandler {
	return c.healthHandler
}

func (c *Container) AuthHandler() *handler.AuthHandler {
	return c.authHandler
}

func (c *Container) UserHandler() *handler.UserHandler {
	return c.userHandler
}

func (c *Container) VideoHandler() *handler.VideoHandler {
	return c.videoHandler
}

func (c *Container) SubtitleHandler() *handler.SubtitleHandler {
	return c.subtitleHandler
}

// Getters for services
func (c *Container) UserService() service.UserService {
	return c.userService
}

func (c *Container) AuthService() service.AuthService {
	return c.authService
}

func (c *Container) VideoService() service.VideoService {
	return c.videoService
}

func (c *Container) SubtitleService() service.SubtitleService {
	return c.subtitleService
}
