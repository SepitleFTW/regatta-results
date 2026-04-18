async function redis(cmd) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

export default async function handler(req, res) {
  // Test Upstash connection
  let upstashOk = false;
  try {
    const d = await redis(['PING']);
    upstashOk = d.result === 'PONG';
  } catch {}

  // Get subscriptions
  let subs = [];
  try {
    const d = await redis(['GET', 'push_subs']);
    subs = d.result ? JSON.parse(d.result) : [];
  } catch {}

  // Test fetching a regatta page directly
  let fetchOk = false;
  let fetchStatus = null;
  try {
    const r = await fetch('https://regattaresults.co.za/Results/Results2026/2026-april11-snr/results.htm', {
      headers: { 'User-Agent': 'RegattaResultsSA/1.0' },
    });
    fetchStatus = r.status;
    fetchOk = r.ok;
  } catch (e) {
    fetchStatus = e.message;
  }

  let telegramSubs = [];
  try {
    const d = await redis(['GET', 'telegram_subs']);
    telegramSubs = d.result ? JSON.parse(d.result) : [];
  } catch {}

  // Parse USSA Sprints page directly to diagnose matching failures
  let ussaParse = null;
  try {
    const r = await fetch('https://regattaresults.co.za/Results/Results2026/2026-april17-ussa/results.htm', {
      headers: { 'User-Agent': 'RegattaResultsSA/1.0' },
    });
    if (r.ok) {
      const html = await r.text();
      const baseDir = 'https://regattaresults.co.za/Results/Results2026/2026-april17-ussa/';
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
          tdCount: tds.length,
        });
      }
      ussaParse = { eventCount: events.length, events: events.filter(e => ['38','22','25','49','47'].includes(e.eventId)) };
    }
  } catch (e) {
    ussaParse = { error: e.message };
  }

  res.status(200).json({
    upstash: { connected: upstashOk },
    pushSubscriptions: subs.map(s => ({
      endpoint: s.subscription?.endpoint?.substring(0, 50) + '...',
      watchedCount: (s.watched || []).length,
      unwatchedCount: (s.watched || []).filter(w => !w.notified).length,
      unnotified: (s.watched || []).filter(w => !w.notified).map(w => ({ id: w.id, name: w.name, url: w.url, detailsUrl: w.detailsUrl, eventId: w.eventId })),
    })),
    telegramSubscribers: telegramSubs.length,
    directFetch: { ok: fetchOk, status: fetchStatus },
    ussaParse,
  });
}
