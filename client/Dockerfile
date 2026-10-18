# Multi-stage Dockerfile for ResumeIQ Vite React Frontend

# Stage 1: Build Static Assets
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for Vite environment
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL must be provided" >&2 && exit 1)
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.27-alpine AS runner

# Configure unprivileged non-root nginx execution
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
