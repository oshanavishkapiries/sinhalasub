# Layered Architecture Guide

This document describes the layered architecture used in this project.

## Architecture Overview

The project follows a **4-layer architecture** pattern, which is ideal for medium-scale applications:

```
┌─────────────────────────────────────┐
│      HTTP Handler/Controller Layer   │  (internal/handler)
│  - HTTP request/response handling    │
│  - Route handlers                    │
│  - Request validation                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Service/Business Logic Layer  │  (internal/service)
│  - Business rules                    │
│  - Data transformation               │
│  - Cross-cutting concerns            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Repository/Data Access Layer    │  (internal/repository)
│  - Database queries                  │
│  - Data persistence                  │
│  - Repository interfaces             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Domain/Entities Layer           │  (internal/domain)
│  - Business entities                 │
│  - Domain models                     │
│  - Value objects                     │
└─────────────────────────────────────┘
```

## Directory Structure

```
internal/
├── domain/                    # Domain Layer (Business Models)
│   ├── entities/             # Base entities with common fields
│   │   └── base.go          # BaseEntity with ID, timestamps, soft delete
│   └── models/              # Domain models for each feature
│       └── models.go        # User, Video, Subtitle models
│
├── repository/              # Repository Layer (Data Access)
│   └── repository.go        # Repository interfaces
│
├── service/                 # Service Layer (Business Logic)
│   └── service.go           # Service interfaces and implementations
│
├── handler/                 # Handler Layer (HTTP Controllers)
│   └── handler.go           # HTTP handlers for all features
│
├── middleware/              # Middleware Components
│   ├── cors.go
│   ├── secure_headers.go
│   └── rate_limit.go
│
├── infrastructure/          # Infrastructure Components
│   ├── database/            # Database configurations
│   └── cache/               # Cache implementations
│
├── config/                  # Configuration
│   └── container.go         # Dependency Injection Container
│
└── pkg/                     # Shared Utilities
    ├── response/            # Response handling
    ├── utils/               # Utility functions
    ├── watcher/             # File watcher for hot reload
    └── restart/             # Server restart manager
```

## Layer Responsibilities

### 1. Domain Layer (`internal/domain`)

**Responsibility**: Define business entities and domain models

**Files**:
- `entities/base.go` - Common entity structure with timestamps and soft delete
- `models/models.go` - Feature-specific models (User, Video, Subtitle)

**Key Points**:
- Pure data structures
- No business logic
- No external dependencies
- Serializable to JSON

**Example**:
```go
type User struct {
    entities.BaseEntity
    Name     string
    Email    string
    Password string // Never serialized
    Status   string
}
```

### 2. Repository Layer (`internal/repository`)

**Responsibility**: Define data access abstractions

**Files**:
- `repository.go` - Repository interfaces

**Key Points**:
- Interface-based design for loose coupling
- Abstracts database implementation details
- Enables dependency injection
- Supports unit testing with mocks

**Example**:
```go
type UserRepository interface {
    Create(ctx context.Context, user *models.User) error
    GetByID(ctx context.Context, id string) (*models.User, error)
    GetAll(ctx context.Context, limit, offset int) ([]*models.User, error)
}
```

### 3. Service Layer (`internal/service`)

**Responsibility**: Implement business logic and rules

**Files**:
- `service.go` - Service interfaces and implementations

**Key Points**:
- Contains all business logic
- Orchestrates repository operations
- Validates business rules
- Independent of HTTP framework

**Example**:
```go
type UserService interface {
    CreateUser(ctx context.Context, name, email, password string) (*models.User, error)
    ListUsers(ctx context.Context, limit, offset int) ([]*models.User, error)
}
```

### 4. Handler Layer (`internal/handler`)

**Responsibility**: Handle HTTP requests and responses

**Files**:
- `handler.go` - HTTP handlers for each feature

**Key Points**:
- Parse HTTP requests
- Call services for business logic
- Format HTTP responses
- Handle HTTP-specific concerns

