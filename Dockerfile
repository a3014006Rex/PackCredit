# ---- Build Stage ----
FROM node:20 AS build-stage

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

# ---- Run Stage ----
FROM nginx:alpine AS run-stage

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080