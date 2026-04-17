import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { getWatchedIdb, putWatchedIdb } from './utils/watchedDb';
import { parseEventList } from './utils/proxy';

clientsClaim();

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// SPA: serve index.html for all navigation requests except proxy/api
const navHandler = createHandlerBoundToURL('/index.html');
registerRoute(new NavigationRoute(navHandler, {
  denylist: [/^\/rr-proxy/, /^\/api/],
}));

// Cache regatta results — NetworkFirst so fresh data loads online, cached data loads offline
registerRoute(
  ({ url }) => url.pathname.startsWith('/rr-proxy'),
  new NetworkFirst({
    cacheName: 'rr-results',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 })],
  })
);

// Cache Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

// Cache Google Fonts files long-term
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
);

// ── Background push: wake ping received → check watched regattas ──────────────

self.addEventListener('push', event => {
  event.waitUntil(checkAllWatched());
});

async function checkAllWatched() {
  const watched = await getWatchedIdb();
  const toCheck = watched.filter(r => !r.notified);
  if (!toCheck.length) return;

  const updated = watched.map(r => ({ ...r }));
  const origin = self.registration.scope.replace(/\/$/, '');

  for (const item of toCheck) {
    try {
      const proxyPath = item.url.replace(/^https?:\/\/(www\.)?regattaresults\.co\.za/, '/rr-proxy');
      const fetchUrl = origin + proxyPath;
      const res = await fetch(fetchUrl);
      if (!res.ok) continue;
      const html = await res.text();
      const events = parseEventList(html, fetchUrl);

      if (item.eventId) {
        const ev = item.detailsUrl
          ? events.find(e => e.detailsUrl === item.detailsUrl)
          : events.find(e => e.eventId === item.eventId);
        if (ev?.status !== 'Official') continue;

        const idx = updated.findIndex(r => r.id === item.id);
        if (idx >= 0) updated[idx] = { ...updated[idx], notified: true };

        const notifPath = item.detailsUrl
          ? `/results/${item.raceId || item.id}?event=${encodeURIComponent(item.detailsUrl)}`
          : `/results/${item.raceId || item.id}`;
        await self.registration.showNotification(`Results: ${item.name}`, {
          body: 'Results have been posted.',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          data: { url: origin + notifPath },
        });
        continue;
      }

      const alreadyNotified = new Set(item.notifiedEvents || []);
      const newlyOfficial = events.filter(e => e.status === 'Official' && !alreadyNotified.has(e.eventId));
      if (!newlyOfficial.length) continue;

      const updatedNotified = [...alreadyNotified, ...newlyOfficial.map(e => e.eventId)];
      const allDone = events.every(e => e.status === 'Official');
      const idx = updated.findIndex(r => r.id === item.id);
      if (idx >= 0) updated[idx] = { ...updated[idx], notifiedEvents: updatedNotified, notified: allDone };

      const names = newlyOfficial.map(e => e.eventName);
      const label = names.length === 1 ? names[0] : `${names[0]} + ${names.length - 1} more`;
      const eventDetailUrl = newlyOfficial.length === 1 ? newlyOfficial[0].detailsUrl : null;
      const notifPath = eventDetailUrl
        ? `/results/${item.id}?event=${encodeURIComponent(eventDetailUrl)}`
        : `/results/${item.id}`;

      await self.registration.showNotification(`Results: ${label}`, {
        body: item.name,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        data: { url: origin + notifPath },
      });
    } catch {}
  }

  await putWatchedIdb(updated);
}

// Navigate to the race page when a push notification is tapped
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          if ('navigate' in client && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