**Example**:
```go
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    userID := chi.URLParam(r, "id")
    user, err := h.userService.GetUser(r.Context(), userID)
    response.Success(w, user, "User retrieved")
}
```

## Data Flow

### Request Flow
```
HTTP Request
    ↓
Handler (Parse & Validate)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Domain Model
    ↓
Database
```

### Response Flow
```
Database
    ↓
Domain Model
    ↓
Repository (Fetch)
    ↓
Service (Transform)
    ↓
Handler (Format)
    ↓
HTTP Response
```

## Adding New Features

Follow these steps to add a new feature:

### Step 1: Create Domain Model
```go
// internal/domain/models/models.go
type NewFeature struct {
    entities.BaseEntity
    Name    string
    Status  string
}
```

### Step 2: Create Repository Interface
```go
// internal/repository/repository.go
type NewFeatureRepository interface {
    Create(ctx context.Context, feature *models.NewFeature) error
    GetByID(ctx context.Context, id string) (*models.NewFeature, error)
    GetAll(ctx context.Context, limit, offset int) ([]*models.NewFeature, error)
}
```

### Step 3: Create Service Interface
```go
// internal/service/service.go
type NewFeatureService interface {
    CreateFeature(ctx context.Context, name string) (*models.NewFeature, error)
    GetFeature(ctx context.Context, id string) (*models.NewFeature, error)
    ListFeatures(ctx context.Context, limit, offset int) ([]*models.NewFeature, error)
}
```

### Step 4: Implement Service
```go
type newFeatureServiceImpl struct {
    repo repository.NewFeatureRepository
}

func NewNewFeatureService(repo repository.NewFeatureRepository) NewFeatureService {
    return &newFeatureServiceImpl{repo: repo}
}

func (s *newFeatureServiceImpl) CreateFeature(ctx context.Context, name string) (*models.NewFeature, error) {
    feature := &models.NewFeature{Name: name, Status: "active"}
    if err := s.repo.Create(ctx, feature); err != nil {
        return nil, err
    }
    return feature, nil
}
```

### Step 5: Create Handler
```go
// internal/handler/handler.go
type NewFeatureHandler struct {
    service service.NewFeatureService
}

func NewNewFeatureHandler(s service.NewFeatureService) *NewFeatureHandler {
    return &NewFeatureHandler{service: s}
}

func (h *NewFeatureHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    feature, err := h.service.GetFeature(r.Context(), id)
    if err != nil {
        apiErr := response.NotFoundException("Feature not found", err)
        response.HandleError(w, apiErr)
        return
    }
    response.Success(w, feature, "Feature retrieved")
}
```

### Step 6: Register in Container
```go
// internal/config/container.go
func (c *Container) initHandlers() {
    // ... existing handlers ...
    if c.newFeatureService != nil {
        c.newFeatureHandler = handler.NewNewFeatureHandler(c.newFeatureService)
    }
}
```

### Step 7: Add Routes
```go
// internal/app/routes.go
router.Get("/features/:id", container.NewFeatureHandler().GetByID)
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to unit test with mocks at each layer
3. **Scalability**: Easy to add new features without affecting existing code
4. **Maintainability**: Clear code organization makes it easier to find and fix bugs
5. **Reusability**: Services can be reused across different handlers
6. **Flexibility**: Easy to swap implementations (e.g., change database)

## Dependencies Between Layers

### Allowed Dependencies
- Handler → Service ✓
- Service → Repository ✓
- Repository → Domain ✓
- Service → Domain ✓
- Handler → Response ✓

### Forbidden Dependencies
- Domain → Service ✗
- Domain → Repository ✗
- Repository → Handler ✗
- Service → Handler ✗

## Best Practices

1. **Keep handlers thin**: Move business logic to services
2. **Use interfaces**: Always define repository and service interfaces
3. **Error handling**: Properly handle and propagate errors
4. **Validation**: Validate data at the handler level
5. **Logging**: Log important operations in services
6. **Context**: Always use context for cancellation and timeouts
7. **No God Objects**: Keep models focused and small
