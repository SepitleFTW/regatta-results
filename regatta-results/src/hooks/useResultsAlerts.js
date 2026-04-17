import { useState, useEffect } from 'react';
import { toProxyUrl, parseEventList } from '../utils/proxy';
import { showNotification } from '../utils/notifications';

const STORAGE_KEY = 'regatta_watched';
const HISTORY_KEY = 'regatta_notif_history';

export function getWatched() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function addWatched(item) {
  const list = getWatched();
  if (!list.find(r => r.id === item.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      ...list,
      { notifiedEvents: [], notified: false, ...item },
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

// ── Notification history ──────────────────────────────────────────────────────

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveToHistory(title, body, url) {
  const history = getHistory();
  const entry = { id: `h_${Date.now()}_${Math.random().toString(36).slice(2)}`, title, body, url, timestamp: Date.now(), read: false };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...history].slice(0, 60)));
  window.dispatchEvent(new Event('regatta-notif'));
}

export function markAllHistoryRead() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().map(h => ({ ...h, read: true }))));
  window.dispatchEvent(new Event('regatta-notif'));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event('regatta-notif'));
}

// ── Polling ───────────────────────────────────────────────────────────────────

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

      // ── Event-level watch: fire once when that specific heat is Official ──
      if (item.eventId) {
        const ev = item.detailsUrl
          ? events.find(e => e.detailsUrl === item.detailsUrl)
          : events.find(e => e.eventId === item.eventId);
        if (ev?.status !== 'Official') continue;

        const updated = getWatched().map(r =>
          r.id === item.id ? { ...r, notified: true } : r
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        const notifPath = item.detailsUrl
          ? `/results/${item.raceId || item.id}?event=${encodeURIComponent(item.detailsUrl)}`
          : `/results/${item.raceId || item.id}`;
        const fullUrl = window.location.origin + notifPath;
        setAlerts(prev => [...prev, { id: item.id, name: item.name, raceId: item.raceId, url: item.url, eventDetailUrl: item.detailsUrl || null }]);
        saveToHistory(`Results: ${item.name}`, '', fullUrl);
        showNotification(`Results: ${item.name}`, 'Results have been posted on Regatta Results SA.', notifPath);
        continue;
      }

      // ── Race-level watch: fire for each newly-Official event ──
      const alreadyNotified = new Set(item.notifiedEvents || []);
      const newlyOfficial = events.filter(
        e => e.status === 'Official' && !alreadyNotified.has(e.eventId)
      );
      if (newlyOfficial.length === 0) continue;

      const updatedNotified = [...alreadyNotified, ...newlyOfficial.map(e => e.eventId)];
      const allDone = events.every(e => e.status === 'Official');

      const updated = getWatched().map(r =>
        r.id === item.id ? { ...r, notifiedEvents: updatedNotified, notified: allDone } : r
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      const names = newlyOfficial.map(e => e.eventName);
      const label = names.length === 1 ? names[0] : `${names[0]} + ${names.length - 1} more`;

      const alertId = `${item.id}__${Date.now()}`;
      const eventDetailUrl = newlyOfficial.length === 1 ? newlyOfficial[0].detailsUrl : null;
      const notifPath = eventDetailUrl
        ? `/results/${item.id}?event=${encodeURIComponent(eventDetailUrl)}`
        : `/results/${item.id}`;
      const fullUrl = window.location.origin + notifPath;

      setAlerts(prev => [...prev, { id: alertId, name: `${label} — ${item.name}`, raceId: item.id, url: item.url, eventDetailUrl }]);
      saveToHistory(`Results: ${label}`, item.name, fullUrl);
      showNotification(`Results: ${label}`, item.name, notifPath);
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
