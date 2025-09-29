# Environment Variables Guidelines

This project uses environment variables to configure runtime settings. This allows separation of configuration from code, making it easier to run in different environments (development, staging, production).

## 1. `.env` File

* Store local environment variables in a `.env` file at the project root.
* **Do not commit** `.env` with sensitive credentials to version control.

Example `.env`:

```
PORT=8080
DEBUG=true
DB_HOST=localhost
DB_USER=root
DB_PASS=secret
```

## 2. Required Environment Variables

The application expects the following variables to be defined:

| Variable  | Description                      |
| --------- | -------------------------------- |
| `PORT`    | Port for the server to listen on |
| `DB_HOST` | Database hostname                |
| `DB_USER` | Database username                |
| `DB_PASS` | Database password                |

If any of these are missing, the app will exit on startup.

## 3. Using Environment Variables in Code

* Import the `util` package (`config.go` or `env.go`) that handles loading and validating env variables.
* Call `LoadEnv()` once at startup.
* Use helper functions to safely retrieve variables:

```go
util.LoadEnv() // Load and validate required envs

port := util.GetEnv("PORT", "8080")
debug := util.GetEnvAsBool("DEBUG", false)
dbHost := util.GetEnv("DB_HOST", "localhost")
```

## 4. Best Practices

* **Defaults:** Always provide sensible defaults when possible.
* **Validation:** Use `LoadEnv()` to check required variables at startup.
* **Type Safety:** Use helper functions for integers and booleans (`GetEnvAsInt`, `GetEnvAsBool`).
* **Security:** Never commit secrets or production credentials. Use environment variables instead.
* **Consistency:** Keep variable names uppercase and underscore-separated.

## 5. Advanced Notes

* For production, consider using real environment variables instead of `.env` files.
* Environment variables can be overridden per environment (e.g., Docker, Kubernetes, CI/CD pipelines).

