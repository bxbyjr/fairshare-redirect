// app.fairshare.social has moved to union42.net.
// Browsers that used the app at this address still have its old service worker and
// push sign-up, so they keep showing notifications under the old name. This file
// replaces that worker, cancels the old push sign-up, clears its cache and removes
// itself. After that, notifications come only from union42.net.
const NEW_ORIGIN = 'https://union42.net';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const sub = await self.registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    } catch (_) { /* nothing to cancel */ }
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    } catch (_) { /* no cache */ }
    await self.registration.unregister();
  })());
});

// A push can still land in the moment before the sign-up is cancelled. Show it
// (Safari requires that) and send the tap to the new address.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || 'Union', {
    body: data.body || '',
    data: { url: data.url || '/' },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const path = String(event.notification.data?.url || '/').replace(/^\.?\/?/, '/');
  event.waitUntil(clients.openWindow(NEW_ORIGIN + path));
});
