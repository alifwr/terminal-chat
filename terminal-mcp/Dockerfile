# Use Ubuntu as base image since we need to install native dependencies for node-pty
FROM node:lts-bullseye AS builder

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# # Install Node.js and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json .
RUN ls -al

# Install dependencies
RUN npm install
COPY . .

# Copy source code
RUN ls -al
RUN cat package.json

# Expose ports
# 8080 for web terminal server
# 8000 for supergateway (MCP server)
EXPOSE 8080
EXPOSE 8000

# Create a non-root user
# RUN useradd -m -u 1001 mcpuser
# USER mcpuser

# Start command
CMD ["npm", "run", "start"]
# CMD ["npx", "-y", "supergateway", "--stdio", "\"node", "src/index.js", "--both\"", "--port", "8000", "--baseUrl", "http://localhost:8000", "--ssePath", "/sse", "--messagePath", "/message"]