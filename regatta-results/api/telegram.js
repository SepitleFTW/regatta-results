async function redis(cmd) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: false }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body || {};
  if (!message) return res.status(200).end();

  const chatId = message.chat?.id;
  const text = (message.text || '').trim().toLowerCase();
  if (!chatId) return res.status(200).end();

  const { result: raw } = await redis(['GET', 'telegram_subs']);
  const subs = raw ? JSON.parse(raw) : [];

  if (text === '/start' || text === '/subscribe') {
    if (!subs.includes(chatId)) {
      subs.push(chatId);
      await redis(['SET', 'telegram_subs', JSON.stringify(subs)]);
    }
    await sendMessage(chatId,
      '✅ *Subscribed!*\n\nYou\'ll get a message here whenever regatta results are posted on regattaresults.co.za.\n\nSend /unsubscribe to stop.'
    );
  } else if (text === '/unsubscribe' || text === '/stop') {
    const updated = subs.filter(id => id !== chatId);
    await redis(['SET', 'telegram_subs', JSON.stringify(updated)]);
    await sendMessage(chatId, '❌ Unsubscribed. You won\'t receive any more notifications.');
  } else {
    await sendMessage(chatId,
      '🚣 *Regatta Results SA*\n\n/subscribe — get notified when results are posted\n/unsubscribe — stop notifications\n\nOr visit regattaresults.co.za'
    );
  }

  return res.status(200).end();
}
