package utils

import (
	"strconv"
	"strings"
	"time"
)

// ParseDuration parses durations like "15m", "24h", and also supports a "d" suffix for days (e.g. "7d").
// If parsing fails, it returns fallback.
func ParseDuration(value string, fallback time.Duration) time.Duration {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}

	if strings.HasSuffix(value, "d") {
		nStr := strings.TrimSuffix(value, "d")
		n, err := strconv.Atoi(nStr)
		if err != nil || n <= 0 {
			return fallback
		}
		return time.Duration(n) * 24 * time.Hour
	}

	d, err := time.ParseDuration(value)
	if err != nil || d <= 0 {
		return fallback
	}
	return d
}
