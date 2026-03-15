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
	userRepository             repository.UserRepository
	verificationCodeRepository repository.VerificationCodeRepository
	refreshSessionRepository   repository.RefreshSessionRepository
	movieRepository            *repository.MovieRepository
	movieCategoryRepository    *repository.MovieCategoryRepository
	castRepository             *repository.CastRepository
	movieDetailRepository      *repository.MovieDetailRepository
	subtitleRepository         *repository.SubtitleRepository
	playerProviderRepository   *repository.PlayerProviderRepository
	downloadOptionRepository   *repository.DownloadOptionRepository

	// Services
	userService           service.UserService
	authService           service.AuthService
	movieService          *service.MovieService
	movieCategoryService  *service.MovieCategoryService
	castService           *service.CastService
	movieDetailService    *service.MovieDetailService
	subtitleService       *service.SubtitleService
	playerProviderService *service.PlayerProviderService
	downloadOptionService *service.DownloadOptionService

	// Handlers
	healthHandler         *handler.HealthHandler
	authHandler           *handler.AuthHandler
	userHandler           *handler.UserHandler
	movieHandler          *handler.MovieHandler
	movieCategoryHandler  *handler.MovieCategoryHandler
	castHandler           *handler.CastHandler
	movieDetailHandler    *handler.MovieDetailHandler
	subtitleHandler       *handler.SubtitleHandler
	playerProviderHandler *handler.PlayerProviderHandler
	downloadOptionHandler *handler.DownloadOptionHandler
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
		c.verificationCodeRepository = repository.NewPostgresVerificationCodeRepository(c.db)
		c.refreshSessionRepository = repository.NewPostgresRefreshSessionRepository(c.db)

		// Movie repositories
		c.movieRepository = repository.NewMovieRepository(c.db)
		c.movieCategoryRepository = repository.NewMovieCategoryRepository(c.db)
		c.castRepository = repository.NewCastRepository(c.db)
		c.movieDetailRepository = repository.NewMovieDetailRepository(c.db)
		c.subtitleRepository = repository.NewSubtitleRepository(c.db)
		c.playerProviderRepository = repository.NewPlayerProviderRepository(c.db)
		c.downloadOptionRepository = repository.NewDownloadOptionRepository(c.db)
	}
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	if c.userRepository != nil {
		c.userService = service.NewUserService(c.userRepository)
	}
	if c.userRepository != nil && c.verificationCodeRepository != nil && c.refreshSessionRepository != nil {
		c.authService = service.NewAuthService(c.userRepository, c.verificationCodeRepository, c.refreshSessionRepository)
	}

	// Movie services
	if c.movieRepository != nil {
		c.movieService = service.NewMovieService(c.movieRepository)
	}
	if c.movieCategoryRepository != nil {
		c.movieCategoryService = service.NewMovieCategoryService(c.movieCategoryRepository)
	}
	if c.castRepository != nil {
		c.castService = service.NewCastService(c.castRepository)
	}
	if c.movieDetailRepository != nil {
		c.movieDetailService = service.NewMovieDetailService(c.movieDetailRepository)
	}
	if c.subtitleRepository != nil {
		c.subtitleService = service.NewSubtitleService(c.subtitleRepository)
	}
	if c.playerProviderRepository != nil {
		c.playerProviderService = service.NewPlayerProviderService(c.playerProviderRepository)
	}
	if c.downloadOptionRepository != nil {
		c.downloadOptionService = service.NewDownloadOptionService(c.downloadOptionRepository)
	}
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

	// Movie handlers
	if c.movieService != nil {
		c.movieHandler = handler.NewMovieHandler(c.movieService)
	}
	if c.movieCategoryService != nil {
		c.movieCategoryHandler = handler.NewMovieCategoryHandler(c.movieCategoryService)
	}
	if c.castService != nil {
		c.castHandler = handler.NewCastHandler(c.castService)
	}
	if c.movieDetailService != nil {
		c.movieDetailHandler = handler.NewMovieDetailHandler(c.movieDetailService)
	}
	if c.subtitleService != nil {
		c.subtitleHandler = handler.NewSubtitleHandler(c.subtitleService)
	}
	if c.playerProviderService != nil {
		c.playerProviderHandler = handler.NewPlayerProviderHandler(c.playerProviderService)
	}
	if c.downloadOptionService != nil {
		c.downloadOptionHandler = handler.NewDownloadOptionHandler(c.downloadOptionService)
	}
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

func (c *Container) MovieHandler() *handler.MovieHandler {
	return c.movieHandler
}

func (c *Container) MovieCategoryHandler() *handler.MovieCategoryHandler {
	return c.movieCategoryHandler
}

func (c *Container) CastHandler() *handler.CastHandler {
	return c.castHandler
}

func (c *Container) MovieDetailHandler() *handler.MovieDetailHandler {
	return c.movieDetailHandler
}

func (c *Container) SubtitleHandler() *handler.SubtitleHandler {
	return c.subtitleHandler
}

func (c *Container) PlayerProviderHandler() *handler.PlayerProviderHandler {
	return c.playerProviderHandler
}

func (c *Container) DownloadOptionHandler() *handler.DownloadOptionHandler {
	return c.downloadOptionHandler
}

// Getters for services
func (c *Container) UserService() service.UserService {
	return c.userService
}

func (c *Container) AuthService() service.AuthService {
	return c.authService
}
