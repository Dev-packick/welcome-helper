# Étape 1 — Build React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build de production
RUN npm run build

# Étape 2 — Servir avec Nginx
FROM nginx:alpine

# Copier le build dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration Nginx pour React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
