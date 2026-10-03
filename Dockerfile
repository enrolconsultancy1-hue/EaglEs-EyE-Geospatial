# -----------------------------------------------------------------------------
# Stage 1: Build & Package Production Bundle
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm ci || npm install

# Copy source trees and config
COPY tsconfig.json vite.config.ts index.html ./
COPY server/ ./server/
COPY src/ ./src/
COPY public/ ./public/

# Build client bundle and compile server code
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy built distribution assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY tsconfig.json ./

# Expose HTTP API & static gateway
EXPOSE 3001

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api || exit 1

CMD ["node", "--import", "tsx", "server/index.ts"]
