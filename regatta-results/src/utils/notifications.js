export function isIos() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isPwa() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    !!window.navigator.standalone;
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return await Notification.requestPermission();
}

function urlBase64ToUint8Array(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = 'BGbyZz4Z5VvUP6LlAsj8tzZ0by4VWh2jaOMx_kkXzbvx33Ofmu2OCQdp0gn45-KrN7oD-nsO1S9XxxkhaK9qU0A';

export async function subscribeToPush() {
  if (!('PushManager' in window) || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    });
  } catch {}
}

// Use service worker showNotification where available — more reliable on Android/iOS PWA.
// url is included in notification data so the SW notificationclick handler can navigate to it.
export async function showNotification(title, body, url = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const fullUrl = url.startsWith('http') ? url : (window.location.origin + url);
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, { body, icon: '/favicon.svg', data: { url: fullUrl } });
    } else {
      new Notification(title, { body, icon: '/favicon.svg' });
    }
  } catch {
    try { new Notification(title, { body }); } catch {}
  }
}
