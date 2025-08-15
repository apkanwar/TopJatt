# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies with clean, repeatable lockfile install
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js needs these at runtime
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Only copy what the server needs to run
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# If you have next.config.js (or similar runtime files), include them:
COPY next.config.js ./

EXPOSE 3000
# Ensure your package.json has:  "start": "next start -p 3000 -H 0.0.0.0"
CMD ["npm", "start"]