# ── Stage 1 : build ──────────────────────────────────────────────────────────
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copier les sources (voir .dockerignore pour ce qui est exclu)
COPY . .

ENV VITE_BASE_PATH=/
RUN npm run build

# ── Stage 2 : serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS server

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
