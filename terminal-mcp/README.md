# Unified Terminal Server - Docker Deployment

This project provides a unified terminal server with both MCP (Model Context Protocol) and Web SSH capabilities, packaged for easy deployment with Docker.

## Features

- Web-based SSH terminal client
- MCP server for integration with AI assistants like Claude Desktop
- Dockerized deployment for easy setup and portability

## Prerequisites

- Docker
- Docker Compose

## Deployment

### Using Docker Compose (Recommended)

1. Build and start the services:
   ```bash
   docker-compose up --build
   ```

2. Access the services:
   - Web Terminal: http://localhost:8080
   - MCP Server: http://localhost:8000

### Using Docker Directly

1. Build the Docker image:
   ```bash
   docker build -t unified-terminal-server .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 -p 8000:8000 unified-terminal-server
   ```

## Usage

### Web Terminal

1. Open your browser and navigate to http://localhost:8080
2. The web terminal will automatically connect to the SSH server configured in the application

### MCP Server

1. Configure your AI assistant (like Claude Desktop) to connect to the MCP server at http://localhost:8000
2. The MCP server can execute commands either locally or through the web terminal

## Configuration

The application can be configured through environment variables or by modifying the source code:

- SSH connection settings in `src/web-terminal/index.js`
- Port configurations in `src/index.js`

## Development

To develop with the Docker setup:

```bash
# Start in development mode with live reload
docker-compose up

# Access the container for debugging
docker-compose exec terminal-server /bin/bash
```

## Troubleshooting

If you encounter issues:

1. Check that the required ports (8080, 8000) are not already in use
2. Ensure Docker has sufficient permissions to bind to these ports
3. Check the container logs:
   ```bash
   docker-compose logs