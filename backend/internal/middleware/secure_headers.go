package middleware

import (
	"net/http"
	"strings"
)

// SecureHeadersMiddleware adds security-related headers to the response
func SecureHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")

		// Swagger UI requires inline styles and scripts, so exclude it from strict CSP
		if !strings.HasPrefix(r.URL.Path, "/swagger") && !strings.HasPrefix(r.URL.Path, "/api/docs") {
			w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'")
		} else {
			// Allow inline styles and scripts for Swagger UI, and connections to localhost
			w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:* https://localhost:*")
		}

		next.ServeHTTP(w, r)
	})
}
