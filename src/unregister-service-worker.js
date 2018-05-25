export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistration('/service-worker.js').then(function (registration) {
      if (registration) {
        return registration.unregister();
      }
      return null;
    });
  } else {
    return Promise.resolve();
  }
}
