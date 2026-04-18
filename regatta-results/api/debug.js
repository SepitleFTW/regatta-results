export default function handler(req, res) {
  res.status(200).json({
    hasUpstashUrl:   !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasVapidPublic:  !!process.env.VAPID_PUBLIC_KEY,
    hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
    hasCronSecret:   !!process.env.CRON_SECRET,
  });
}
