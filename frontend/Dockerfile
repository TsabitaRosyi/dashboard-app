# Stage 1: Build file React/JS
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json dan install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh file frontend dan jalankan proses build
COPY . .
RUN npm run build

# Stage 2: Sajikan menggunakan Nginx Web Server
FROM nginx:alpine

# Copy hasil build React dari Stage 1 ke folder HTML Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy konfigurasi Nginx kustom (proxy API & routing SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]