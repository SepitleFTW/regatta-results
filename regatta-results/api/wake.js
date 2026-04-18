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

// Strip host/proxy prefix so client proxy URLs and server absolute URLs compare equal
function normUrl(url) {
  if (!url) return null;
  return url
    .replace(/^https?:\/\/(www\.)?regattaresults\.co\.za/, '')
    .replace(/^\/rr-proxy/, '');
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
    const linkMatch = tdHtmls[7] ? tdHtmls[7][0].match(/href="([^"]+)"/i) : null;
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

  // Fetch each unique regatta URL once
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
      const html = htmlCache.get(toAbsolute(item.url));
      if (!html) continue;

      const events = parseEvents(html, item.url);

      if (item.eventId) {
        const ev = item.detailsUrl
          ? events.find(e => normUrl(e.detailsUrl) === normUrl(item.detailsUrl))
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
            url: `https://regattaresults.co.za${notifPath}`,
          }));
          sent++;
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.subscription.endpoint);
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
            url: `https://regattaresults.co.za${notifPath}`,
          }));
          sent++;
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.subscription.endpoint);
        }
      }
    }

    if (changed) updatedSubs[i] = { ...sub, watched };
  }

  const remaining = updatedSubs.filter(s => !expired.includes(s.subscription.endpoint));
  await redis(['SET', 'push_subs', JSON.stringify(remaining)]);

  return res.status(200).json({ sent, removed: expired.length, checked: htmlCache.size });
}
