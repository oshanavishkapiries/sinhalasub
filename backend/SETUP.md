# Development Setup and Quick Start

## Quick Start

### 1. Install Air for Hot Reload
```bash
go install github.com/cosmtrek/air@latest
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

### 3. Run with Hot Reload
```bash
air
```

The server starts on http://localhost:3000

## Project Architecture

**4-Layer Clean Architecture:**

```
Handler Layer (HTTP Controllers)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Domain Layer (Business Models)
```

## Directory Structure

- `internal/domain/` - Business models and entities
- `internal/handler/` - HTTP request handlers
- `internal/service/` - Business logic implementations
- `internal/repository/` - Data access interfaces
- `internal/config/` - Dependency injection
- `internal/pkg/` - Shared utilities (watcher, restart, response, etc)

## Documentation

- **ARCHITECTURE.md** - Detailed architecture guide and best practices
- **HOT_RELOAD.md** - Development setup and hot reload guide
- **API_RESPONSE_GUIDE.md** - API response patterns
- **ENV_GUIDELINES.md** - Environment configuration
- **DOCKER_GUIDE.md** - Docker deployment
- **LOGGING_GUIDE.md** - Logging guidelines

## Common Commands

```bash
# Development with hot reload
air

# Build for production
go build -o main ./cmd

# Run application
./main

# Test API
curl http://localhost:3000/health

# Format code
go fmt ./...

# Update dependencies
go mod tidy
```

## Key Features

- Layered architecture for scalability
- Hot reload development with Air
- Dependency injection container
- Centralized error handling
- Security middleware (CORS, Rate limiting, Secure headers)
- Custom file watcher and restart manager
- Structured logging with emoji indicators

## Next Steps

1. Read ARCHITECTURE.md for detailed architecture
2. Read HOT_RELOAD.md for development setup
3. Start Air: `air`
4. Make code changes - server restarts automatically
5. Test with: `curl http://localhost:3000/health`

Happy coding!
