# Docker Setup for Sharebus Frontend

This guide helps you get started with running the Sharebus Frontend application in Docker, with special focus on hot-reload for development.

## Prerequisites

- Docker Desktop installed ([Get Docker](https://www.docker.com/products/docker-desktop/))
- Docker Compose installed (comes with Docker Desktop)
- Git repository cloned to your local machine

## Quick Start

### Start Development Environment

Run this command in the project root:

```bash
docker-compose up
```

This starts a development server at http://localhost:8080 with hot-reload enabled.

### Stop the Environment

Use this command to stop the running containers:

```bash
docker-compose down
```

## Hot-Reload Setup

The environment is configured to watch for file changes and automatically refresh your browser. When you edit files in:
- `src/` directory (components, views, etc.)
- `public/` directory (static assets)

Your changes will be reflected in the browser without manual refresh.

### Troubleshooting Hot-Reload

If hot-reload isn't working:

1. Check Docker logs for errors:
   ```bash
   docker-compose logs -f
   ```

2. Restart containers with a clean build:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

3. Clear browser cache with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

## Docker Configuration Explained

The project includes two main Docker files:

1. `Dockerfile` - Defines the container environment with Node.js
2. `docker-compose.yml` - Orchestrates the development setup

### Volume Mounting

We use two important volume mounts:
- `.:/app:delegated` - Maps your local project files to the container
- `/app/node_modules` - Keeps node_modules inside Docker for better performance

The `delegated` flag improves file system performance on macOS.

## Common Docker Commands

```bash
# Start in background mode
docker-compose up -d

# View container logs
docker-compose logs -f

# Rebuild containers after dependency changes
docker-compose up --build

# Open shell inside container
docker exec -it sharebus-frontend sh

# Check file changes inside container
docker exec -it sharebus-frontend ls -la /app/src/views
```

## Environment Variables

Environment variables are loaded from `.env.development.local` for local development.

For custom environments, you can:
1. Create different .env files (e.g., `.env.staging`)
2. Update docker-compose.yml to use your custom env file

## Additional Resources

- [Vue CLI Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vue.js Development with Docker](https://vuejs.org/guide/scaling-up/tooling.html)