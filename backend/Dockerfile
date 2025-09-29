# Dockerfile for the Go backend application

# --- Stage 1: Build ---
# Use the official Go image as a builder.
# Using a Go version that matches your go.mod file (>=1.25.1)
FROM golang:1.25-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to download dependencies first.
# This leverages Docker's layer caching.
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application as a static binary to run in a minimal image.
# CGO_ENABLED=0 is crucial for cross-compilation and static linking.
# -ldflags="-w -s" strips debug symbols, reducing the binary size.
RUN CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-w -s" -o /app/main ./cmd

# --- Stage 2: Final Image ---
# Use a minimal base image for the final container.
# alpine is a good choice for its small size.
FROM alpine:latest

# Add ca-certificates for making HTTPS requests (if your app needs to)
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the built executable from the builder stage
COPY --from=builder /app/main .

# Expose the port the app runs on (default is 3000 from your main.go)
EXPOSE 3000

# Command to run the executable. The app will use environment variables for configuration.
CMD ["./main"]