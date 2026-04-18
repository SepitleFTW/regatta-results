# Telegram Bot Setup

This guide explains how to set up the Telegram bot so users can receive result notifications via Telegram.

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

### GitHub Actions (if still used)
No action needed — the token is only used by the Vercel API routes.

---

## 3. Register the webhook

Telegram needs to know where to send messages. Run this once in your browser (replace the placeholders):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/telegram
```

Example:
```
https://api.telegram.org/bot123456789:AAEafUX/setWebhook?url=https://regatta-results-58xd.vercel.app/api/telegram
```

You should get a response like:
```json
{ "ok": true, "description": "Webhook was set" }
```

---

## 4. Test the bot

1. Open Telegram and search for your bot by username
2. Send `/start` or `/subscribe`
3. You should receive: *"✅ Subscribed! You'll get a message here whenever regatta results are posted..."*

---

## 5. How it works

- When a user sends `/subscribe`, their chat ID is stored in Upstash Redis under the key `telegram_subs`
- The cron job (`/api/wake`) runs every 5 minutes via QStash
- When an event goes Official and hasn't been Telegram-notified yet, a message is sent to all subscribers
- Sent events are tracked in `telegram_notified` (Redis) to prevent duplicate messages
- Users can send `/unsubscribe` to stop receiving notifications

---

## 6. Verify it's working

Visit `/api/debug` on your site to check:
- `telegramSubscribers` — number of people subscribed
- `upstash.connected` — Redis connection is working

---

## Commands supported

| Command | Action |
|---|---|
| `/start` or `/subscribe` | Subscribe to notifications |
| `/unsubscribe` or `/stop` | Unsubscribe |
| Anything else | Shows help message |
