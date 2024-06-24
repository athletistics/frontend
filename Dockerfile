# syntax=docker/dockerfile:1

# Stage 1: Build the Vite Vue.js app
FROM node:20 AS builder

ARG INFISICAL_TOKEN
ARG INFISICAL_API_URL
ARG INFISICAL_ENV
ENV INFISICAL_ENV=$INFISICAL_ENV
ENV INFISICAL_TOKEN=$INFISICAL_TOKEN
ENV INFISICAL_API_URL=$INFISICAL_API_URL

# Install infisical package
RUN apt-get update && apt-get install -y bash curl && curl -1sLf \
'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash \
&& apt-get update && apt-get install -y infisical

WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the project files
COPY . .

# Build the app
RUN infisical run --env=$INFISICAL_ENV --path="/frontend" -- npm run build

# Stage 2: Run Nginx with the built app
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Add new config compatible with Vue.JS
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
