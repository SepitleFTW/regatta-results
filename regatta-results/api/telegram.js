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
  const text = (message.text || '').trim();
  const textLower = text.toLowerCase();
  if (!chatId) return res.status(200).end();

  if (textLower.startsWith('/link ')) {
    const token = text.slice(6).trim().toUpperCase();
    const { result: endpoint } = await redis(['GET', `tglink:${token}`]);
    if (!endpoint) {
      await sendMessage(chatId, '❌ Invalid or expired code. Generate a new one from the app and try again.');
      return res.status(200).end();
    }

    // Find the push subscription matching this endpoint and attach chatId
    const { result: raw } = await redis(['GET', 'push_subs']);
    const subs = raw ? JSON.parse(raw) : [];
    const idx = subs.findIndex(s => s.subscription?.endpoint === endpoint);
    if (idx === -1) {
      await sendMessage(chatId, '❌ Push subscription not found. Make sure notifications are enabled in the app first.');
      return res.status(200).end();
    }

    subs[idx] = { ...subs[idx], telegramChatId: chatId };
    await redis(['SET', 'push_subs', JSON.stringify(subs)]);
    await redis(['DEL', `tglink:${token}`]);

    await sendMessage(chatId,
      '✅ *Linked!*\n\nYou\'ll now receive Telegram notifications only for the events you\'re watching in the app.\n\nSend /unlink to disconnect.'
    );
  } else if (textLower === '/unlink' || textLower === '/unsubscribe' || textLower === '/stop') {
    // Remove chatId from any push subscription that has it
    const { result: raw } = await redis(['GET', 'push_subs']);
    const subs = raw ? JSON.parse(raw) : [];
    const updated = subs.map(s => s.telegramChatId === chatId ? { ...s, telegramChatId: null } : s);
    await redis(['SET', 'push_subs', JSON.stringify(updated)]);
    await sendMessage(chatId, '❌ Unlinked. You won\'t receive any more Telegram notifications.');
  } else if (textLower === '/start' || textLower === '/subscribe') {
    await sendMessage(chatId,
      '🚣 *Regatta Results SA*\n\nTo get notified for *your* watched events:\n\n1. Open the app at regatta-results-58xd.vercel.app\n2. Tap *Link Telegram* in the footer\n3. Send the code you receive here using /link\n\nExample: `/link ABC123`'
    );
  } else {
    await sendMessage(chatId,
      '🚣 *Regatta Results SA*\n\n/link — connect to your watched events in the app\n/unlink — disconnect\n\nOr visit regatta-results-58xd.vercel.app'
    );
  }

  return res.status(200).end();
}
