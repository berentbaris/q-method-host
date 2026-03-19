FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies for both client and server
COPY package.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json ./server/

RUN cd client && npm ci && cd ../server && npm ci

# Copy source and build client
COPY client/ ./client/
COPY server/ ./server/

RUN cd client && npm run build

# --- Production image ---
FROM node:20-slim

WORKDIR /app

# Only copy what's needed at runtime
COPY --from=builder /app/server/ ./server/
COPY --from=builder /app/client/dist/ ./client/dist/

# Install production server deps only
RUN cd server && npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "server/index.js"]
