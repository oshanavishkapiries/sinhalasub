package config

import (
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/handler"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/repository"
	"github.com/oshanavishkapiries/sinhalasub/backend/internal/service"
)

// Container holds all application dependencies
type Container struct {
	// Repositories
	userRepository     repository.UserRepository
	videoRepository    repository.VideoRepository
	subtitleRepository repository.SubtitleRepository

	// Services
	userService     service.UserService
	videoService    service.VideoService
	subtitleService service.SubtitleService

	// Handlers
	healthHandler   *handler.HealthHandler
	userHandler     *handler.UserHandler
	videoHandler    *handler.VideoHandler
	subtitleHandler *handler.SubtitleHandler
}

// NewContainer creates and initializes a new dependency container
func NewContainer() *Container {
	c := &Container{}
	c.initRepositories()
	c.initServices()
	c.initHandlers()
	return c
}

// initRepositories initializes all repository dependencies
func (c *Container) initRepositories() {
	// TODO: Initialize repositories with actual database implementations
	// For now, these are nil - implement concrete repository types
	// Example:
	// c.userRepository = &userRepository.MySQLUserRepository{db: dbConn}
	// c.videoRepository = &videoRepository.MySQLVideoRepository{db: dbConn}
	// c.subtitleRepository = &subtitleRepository.MySQLSubtitleRepository{db: dbConn}
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	if c.userRepository != nil {
		c.userService = service.NewUserService(c.userRepository)
	}
	if c.videoRepository != nil {
		c.videoService = service.NewVideoService(c.videoRepository)
	}
	if c.subtitleRepository != nil {
		c.subtitleService = service.NewSubtitleService(c.subtitleRepository)
	}
}

// initHandlers initializes all handler dependencies
func (c *Container) initHandlers() {
	c.healthHandler = handler.NewHealthHandler()
	if c.userService != nil {
		c.userHandler = handler.NewUserHandler(c.userService)
	}
	if c.videoService != nil {
		c.videoHandler = handler.NewVideoHandler(c.videoService)
	}
	if c.subtitleService != nil {
		c.subtitleHandler = handler.NewSubtitleHandler(c.subtitleService)
	}
}

// Getters for handlers
func (c *Container) HealthHandler() *handler.HealthHandler {
	return c.healthHandler
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

func (c *Container) VideoService() service.VideoService {
	return c.videoService
}

func (c *Container) SubtitleService() service.SubtitleService {
	return c.subtitleService
}
