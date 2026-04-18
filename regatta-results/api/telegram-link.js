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
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  // Store endpoint against token with 10-minute TTL
  await redis(['SETEX', `tglink:${token}`, 600, endpoint]);

  res.status(200).json({ token });
}
