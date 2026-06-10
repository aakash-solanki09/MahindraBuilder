# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY . .

RUN npm run build

# ---- Stage 2: Production ----
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/dist ./dist

# Create uploads directory (actual files mounted via Docker volume)
RUN mkdir -p /app/public/uploads

RUN npm ci --omit=dev --ignore-scripts

ENV NODE_ENV=production
ENV PORT=5011

EXPOSE 5011

CMD ["node", "dist/index.js"]
