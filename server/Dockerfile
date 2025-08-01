# pty-service/Dockerfile.pty
FROM node:22-alpine AS builder

# Install build tools for native addons like 'node-pty'
RUN apk add --no-cache build-base python3

WORKDIR /app

COPY package*.json ./

# Install dependencies (will compile node-pty)
RUN npm ci

# Remove build tools to reduce final image size
RUN apk del build-base python3

# ----------------------------------
# Stage 2: Lean runtime image for PTY service
# ----------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime dependency for native addons
RUN apk add --no-cache libstdc++

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY index.js ./index.js

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 node_user

# Expose the PTY service port
EXPOSE 8080
ENV PTY_SERVICE_PORT=8080

# Change ownership and switch to non-root user
RUN chown -R node_user:nodejs .
USER node_user

CMD [ "node", "index.js" ]