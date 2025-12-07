# Game Web App

Веб-клиент игры с монстрами для Telegram Mini App. Приложение построено на React + TypeScript + Vite, использует MobX для стейта, Apollo Client/GraphQL для данных, Phaser для арен сражений и Socket.IO для онлайн обновлений обновлений.

## Требования

- Node.js 20+
- Yarn (рекомендуется через `corepack enable`)
- Настроенные API/Socket эндпоинты (см. переменные окружения)

## Настройка окружения

1. Скопируйте `.env.example` в `.env`.
2. Укажите адреса бэкенда:
   - `VITE_API_URL` — GraphQL endpoint.
   - `VITE_API_FILE` — базовый URL для загрузок/файлов.
   - `VITE_LOCAL` — флаг локального режима (true/false).
   - `VITE_SOCKET_URL` — адрес Socket.IO.

## Установка зависимостей

```bash
corepack enable          # при необходимости
yarn install
```

## Запуск в разработке

```bash
yarn start               # http://localhost:5173 по умолчанию
```

## Сборка и предпросмотр

```bash
yarn build               # сборка в dist/
yarn preview             # локальный предпросмотр production-сборки
```

## Качество кода

- `yarn lint` — ESLint.
- `yarn format` — Prettier.
- `yarn i18n:extract` — обновление ключей локализации.

## Запуск через Docker

```bash
docker build -t game-web-app \
  --build-arg VITE_API_URL=http://localhost:3000/graphql \
  --build-arg VITE_API_FILE=http://localhost:3000 \
  --build-arg VITE_LOCAL=true \
  --build-arg VITE_SOCKET_URL=http://localhost:3000/ \
  .

docker run -p 8080:80 game-web-app
```

Контейнер собирает фронт и отдаёт его через Nginx (`/health` возвращает 200 для проверки).
