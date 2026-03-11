# Health Check & Swagger Documentation

## Health Check Endpoint

### Overview

The enhanced health check endpoint returns comprehensive information about the server's health including system metrics (CPU and RAM usage).

### Endpoint

```
GET /health
```

### Response

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "OK",
    "service": "sinhala-sub",
    "version": "v1.0.0",
    "timestamp": "2026-03-11T14:30:45.123Z",
    "metrics": {
      "cpu": {
        "usage_percent": 25.5,
        "cores": 4,
        "logical_cores": 8
      },
      "memory": {
        "total_bytes": 16777216000,
        "available_bytes": 8388608000,
        "used_bytes": 8388608000,
        "used_percent": 50.0,
        "free_bytes": 6291456000
      }
    }
  }
}
```

### Response Fields

#### Top Level
- `success` (boolean): Whether the request was successful
- `message` (string): Status message
- `data` (object): Health check data

#### Data Fields
- `status` (string): Overall server status ("OK", "DEGRADED", "DOWN")
- `service` (string): Service name
- `version` (string): API version
- `timestamp` (string): ISO 8601 formatted timestamp
- `metrics` (object): System performance metrics

#### CPU Metrics
- `usage_percent` (float): Current CPU usage percentage (0-100)
- `cores` (integer): Number of physical CPU cores
- `logical_cores` (integer): Number of logical CPU cores

#### Memory Metrics
- `total_bytes` (integer): Total system memory in bytes
- `available_bytes` (integer): Available memory in bytes
- `used_bytes` (integer): Used memory in bytes
- `used_percent` (float): Memory usage percentage (0-100)
- `free_bytes` (integer): Free memory in bytes

### Example Usage

#### Using curl

```bash
curl http://localhost:3000/health
```

#### Using Node.js

```javascript
fetch('http://localhost:3000/health')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### Using Python

```python
import requests

response = requests.get('http://localhost:3000/health')
print(response.json())
```

#### Using Go

```go
package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    resp, err := http.Get("http://localhost:3000/health")
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```

### Monitoring Use Cases

#### 1. Load Balancer Health Check
```bash
# Health check with timeout
curl --max-time 5 http://localhost:3000/health
```

#### 2. Automated Alerts

Set up alerts when:
- `metrics.cpu.usage_percent` > 80%
- `metrics.memory.used_percent` > 90%

#### 3. Performance Dashboard

Display the health metrics on a monitoring dashboard:
- Real-time CPU usage
- Memory consumption trends
- Server availability status

---

## Swagger / OpenAPI Documentation

### Overview

The API is fully documented with Swagger/OpenAPI 2.0 specification. You can access interactive API documentation and test endpoints directly from your browser.

### Access Swagger UI

Open your browser and navigate to:

```
http://localhost:3000/api/docs
```

Or alternatively:

```
http://localhost:3000/swagger/index.html
```

### Swagger Features

- **Interactive Documentation**: View all available endpoints
- **Request/Response Examples**: See example payloads
- **Try It Out**: Test endpoints directly from the UI
- **Parameter Documentation**: Understand required/optional parameters
- **Response Schemas**: View response structure and data types

### Available Swagger Endpoints

#### View Swagger UI
```
GET /api/docs
GET /swagger/index.html
```

#### Get Swagger JSON
```
GET /swagger/doc.json
```

#### Get Swagger YAML
```
GET /swagger/swagger.yaml
```

### Generating Swagger Documentation

The Swagger documentation is automatically generated from code annotations in the handler files.

#### View Current Annotations

```go
// Check handles GET /health requests
// @Summary Health Check
// @Description Get health status of the server with system metrics
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Server health status"
// @Router /health [get]
func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
    // Implementation...
}
```

#### Regenerate Documentation

When you add new endpoints or modify existing ones, regenerate the Swagger docs:

```bash
# Regenerate Swagger documentation
swag init -g cmd/main.go --output docs/swagger
```

### Swagger Comment Tags

Common Swagger documentation tags:

| Tag | Description | Example |
|-----|-------------|---------|
| `@Summary` | Short endpoint description | `@Summary Create User` |
| `@Description` | Detailed description | `@Description Create a new user account` |
| `@Tags` | Group related endpoints | `@Tags Users` |
| `@Accept` | Accepted content types | `@Accept json` |
| `@Produce` | Response content type | `@Produce json` |
| `@Param` | Request parameter | `@Param id path string true "User ID"` |
| `@Success` | Success response | `@Success 200 {object} User` |
| `@Failure` | Error response | `@Failure 404 {object} Error` |
| `@Router` | Route definition | `@Router /users/:id [get]` |

### Adding Documentation to New Endpoints

Example: Documenting a user creation endpoint

```go
// CreateUser handles POST /users requests
// @Summary Create User
// @Description Create a new user with the provided information
// @Tags Users
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "User data"
// @Success 201 {object} User "User created successfully"
// @Failure 400 {object} ErrorResponse "Invalid request"
// @Failure 409 {object} ErrorResponse "User already exists"
// @Router /users [post]
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    // Implementation...
}
```

### API Documentation Structure

