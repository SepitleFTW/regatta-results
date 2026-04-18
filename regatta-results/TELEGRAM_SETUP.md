# Telegram Bot Setup

This guide explains how to set up the Telegram bot for a new deployment of this project.

---

## 1. Create a bot via BotFather

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name (e.g. `Regatta Results SA`)
4. Choose a username ending in `bot` (e.g. `RegattaResultsSABot`)
5. BotFather will reply with your **bot token** — save it, it looks like `123456789:AAEafUX...`

---

## 2. Add the token to your environment variables

### Vercel
1. Go to your Vercel project → **Settings → Environment Variables**
2. Add: `TELEGRAM_BOT_TOKEN` = your token from step 1
3. Redeploy so the variable takes effect

---

## 3. Register the webhook

Telegram needs to know where to send messages. Open this URL in your browser (replace the placeholders):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/telegram
```

Example:
```
https://api.telegram.org/bot123456789:AAEafUX/setWebhook?url=https://regatta-results-58xd.vercel.app/api/telegram
```

You should get:
```json
{ "ok": true, "description": "Webhook was set" }
```

---

## 4. Test the bot

1. Open Telegram and search for your bot by username
2. Send `/start`
3. The bot should reply with instructions on how to link your account

---

## 5. How it works

- Users link their Telegram to their push subscription via a one-time token generated in the app (Footer → **Link Telegram**)
- Tapping **Link Telegram** calls `POST /api/telegram-link` with the push subscription endpoint, which stores a 6-char token in Redis with a 10-minute TTL
- The user sends `/link <TOKEN>` to the bot, which matches the token to the push subscription and stores `telegramChatId` on that subscription in `push_subs`
- The cron job (`/api/wake`) runs every 5 minutes via QStash
- When an event goes Official, wake.js sends Telegram only to subscribers whose push subscription is watching that specific event
- Sent events are tracked per `(event key + chatId)` in `telegram_notified` (Redis) to prevent duplicates

---

## 6. Verify it's working

Visit `/api/debug` on your site to check:
- `upstash.connected` — Redis connection is working
- `pushSubscriptions[].watchedCount` — watched items per subscriber

---

## Commands supported

| Command | Action |
|---|---|
| `/link <CODE>` | Link Telegram to your push subscription (code from the app) |
| `/unlink` | Disconnect and stop notifications |
| `/start` | Shows linking instructions |
| Anything else | Shows help message |
