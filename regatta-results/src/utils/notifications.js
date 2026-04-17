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
