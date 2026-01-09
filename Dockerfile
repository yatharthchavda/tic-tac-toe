# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./
RUN npm ci --only=production

# Copy frontend source and build
COPY client/ ./
RUN npm run build

# Stage 2: Setup Node.js Backend + Serve Frontend
FROM node:18-alpine
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy backend package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/client/dist ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Run the application
CMD ["node", "server.js"]