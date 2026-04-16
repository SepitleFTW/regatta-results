import { useState, useEffect } from 'react';
import { toProxyUrl, parseEventList } from '../utils/proxy';

const STORAGE_KEY = 'regatta_watched';

export function getWatched() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function addWatched(race) {
  const list = getWatched();
  if (!list.find(r => r.id === race.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      ...list,
      { id: race.id, name: race.name, url: race.url, notified: false },
    ]));
  }
}

export function removeWatched(raceId) {
  const list = getWatched().filter(r => r.id !== raceId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function isWatched(raceId) {
  return getWatched().some(r => r.id === raceId);
}

export function useResultsAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const watched = getWatched().filter(r => !r.notified);
    if (!watched.length) return;

    watched.forEach(async ({ id, name, url }) => {
      try {
        const proxyUrl = toProxyUrl(url);
        const res = await fetch(proxyUrl);
        if (!res.ok) return;
        const html = await res.text();
        const events = parseEventList(html, proxyUrl);
        const hasResults = events.some(e => e.status === 'Official');
        if (!hasResults) return;

        const updated = getWatched().map(r => r.id === id ? { ...r, notified: true } : r);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setAlerts(prev => [...prev, { id, name }]);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Results live: ${name}`, {
            body: 'Race results have been posted on Regatta Results SA.',
            icon: '/favicon.ico',
          });
        }
      } catch {}
    });
  }, []);

  function dismiss(id) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return { alerts, dismiss };
}
