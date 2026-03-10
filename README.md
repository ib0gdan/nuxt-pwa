# Vibe-Sync

Production-ready PWA приложение для напоминаний на Nuxt 4 с offline-first архитектурой, push-уведомлениями, Background Sync и Netlify Scheduled Functions.

## Стек

- Nuxt 4 + Vue 3 Composition API + TypeScript
- Pinia
- Tailwind CSS
- `@vite-pwa/nuxt` + Workbox
- Dexie (IndexedDB)
- Netlify Functions + Netlify Blobs
- Web Push (`web-push`)

## Быстрый старт

1. Установите зависимости:

```bash
yarn install
```

2. Создайте `.env` из шаблона:

```bash
cp .env.example .env
```

3. Сгенерируйте VAPID-ключи:

```bash
npx web-push generate-vapid-keys
```

4. Заполните переменные в `.env`:

```dotenv
NUXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PRIVATE_KEY=...
WEB_PUSH_SUBJECT=mailto:admin@vibe-sync.app
NUXT_PUBLIC_API_BASE=/api
NETLIFY_SITE_ID=...
NETLIFY_API_TOKEN=...
```

5. Запустите dev:

```bash
yarn dev
```

## Сборка

```bash
yarn build
```

Проверка сборки уже проходит успешно для текущего проекта.

## Деплой на Netlify

1. Подключите репозиторий в Netlify.
2. Build command: `yarn build && mkdir -p .netlify/static && cp -R node_modules/.cache/nuxt/.nuxt/dist/client/. .netlify/static && cp -R public/. .netlify/static`.
3. Publish directory: `.netlify/static`.
4. Functions directory: `netlify/functions` (уже задано в `netlify.toml`).
5. Добавьте env-переменные из `.env.example` в Netlify UI.
6. Убедитесь, что функция `sendReminder` доступна как Scheduled Function (каждую минуту).

## Как работают push-уведомления

1. В Settings пользователь нажимает включение push.
2. Браузер запрашивает разрешение и создаёт `PushSubscription`.
3. Подписка отправляется на `/api/push/subscribe` и сохраняется в Netlify Blobs.
4. Функция `netlify/functions/sendReminder.ts` каждую минуту:
   - читает reminders из Blobs,
   - фильтрует просроченные (`date + time <= now`),
   - отправляет push через VAPID.

## Как работает offline sync

1. Все изменения reminders сразу пишутся в IndexedDB.
2. Операции параллельно пишутся в offline queue.
3. При online или `background sync` клиент вызывает `/api/reminders/sync`.
4. Сервер применяет queued-операции и возвращает канонический список.
5. Клиент обновляет локальную базу и очищает синхронизированные операции.

## Структура

- `app/` — UI и роуты
- `components/`, `pages/`, `composables/`, `plugins/` — фронтенд-слой
- `stores/` — Pinia store
- `services/` — db/push/sync сервисы
- `types/`, `utils/` — типы и утилиты
- `server/` — API-эндпоинты Nuxt
- `netlify/functions/` — serverless + cron
