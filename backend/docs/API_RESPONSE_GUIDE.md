# API Response Guidelines

This document outlines the standard way to send HTTP responses from the API using the `internal/pkg/response` package. This package provides a consistent JSON structure for all API responses.

## JSON Response Structure

All responses follow this format:

```json
{
  "success": true,
  "message": "A descriptive message",
  "data": {},    // Present on success
  "error": {}    // Present on failure (optional)
}
```

## Sending Successful Responses

To send a successful response (HTTP `200 OK`), use the `response.Success` function.

```go
import "github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
    user := map[string]string{"name": "John Doe"}
    response.Success(w, user, "User profile retrieved successfully")
}
```

## Handling Errors

The error handling strategy is designed to separate business logic errors from unexpected system errors. We use a custom `APIError` type for this.

### 1. Creating API Errors

When you encounter a predictable error (like invalid input or a resource not being found), create an `*APIError` using one of the helper functions from `api_error.go`. These functions map directly to HTTP status codes.

- `response.BadRequestException(msg, err)` (400)
- `response.UnauthorizedException(msg, err)` (401)
- `response.ForbiddenException(msg, err)` (403)
- `response.NotFoundException(msg, err)` (404)
- `response.ConflictException(msg, err)` (409)
- `response.UnprocessableEntityException(msg, err)` (422)
- `response.InternalServerException(msg, err)` (500)

### 2. Returning API Errors from Handlers

Your handler functions should return an `error`. If it's a known API error, return the `*APIError` you created.

```go
func GetMovie(id int) (*Movie, error) {
    movie, err := db.FindMovieByID(id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            // Return a structured API error for the client
            return nil, response.NotFoundException("Movie not found", err)
        }
        // Return a generic internal server error for unexpected DB issues
        return nil, response.InternalServerException("Database error", err)
    }
    return movie, nil
}
```

### 3. Centralized Error Handling

A central function or middleware should use `response.HandleError` to process the error returned from your business logic. This function inspects the error and sends the appropriate JSON response.

- If the error is an `*APIError`, it uses the status code and message from it.
- If it's any other type of error, it defaults to a generic `500 Internal Server Error` to avoid leaking implementation details.

```go
func MyHandler(w http.ResponseWriter, r *http.Request) {
    movie, err := GetMovie(123)
    if err != nil {
        response.HandleError(w, err) // Let HandleError do the work
        return
    }
    response.Success(w, movie, "Movie found")
}
```