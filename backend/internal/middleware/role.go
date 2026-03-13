package middleware

import (
	"net/http"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/response"
)

// RequireRoles allows access only to users with one of the provided roles.
// It expects JWTMiddleware to run before this middleware and place user role in context.
func RequireRoles(allowedRoles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedRoles))
	for _, role := range allowedRoles {
		allowed[role] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := GetUserRoleFromContext(r.Context())
			if !ok || role == "" {
				apiErr := response.ForbiddenException("Forbidden", nil)
				response.HandleError(w, apiErr)
				return
			}

			if _, exists := allowed[role]; !exists {
				apiErr := response.ForbiddenException("Forbidden", nil)
				response.HandleError(w, apiErr)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
