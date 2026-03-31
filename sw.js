// ==========================================
// SERVICE WORKER - PDI Perjuangan Meranti
// Handles background push notifications via FCM
// ==========================================

importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBSahPLj7pPM36Ktqr47sOhIJ4AhNh_yV0",
  authDomain: "partai-meranti.firebaseapp.com",
  projectId: "partai-meranti",
  storageBucket: "partai-meranti.appspot.com"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[sw] Background message received:', payload);

  const data = payload.data || {};
  const title = data.title || payload.notification?.title || 'PDI Perjuangan Meranti';
  const body = data.body || payload.notification?.body || 'Anda memiliki notifikasi baru';
  const icon = data.icon || '/favicon.ico';
  const badge = data.badge || '/favicon.ico';
  const tag = data.tag || data.tipe || 'general';
  const clickUrl = data.url || 'https://pdimeranti.web.app/';

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: tag,
    vibrate: [200, 100, 200],
    data: {
      url: clickUrl,
      tipe: data.tipe || 'general',
      docId: data.docId || ''
    }
  };

  self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[sw] Notification clicked:', event);
  event.notification.close();

  const url = event.notification.data?.url || 'https://pdimeranti.web.app/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If app already open, focus it
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('pdimeranti') !== -1 && 'focus' in client) {
          client.focus();
          return;
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Basic service worker lifecycle
self.addEventListener('install', function(event) {
  console.log('[sw] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[sw] Activated');
  event.waitUntil(clients.claim());
});
