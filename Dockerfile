# syntax=docker/dockerfile:1.7

############################
# 1) deps: устанавливаем зависимости (Yarn Berry ок)
############################
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable || true
ENV YARN_NODE_LINKER=node-modules

RUN mkdir -p -m 700 /root/.ssh && ssh-keyscan github.com >> /root/.ssh/known_hosts

COPY package.json ./
COPY yarn.lock* ./
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn ./.yarn

# Если приватные deps — добавь к build:  --ssh default
RUN --mount=type=ssh \
  if [ -f .yarnrc.yml ]; then \
    yarn install --immutable; \
  else \
    yarn install --frozen-lockfile; \
  fi

############################
# 2) build: собираем Vite (dist)
############################
FROM deps AS build
WORKDIR /app
COPY . .
RUN yarn build

############################
# 3) runtime: nginx со статикой
############################
FROM nginx:alpine AS runner
# свой конфиг nginx с fallback на index.html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# кладём сборку
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]