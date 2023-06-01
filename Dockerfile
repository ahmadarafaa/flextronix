# Stage 1: Build Angular application
FROM node:16-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/ng-matero /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
CMD ["nginx", "-g", "daemon off;"]

