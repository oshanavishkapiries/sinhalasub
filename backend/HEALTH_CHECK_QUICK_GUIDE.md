# Health Check & Swagger Quick Guide

## Health Check Endpoint

### Quick Test

```bash
curl http://localhost:3000/health
```

### Response Example

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

## Swagger / OpenAPI Documentation

### Access Swagger UI

**Browser:**
```
http://localhost:3000/api/docs
```

**Alternative:**
```
http://localhost:3000/swagger/index.html
```

### Get Swagger JSON

```bash
curl http://localhost:3000/swagger/doc.json
```

### What You Can Do in Swagger UI

1. **View all endpoints** - See complete API documentation
2. **Try endpoints** - Test endpoints directly from browser
3. **See examples** - View request/response examples
4. **Check parameters** - Understand what each parameter does

## Key Metrics Returned

### CPU Metrics
- `usage_percent` - Current CPU usage (0-100%)
- `cores` - Physical CPU cores
- `logical_cores` - Logical CPU cores

### Memory Metrics
- `total_bytes` - Total system RAM
- `used_bytes` - Currently used memory
- `used_percent` - Memory usage percentage (0-100%)
- `available_bytes` - Available memory
- `free_bytes` - Free memory

## Use Cases

### Monitor Server Health
```bash
# Check every 10 seconds
watch -n 10 'curl -s http://localhost:3000/health | jq ".data.metrics"'
```

### Check CPU Usage
```bash
curl -s http://localhost:3000/health | jq ".data.metrics.cpu.usage_percent"
```

### Check Memory Usage
```bash
curl -s http://localhost:3000/health | jq ".data.metrics.memory.used_percent"
```

### Load Balancer Health Check
```bash
# Check with 5 second timeout
curl --max-time 5 http://localhost:3000/health
```

## Development Workflow

1. Start the app with hot reload:
   ```bash
   air
   ```

2. View Swagger docs:
   ```
   Open: http://localhost:3000/api/docs
   ```

3. Test health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

4. Monitor system metrics:
   ```bash
   watch -n 5 'curl -s http://localhost:3000/health | jq ".data.metrics"'
   ```

## Files Generated

- `docs/swagger/docs.go` - Auto-generated Go code
- `docs/swagger/swagger.json` - API specification (JSON)
- `docs/swagger/swagger.yaml` - API specification (YAML)

## Regenerate Swagger Docs

When you add new endpoints or modify existing ones:

```bash
swag init -g cmd/main.go --output docs/swagger
```

## Commands Reference

```bash
# Start development
air

# Build project
go build -o main ./cmd

# Test health check
curl http://localhost:3000/health

# Test with pretty formatting
curl http://localhost:3000/health | jq

# Monitor metrics continuously
watch -n 5 'curl -s http://localhost:3000/health | jq ".data.metrics"'

# Get only CPU usage
curl -s http://localhost:3000/health | jq '.data.metrics.cpu'

# Get only memory usage
curl -s http://localhost:3000/health | jq '.data.metrics.memory'

# Regenerate Swagger docs
swag init -g cmd/main.go --output docs/swagger

# Access Swagger UI
open http://localhost:3000/api/docs
```

## Troubleshooting

### Health endpoint returns error
```bash
# Check if server is running
curl http://localhost:3000/health

# Check logs in terminal where you ran 'air'
```

### Swagger UI not loading
```bash
# Verify docs were generated
ls -la docs/swagger/

# Regenerate if missing
swag init -g cmd/main.go --output docs/swagger

# Restart with air
air
```

### Port already in use
```bash
# Change PORT in .env
echo "PORT=3001" > .env

# Restart with air
air
```

## Dependencies Added

- `github.com/shirou/gopsutil/v3` - System metrics (CPU, RAM)
- `github.com/swaggo/swag` - Swagger documentation generator
- `github.com/swaggo/http-swagger` - Swagger HTTP handlers

## Next Steps

1. Access Swagger at: `http://localhost:3000/api/docs`
2. Test health endpoint
3. Monitor system metrics
4. Add more endpoints with Swagger documentation
5. Set up monitoring/alerting based on health metrics
