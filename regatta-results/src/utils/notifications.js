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

// Use service worker showNotification where available — more reliable on Android/iOS PWA
export async function showNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, { body, icon: '/favicon.svg' });
    } else {
      new Notification(title, { body, icon: '/favicon.svg' });
    }
  } catch {
    try { new Notification(title, { body }); } catch {}
  }
}
