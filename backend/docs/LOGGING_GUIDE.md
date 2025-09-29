# Logging Guidelines

This project uses a structured logging utility (`util/log.go`) to make console output clear and consistent. Logs include emojis and status labels to help visually scan results during development.

## Log Levels

* ✅ **Success** — for completed operations
* ❌ **Error** — when something fails
* ℹ️ **Info** — general state updates
* ⚠️ **Warning** — potential issues, not fatal

## Usage

Import the `util` package and call the relevant helper:

```go
import "myproject/util"

func main() {
    util.SuccessLog("User %s created", "Alice")
    util.ErrorLog("Failed to open file: %s", "config.yaml")
    util.InfoLog("Server started on port %d", 8080)
    util.WarnLog("Memory usage is high")
}
```

### Example Output

```
✅ SUCCESS: User Alice created
❌ ERROR: Failed to open file: config.yaml
ℹ️ INFO: Server started on port 8080
⚠️ WARNING: Memory usage is high
```

## Best Practices

* Use **Success** only for completed, important milestones.
* **Error** logs should include enough context to debug the failure (e.g., file path, function name).
* Reserve **Info** for meaningful state changes (server start, connection opened, etc.), not spammy details.
* Use **Warning** to flag risks that don’t stop execution but should be investigated.

---

This keeps logs human-readable and consistent across the project.
