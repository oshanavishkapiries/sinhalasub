# Docker Usage Guide

This guide explains how to build and run the Go backend application using Docker. Using Docker provides a consistent and isolated environment for the application, simplifying development and deployment.

## Prerequisites

Before you begin, ensure you have [Docker](https://www.docker.com/get-started) installed and running on your system.

## 1. Building the Docker Image

The `Dockerfile` in the `backend` directory is a multi-stage build file that compiles the Go application and creates a minimal, production-ready image.

To build the image, navigate to the `/home/oshanavishka06/sinhalasub/backend` directory in your terminal and run the following command:

```bash
docker build -t sinhalasub-backend .
```

*   `docker build`: The command to build an image from a Dockerfile.
*   `-t sinhalasub-backend`: This tags the image with the name `sinhalasub-backend`, making it easy to reference later.
*   `.`: This tells Docker to look for the `Dockerfile` in the current directory.

## 2. Running the Docker Container

Once the image is built, you can run it as a container. The application requires several environment variables to connect to the database and configure the server port.

You can pass these variables to the `docker run` command using the `-e` flag.

### Example Run Command

Here is a complete command to run the container. This command maps port `3000` on your local machine to port `3000` inside the container and sets the required environment variables.

```bash
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e DB_HOST=your_database_host \
  -e DB_USER=your_database_user \
  -e DB_PASS=your_database_password \
  --name sinhalasub-backend-container \
  sinhalasub-backend
```

*   `--rm`: Automatically removes the container when it exits.
*   `-p 3000:3000`: Maps port `3000` from your host machine to port `3000` in the container.
*   `-e VAR=value`: Sets an environment variable inside the container. **Remember to replace the placeholder values** with your actual database credentials.
*   `--name ...`: Gives your running container a memorable name.
*   `sinhalasub-backend`: The name of the image to run.