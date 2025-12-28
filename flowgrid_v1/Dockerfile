# Multi-stage build for Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build frontend
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Multi-stage build for Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY server/package*.json ./
RUN npm ci

# Copy backend source
COPY server/ ./
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Copy backend built files
COPY --from=backend-builder /app/dist ./server/dist
COPY --from=backend-builder /app/package*.json ./server/
COPY --from=backend-builder /app/node_modules ./server/node_modules

# Copy frontend built files
COPY --from=frontend-builder /app/dist ./frontend/dist

# Copy nginx configuration
COPY nginx-docker.conf /etc/nginx/http.d/default.conf

# Create nginx directories
RUN mkdir -p /var/www/html /run/nginx

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
