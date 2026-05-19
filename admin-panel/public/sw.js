self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification!',
      icon: '/favicon.ico', // Replace with a high-res app icon if available
      badge: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        url: data.url || '/seller/dashboard/orders'
      },
      requireInteraction: true,
      actions: [
        {
          action: 'open_orders',
          title: 'View Order'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/seller/dashboard') && 'focus' in client) {
          // If the app is already open, focus it and possibly navigate
          return client.focus().then(() => client.navigate(urlToOpen));
        }
      }
      // If the app is not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
