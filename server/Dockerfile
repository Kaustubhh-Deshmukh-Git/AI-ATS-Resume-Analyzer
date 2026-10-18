# Multi-stage Dockerfile for ResumeIQ Express API Server
# Production-ready, non-root user, minimal attack surface

# Stage 1: Dependencies
FROM node:22-alpine AS dependencies
WORKDIR /app

# Install build dependencies if needed (none required for pure JS/ESM)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Add curl for container healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production \
    PORT=5000

# Copy package info and production node_modules
COPY package.json ./
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code with non-root ownership
COPY --chown=node:node src/ ./src/

# Ensure application files are owned by non-root node user
RUN chown -R node:node /app

# Switch to standard non-root node user (UID 1000)
USER node

EXPOSE 5000

# Healthcheck targeting the hardened /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
