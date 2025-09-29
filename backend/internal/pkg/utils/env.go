package utils

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var requiredEnvs = []string{
	"PORT",
}


func LoadEnv() {
	
	err := godotenv.Load()
	if err != nil {
		ErrorLog("Error loading .env file")
	}

	missing := []string{}
	for _, key := range requiredEnvs {
		if os.Getenv(key) == "" {
			missing = append(missing, key)
		}
	}

	if len(missing) > 0 {
		ErrorLog("Missing required environment variables: %v", missing)
	}
}

func GetEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}

func GetEnvAsInt(key string, fallback int) int {
	valStr := os.Getenv(key)
	if valStr == "" {
		return fallback
	}
	val, err := strconv.Atoi(valStr)
	if err != nil {
		ErrorLog("Invalid int for %s: %v, using default %d", key, err, fallback)
		return fallback
	}
	return val
}

func GetEnvAsBool(key string, fallback bool) bool {
	valStr := os.Getenv(key)
	if valStr == "" {
		return fallback
	}
	val, err := strconv.ParseBool(valStr)
	if err != nil {
		ErrorLog("Invalid bool for %s: %v, using default %v", key, err, fallback)
		return fallback
	}
	return val
}

