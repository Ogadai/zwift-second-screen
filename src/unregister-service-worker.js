export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    try {
      return navigator.serviceWorker.getRegistration('/service-worker.js').then(function (registration) {
        if (registration) {
          return registration.unregister();
        }
        return null;
      });
    } catch (e) {
    }
  }
  return Promise.resolve();
}
