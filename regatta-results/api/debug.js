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

  res.status(200).json({
    upstash: { connected: upstashOk },
    pushSubscriptions: subs.map(s => ({
      endpoint: s.subscription?.endpoint?.substring(0, 50) + '...',
      watchedCount: (s.watched || []).length,
      unwatchedCount: (s.watched || []).filter(w => !w.notified).length,
      unnotified: (s.watched || []).filter(w => !w.notified).map(w => ({ id: w.id, name: w.name })),
    })),
    telegramSubscribers: telegramSubs.length,
    directFetch: { ok: fetchOk, status: fetchStatus },
  });
}
