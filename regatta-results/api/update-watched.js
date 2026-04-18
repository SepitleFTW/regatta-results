async function redis(cmd) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { endpoint, watched } = req.body || {};
  if (!endpoint || !Array.isArray(watched)) return res.status(400).json({ error: 'missing endpoint or watched' });

  const { result: raw } = await redis(['GET', 'push_subs']);
  const subs = raw ? JSON.parse(raw) : [];
  const idx = subs.findIndex(s => s.subscription?.endpoint === endpoint);
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], watched };
    await redis(['SET', 'push_subs', JSON.stringify(subs)]);
  }
  return res.status(200).json({ ok: true });
}