#### Request Object Example

```go
// CreateUserRequest represents the request body for creating a user
// @Description User creation request
type CreateUserRequest struct {
    // User's full name
    // required: true
    Name string `json:"name"`
    
    // User's email address
    // required: true
    Email string `json:"email"`
    
    // User's password
    // required: true
    // minLength: 8
    Password string `json:"password"`
}
```

#### Response Object Example

```go
// User represents a user in the system
// @Description User object with all fields
type User struct {
    // Unique user identifier
    ID string `json:"id"`
    
    // User's name
    Name string `json:"name"`
    
    // User's email
    Email string `json:"email"`
    
    // User status (active, inactive, banned)
    Status string `json:"status"`
}
```

### Common Patterns

#### List Endpoint with Pagination

```go
// ListUsers handles GET /users requests
// @Summary List Users
// @Description Retrieve a list of users with pagination
// @Tags Users
// @Accept json
// @Produce json
// @Param limit query int false "Number of users to return" default(10)
// @Param offset query int false "Number of users to skip" default(0)
// @Success 200 {array} User "List of users"
// @Router /users [get]
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
    // Implementation...
}
```

#### Get Single Resource

```go
// GetByID handles GET /users/:id requests
// @Summary Get User by ID
// @Description Retrieve a specific user by their ID
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} User "User found"
// @Failure 404 {object} ErrorResponse "User not found"
// @Router /users/{id} [get]
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    // Implementation...
}
```

### Error Responses

All error responses follow a consistent structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

### Swagger File Locations

After generation, Swagger files are available at:

- **Swagger JSON**: `docs/swagger/swagger.json`
- **Swagger YAML**: `docs/swagger/swagger.yaml`
- **Auto-generated code**: `docs/swagger/docs.go`

### Customizing Swagger Documentation

Edit the main comment in `cmd/main.go`:

```go
// @title Sinhala Subtitle API
// @version 1.0.0
// @description This is the API for Sinhala Subtitle Backend service
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @host localhost:3000
// @BasePath /
// @schemes http https
```

### Security Documentation

For endpoints requiring authentication, add security tags:

```go
// @Security ApiKeyAuth
// @SecurityDefinitions ApiKeyAuth type apiKey name Authorization in header

// GetUser handles GET /users/:id requests
// @Summary Get User
// @Security ApiKeyAuth
// @Router /users/{id} [get]
func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    // Implementation...
}
```

---

## Integration with Development Workflow

### With Hot Reload (Air)

When using `air` for hot reload, Swagger docs are served dynamically:

1. Run `air` to start development
2. Make changes to handler files
3. Server automatically restarts
4. Swagger documentation is updated
5. Access `/api/docs` to see changes

### Regenerating on Code Changes

To keep Swagger docs in sync with code:

```bash
# Manual regeneration
swag init -g cmd/main.go --output docs/swagger

# Then restart the application
```

### CI/CD Integration

Add to your build pipeline:

```bash
# Validate code follows documentation
swag fmt

# Generate documentation
swag init -g cmd/main.go --output docs/swagger

# Build application
go build -o main ./cmd
```

---

## Testing with Swagger

### Using the Swagger UI to Test Endpoints

1. Open `http://localhost:3000/api/docs`
2. Find the endpoint you want to test
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"
6. View the response

### Using curl with Swagger Spec

Get all endpoint information:

```bash
# Get Swagger JSON
curl http://localhost:3000/swagger/doc.json | jq .

# Get specific endpoint info
curl http://localhost:3000/swagger/doc.json | jq '.paths."/health"'
```

---

## Best Practices

1. **Keep Documentation Updated**: Update comments when you change endpoints
2. **Use Clear Descriptions**: Make descriptions helpful and concise
3. **Document Error Cases**: Include failure responses with descriptions
4. **Include Examples**: Provide example request/response bodies
5. **Regenerate Regularly**: Keep Swagger docs in sync with code
6. **Test Endpoints**: Use Swagger UI to test during development
7. **Version Your API**: Update `@version` tag when API changes

---

## Troubleshooting

### Swagger UI not loading

```
Problem: Swagger UI shows blank page
Solution: Verify routes.go has correct Swagger handler setup
          Check that docs/swagger/docs.go exists
          Run: swag init -g cmd/main.go --output docs/swagger
```

### Documentation not updating

```
Problem: Code changes don't appear in Swagger
Solution: Regenerate documentation
          Command: swag init -g cmd/main.go --output docs/swagger
          Restart application
```

### Port conflicts

```
Problem: Cannot access Swagger at port 3000
Solution: Check PORT environment variable
          Edit .env and set correct PORT
          Verify port is not in use: lsof -i :3000
```

---

## Next Steps

1. **Access Swagger UI**: Open `http://localhost:3000/api/docs` when running the app
2. **Test Health Endpoint**: Try the `/health` endpoint from Swagger UI
3. **Add More Endpoints**: Document new endpoints with Swagger tags
4. **Integrate with Frontend**: Use the Swagger spec for API integration
5. **Set Up Monitoring**: Use health endpoint for load balancer checks
