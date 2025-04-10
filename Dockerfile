# deploy frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY ./package*.json ./
RUN yarn install
COPY . .
RUN yarn build

# deploy Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]