import { useState, useEffect } from 'react';
import { toProxyUrl, parseEventList } from '../utils/proxy';
import { showNotification } from '../utils/notifications';

const STORAGE_KEY = 'regatta_watched';

export function getWatched() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function addWatched(item) {
  const list = getWatched();
  if (!list.find(r => r.id === item.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      ...list,
      { notified: false, ...item },
    ]));
  }
}

export function removeWatched(id) {
  const list = getWatched().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function isWatched(id) {
  return getWatched().some(r => r.id === id);
}

async function checkWatched(setAlerts) {
  const watched = getWatched().filter(r => !r.notified);
  if (!watched.length) return;

  for (const item of watched) {
    try {
      const proxyUrl = toProxyUrl(item.url);
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const html = await res.text();
      const events = parseEventList(html, proxyUrl);

      const hasResults = item.eventId
        ? events.find(e => e.eventId === item.eventId)?.status === 'Official'
        : events.some(e => e.status === 'Official');

      if (!hasResults) continue;

      const updated = getWatched().map(r => r.id === item.id ? { ...r, notified: true } : r);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setAlerts(prev => [...prev, { id: item.id, name: item.name, raceId: item.raceId }]);

      showNotification(`Results live: ${item.name}`, 'Results have been posted on Regatta Results SA.');
    } catch {}
  }
}

export function useResultsAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    checkWatched(setAlerts);
    const id = setInterval(() => checkWatched(setAlerts), 60000);
    return () => clearInterval(id);
  }, []);

  function dismiss(id) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return { alerts, dismiss };
}
