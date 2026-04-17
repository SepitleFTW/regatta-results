import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:sepitleleshilo642@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

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
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const { result: raw } = await redis(['GET', 'push_subs']);
  const subs = raw ? JSON.parse(raw) : [];
  if (!subs.length) return res.status(200).json({ ok: true, sent: 0 });

  const expired = [];
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({ type: 'wake' }));
    } catch (e) {
      if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.endpoint);
    }
  }

  if (expired.length) {
    const remaining = subs.filter(s => !expired.includes(s.endpoint));
    await redis(['SET', 'push_subs', JSON.stringify(remaining)]);
  }

  return res.status(200).json({ sent: subs.length - expired.length, removed: expired.length });
}
