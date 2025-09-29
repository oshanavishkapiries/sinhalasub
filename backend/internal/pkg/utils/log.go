package utils

import (
	"fmt"
)

// Log types with emojis
const (
	Success = "✅ SUCCESS"
	Error   = "❌ ERROR"
	Info    = "ℹ️ INFO"
	Warn    = "⚠️ WARNING"
)

func Log(status string, msg string, args ...interface{}) {
	formatted := fmt.Sprintf(msg, args...)
	fmt.Printf("%s: %s\n", status, formatted)
}

func SuccessLog(msg string, args ...interface{}) {
	Log(Success, msg, args...)
}

func ErrorLog(msg string, args ...interface{}) {
	Log(Error, msg, args...)
}

func InfoLog(msg string, args ...interface{}) {
	Log(Info, msg, args...)
}

func WarnLog(msg string, args ...interface{}) {
	Log(Warn, msg, args...)
}
