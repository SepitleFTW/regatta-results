import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:sepitleleshilo642@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

async function redis(cmd) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

// Strip host/proxy prefix and decode percent-encoding so URLs compare equal
// e.g. "49_Heat%201.htm" (from HTML href) matches "49_Heat 1.htm" (stored by client)
function normUrl(url) {
  if (!url) return null;
  try {
    return decodeURIComponent(url)
      .replace(/^https?:\/\/(www\.)?regattaresults\.co\.za/, '')
      .replace(/^\/rr-proxy/, '');
  } catch {
    return url
      .replace(/^https?:\/\/(www\.)?regattaresults\.co\.za/, '')
      .replace(/^\/rr-proxy/, '');
  }
}

// Convert any URL (proxy or absolute) to an absolute https URL for server-side fetching
function toAbsolute(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://regattaresults.co.za${url.replace(/^\/rr-proxy/, '')}`;
}

// Server-side HTML parser — no DOMParser, pure regex
function parseEvents(html, pageUrl) {
  const baseDir = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
  const events = [];
  for (const trMatch of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const tds = [...trMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (tds.length < 7) continue;
    const eventName = tds[1];
    if (!eventName || /break/i.test(eventName)) continue;
    const tdHtmls = [...trMatch[1].matchAll(/<td[^>]*>[\s\S]*?<\/td>/gi)];
    // Scan all TDs for a link to a .htm result file (column position varies by regatta)
    let linkMatch = null;
    for (const td of tdHtmls) {
      const m = td[0].match(/href="([^"]*\.htm)"/i);
      if (m) { linkMatch = m; break; }
    }
    events.push({
      eventId: tds[0],
      eventName,
      status: tds[5],
      detailsUrl: linkMatch ? baseDir + linkMatch[1] : null,
    });
  }
  return events;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();

  const { result: raw } = await redis(['GET', 'push_subs']);
  const subs = raw ? JSON.parse(raw) : [];
  if (!subs.length) return res.status(200).json({ ok: true, sent: 0 });

  // Fetch each unique regatta URL once (unnotified push items only)
  const htmlCache = new Map();
  for (const sub of subs) {
    for (const item of (sub.watched || [])) {
      const absUrl = toAbsolute(item.url);
      if (!item.notified && absUrl && !htmlCache.has(absUrl)) {
        htmlCache.set(absUrl, null);
      }
    }
  }
  for (const url of htmlCache.keys()) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'RegattaResultsSA/1.0' } });
      if (r.ok) htmlCache.set(url, await r.text());
    } catch {}
  }

  const updatedSubs = subs.map(sub => ({ ...sub }));
  let sent = 0;
  const expired = [];

  for (let i = 0; i < updatedSubs.length; i++) {
    const sub = updatedSubs[i];
    const watched = (sub.watched || []).map(w => ({ ...w }));
    let changed = false;

    for (let j = 0; j < watched.length; j++) {
      const item = watched[j];
      if (item.notified) continue;
      const absUrl = toAbsolute(item.url);
      const html = htmlCache.get(absUrl);
      if (!html) continue;

      // Pass absolute URL so baseDir is correct when building detailsUrl
      const events = parseEvents(html, absUrl);

      if (item.eventId) {
        const ev = item.detailsUrl
          ? (events.find(e => e.detailsUrl && normUrl(e.detailsUrl) === normUrl(item.detailsUrl))
             ?? events.find(e => e.eventId === item.eventId))
          : events.find(e => e.eventId === item.eventId);
        if (ev?.status !== 'Official') continue;

        watched[j] = { ...item, notified: true };
        changed = true;

        const notifPath = item.detailsUrl
          ? `/results/${item.raceId || item.id}?event=${encodeURIComponent(item.detailsUrl)}`
          : `/results/${item.raceId || item.id}`;
        try {
          await webpush.sendNotification(sub.subscription, JSON.stringify({
            title: `Results: ${item.name}`,
            body: 'Results have been posted.',
            url: `${process.env.SITE_URL}${notifPath}`,
          }));
          sent++;
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.subscription?.endpoint);
        }
      } else {
        const alreadyNotified = new Set(item.notifiedEvents || []);
        const newlyOfficial = events.filter(e => e.status === 'Official' && !alreadyNotified.has(e.eventId));
        if (!newlyOfficial.length) continue;

        watched[j] = {
          ...item,
          notifiedEvents: [...alreadyNotified, ...newlyOfficial.map(e => e.eventId)],
          notified: events.every(e => e.status === 'Official'),
        };
        changed = true;

        const names = newlyOfficial.map(e => e.eventName);
        const label = names.length === 1 ? names[0] : `${names[0]} + ${names.length - 1} more`;
        const eventDetailUrl = newlyOfficial.length === 1 ? newlyOfficial[0].detailsUrl : null;
        const notifPath = eventDetailUrl
          ? `/results/${item.id}?event=${encodeURIComponent(eventDetailUrl)}`
          : `/results/${item.id}`;
        try {
          await webpush.sendNotification(sub.subscription, JSON.stringify({
            title: `Results: ${label}`,
            body: item.name,
            url: `${process.env.SITE_URL}${notifPath}`,
          }));
          sent++;
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.subscription?.endpoint);
        }
      }
    }

    if (changed) updatedSubs[i] = { ...sub, watched };
  }

  const remaining = updatedSubs.filter(s => !expired.includes(s.subscription?.endpoint));
  await redis(['SET', 'push_subs', JSON.stringify(remaining)]);

  // === Per-subscriber Telegram notifications ===
  // Only subscribers who linked via /link get notified, and only for their own watched events.
  // Tracked per (event + chatId) so missed notifications are retried on the next cron run.
  const { result: tNotifRaw } = await redis(['GET', 'telegram_notified']);
  const telegramNotified = new Set(tNotifRaw ? JSON.parse(tNotifRaw) : []);
  let telegramSent = 0;

  if (process.env.TELEGRAM_BOT_TOKEN) {
    for (const sub of updatedSubs) {
      if (!sub.telegramChatId) continue;
      const chatId = sub.telegramChatId;

      for (const item of (sub.watched || [])) {
        if (item.eventId) {
          if (!item.notified) continue;
          const key = (item.detailsUrl ? normUrl(item.detailsUrl) : normUrl(item.url) + ':' + item.eventId) + ':' + chatId;
          if (!key || telegramNotified.has(key)) continue;
          telegramNotified.add(key);

          const notifPath = item.detailsUrl
            ? `/results/${item.raceId || item.id}?event=${encodeURIComponent(item.detailsUrl)}`
            : `/results/${item.raceId || item.id}`;
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🚣 *Results: ${item.name}*\n\n[View Results](${process.env.SITE_URL}${notifPath})`,
              parse_mode: 'Markdown',
              disable_web_page_preview: false,
            }),
          }).catch(() => {});
          telegramSent++;
        } else {
          for (const evId of (item.notifiedEvents || [])) {
            const key = normUrl(item.url) + ':' + evId + ':' + chatId;
            if (telegramNotified.has(key)) continue;
            telegramNotified.add(key);

            const html = htmlCache.get(toAbsolute(item.url));
            const events = html ? parseEvents(html, toAbsolute(item.url)) : [];
            const ev = events.find(e => e.eventId === evId);
            const notifPath = ev?.detailsUrl
              ? `/results/${item.id}?event=${encodeURIComponent(ev.detailsUrl)}`
              : `/results/${item.id}`;
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `🚣 *Results: ${ev?.eventName || item.name}*\n\n[View Results](${process.env.SITE_URL}${notifPath})`,
                parse_mode: 'Markdown',
                disable_web_page_preview: false,
              }),
            }).catch(() => {});
            telegramSent++;
          }
        }
      }
    }
  }

  if (telegramSent > 0) {
    await redis(['SET', 'telegram_notified', JSON.stringify([...telegramNotified])]);
  }

  return res.status(200).json({ sent, removed: expired.length, checked: htmlCache.size, telegram: telegramSent });
}
