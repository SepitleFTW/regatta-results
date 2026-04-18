export default async function handler(req, res) {
  // Test Upstash connection
  let upstashOk = false;
  let upstashError = null;
  try {
    const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['PING']),
    });
    const data = await r.json();
    upstashOk = data.result === 'PONG';
    upstashError = upstashOk ? null : JSON.stringify(data);
  } catch (e) {
    upstashError = e.message;
  }

  // Check push_subs key
  let subCount = 0;
  try {
    const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['GET', 'push_subs']),
    });
    const data = await r.json();
    subCount = data.result ? JSON.parse(data.result).length : 0;
  } catch {}

  res.status(200).json({
    envVars: {
      hasUpstashUrl:   !!process.env.UPSTASH_REDIS_REST_URL,
      hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      hasVapidPublic:  !!process.env.VAPID_PUBLIC_KEY,
      hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
      hasCronSecret:   !!process.env.CRON_SECRET,
    },
    upstash: { connected: upstashOk, error: upstashError },
    pushSubscriptions: subCount,
  });
}
