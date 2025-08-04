# ----------------------------------
# Stage 1: Build the application with native addon support
# ----------------------------------
FROM node:22-alpine AS builder

# Install build tools needed for native addons like 'node-pty'
# build-base includes essential tools like make, g++, etc.
# python3 is also required by node-gyp, the tool that compiles native addons.
RUN apk add --no-cache build-base python3

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install all dependencies, including compiling native addons
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run the build command. The 'postinstall' script 'nuxt prepare' is run automatically by 'npm ci'.
RUN npm run build

# ----------------------------------
# Stage 2: Create the lean production image
# ----------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# The 'node-pty' package, once compiled, has a runtime dependency on the C++ standard library.
# We must install it in our final image.
RUN apk add --no-cache libstdc++

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

# Copy only the built output from the 'builder' stage.
# This includes the compiled .output directory AND the production node_modules,
# which are necessary for native dependencies like 'node-pty'.
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules

# Set the node environment to production
ENV NODE_ENV=production

# --- Port Configuration ---
# Expose the HTTP port for the Nuxt app (default 3000)
EXPOSE 3000
ENV PORT=3000

# Expose the WebSocket port (8080)
EXPOSE 8080
ENV WEBSOCKET_PORT=8080

# The Nuxt server must listen on 0.0.0.0 to be accessible from outside the container
ENV NUXT_HOST=0.0.0.0

# Change ownership of the files to the non-root user
RUN chown -R nuxt:nodejs .

# Switch to the non-root user
USER nuxt

# The command to start the Nuxt server
CMD [ "node", ".output/server/index.mjs" ]