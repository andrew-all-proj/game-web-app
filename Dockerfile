# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache git openssh && corepack enable || true
ENV YARN_NODE_LINKER=node-modules

RUN mkdir -p -m 700 /root/.ssh && ssh-keyscan github.com >> /root/.ssh/known_hosts

COPY package.json ./
COPY yarn.lock* ./
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn ./.yarn

RUN --mount=type=ssh \
  if [ -f .yarnrc.yml ]; then \
    yarn install --immutable; \
  else \
    yarn install --frozen-lockfile; \
  fi

FROM deps AS build
WORKDIR /app
COPY . .
RUN yarn build

FROM nginx:alpine AS runner

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]