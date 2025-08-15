# ---------- FRONTEND BUILD STAGE ----------
FROM node:20-alpine AS frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# ---------- BACKEND BUILD STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/server/package*.json ./backend/server/
RUN cd backend/server && npm ci --only=production

# Copy backend code
COPY backend/server/ ./backend/server/

# Copy frontend build into backend (to serve static files)
COPY --from=frontend /app/frontend/build ./backend/server/public

# Expose port (change if your server uses another port)
EXPOSE 8081

# Start the server
CMD ["node", "backend/server/server.js"]