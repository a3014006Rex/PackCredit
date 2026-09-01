# ---- Build Stage ----
FROM node:20 AS build-stage

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

# ---- Run Stage ----
FROM nginx:alpine AS run-stage

# Nginx 官方 entrypoint 會在容器啟動時以環境變數產生設定，API Key 不進入映像檔。
ENV PACKCREDIT_API_UPSTREAM=http://packcreditmanagement:8080 \
    PACKCREDIT_CLIENT_ID=packcredit-web-gateway
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy the built app from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080
