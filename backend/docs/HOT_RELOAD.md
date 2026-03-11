# Hot Reload Development Guide

This guide explains how to set up and use hot reload for development.

## Overview

Hot reload automatically restarts your server when code changes are detected. This is enabled using the **Air** tool combined with our custom file watcher and restart manager.

There are two ways to run your project:
1. **Development Mode** (with hot reload) - Recommended for development
2. **Production Mode** (without hot reload) - For production

## Prerequisites

Install Air if you haven't already:

```bash
go install github.com/cosmtrek/air@latest
```

Verify installation:
```bash
air --version
```

## Development Mode (with Hot Reload)

### Option 1: Using Air (Recommended)

Air automatically rebuilds and restarts your application when files change.

```bash
# From the backend directory
air
```

Air will:
1. Watch for .go file changes
2. Rebuild the application
3. Restart the server automatically
4. Display build errors if they occur

**Configuration**: `.air.toml` (already configured)

### Option 2: Using Our Custom Watcher (Manual)

If you prefer not to use Air, you can use our custom file watcher:

1. Create a dev command file in `cmd/dev/main.go`:
```go
package main

import (
    "github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/restart"
    "github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

func main() {
    utils.LoadEnv()
    
    manager := restart.NewRestartManager(".")
    
    buildCmd := "go build -o ./tmp/main ./cmd"
    runCmd := "./tmp/main"
    
    if err := manager.StartWatching(".", buildCmd, runCmd); err != nil {
        utils.ErrorLog("Failed to start watcher: %s", err)
        return
    }
    
    manager.WaitForSignal()
}
```

2. Run it:
```bash
go run ./cmd/dev
```

## Production Mode (without Hot Reload)

For production, run the application directly without hot reload:

```bash
# Build the application
go build -o main ./cmd

# Run the application
./main
```

Or using Docker:

```bash
# Build Docker image
docker build -t sinhalasub-backend .

# Run Docker container
docker run -p 3000:3000 -e PORT=3000 sinhalasub-backend
```

## Environment Variables

Create or edit `.env` file in the backend directory:

```env
PORT=3000
# Add other environment variables as needed
```

See `.env.example` for all available options.

## Troubleshooting

### Air not detecting changes?

1. Check that Air is watching the correct directory
2. Verify file extensions in `.air.toml` include `.go`
3. Ensure files are in watched directories (not in ignored folders)

### Build errors?

1. Check the build errors displayed by Air or the terminal
2. Ensure all Go files are syntactically correct
3. Run `go mod tidy` to update dependencies

### Application not starting?

1. Check that port 3000 is not already in use
2. Verify the `.env` file exists and is valid
3. Check console output for error messages

### Too many file changes detected?

Air has debouncing built-in. If you're experiencing issues:
1. Increase `delay` in `.air.toml` (in milliseconds)
2. Check if generated files are being modified (add to exclude_regex)

## Recommended Workflow

1. **Start Air**:
   ```bash
   air
   ```

2. **Make code changes** - The server will restart automatically

3. **Test your changes** using:
   - HTTP client (curl, Postman, Thunder Client)
   - API testing tools
   - Browser for health check: `http://localhost:3000/health`

4. **Check logs** in the terminal for:
   - Build status
   - Server startup messages
   - Application logs

## Tips for Better Development Experience

1. **Use VS Code REST Client**:
   - Install "REST Client" extension
   - Create `requests.rest` file
   - Send requests directly from editor

2. **Monitor logs**:
   - Look for emoji indicators (✅ ℹ️ ⚠️ ❌)
   - Errors appear in red
   - Info messages appear in blue

3. **Fast iteration**:
   - Small, focused changes
   - Test incrementally
   - Use version control (git) frequently

4. **Browser DevTools**:
   - Use Network tab to see requests/responses
   - Check Application tab for any stored data

## File Watcher Behavior

The custom file watcher:
- **Watches**: All `.go` files
- **Ignores**: `.mod`, `.sum`, `.exe`, `.tmp` files
- **Ignores Directories**: `.git`, `.setting`, `node_modules`, `vendor`, `.vscode`, `.idea`
- **Poll Interval**: 1 second (configurable)
- **Debounce**: 1 second delay before rebuilding

## Advanced Configuration

### Customize Air Config

Edit `.air.toml`:

```toml
[build]
  delay = 1000              # Rebuild delay in ms
  cmd = "go build ..."      # Build command
  bin = "./tmp/main"        # Output binary path
  exclude_dir = [...]       # Directories to ignore
  include_extensions = []   # File extensions to watch
```

### Custom Watcher

Modify `internal/pkg/watcher/watcher.go`:
- Change poll interval
- Add/remove ignored directories
- Customize file extensions

## Common Commands

```bash
# Start development with hot reload
air

# Build for production
go build -o main ./cmd

# Run tests
go test ./...

# Format code
go fmt ./...

# Lint code
golangci-lint run

# View dependencies
go mod graph
```

## Performance Tips

1. Keep binary size small by using `CGO_ENABLED=0`
2. Use `-ldflags "-s -w"` to strip debug symbols
3. Profile memory/CPU if needed:
   ```bash
   go test -cpuprofile=cpu.prof -memprofile=mem.prof ./...
   ```

## Next Steps

- Implement actual database repositories
- Add database migrations
- Create comprehensive tests
- Set up CI/CD pipeline
