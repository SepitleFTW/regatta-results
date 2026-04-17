async function redis(cmd) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { subscription } = req.body || {};
  if (!subscription?.endpoint) return res.status(400).json({ error: 'missing subscription' });

  const { result: raw } = await redis(['GET', 'push_subs']);
  const subs = raw ? JSON.parse(raw) : [];
  if (!subs.find(s => s.endpoint === subscription.endpoint)) {
    subs.push(subscription);
    await redis(['SET', 'push_subs', JSON.stringify(subs)]);
  }
  return res.status(200).json({ ok: true });
}
