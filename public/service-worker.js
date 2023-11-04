const installEvent = () => {
  self.addEventListener('install', () => {
    console.log('service worker installed');
  });
};
installEvent();

const activateEvent = () => {
  self.addEventListener('activate', () => {
    console.log('service worker activated');
  });
};
activateEvent();

self.addEventListener("message", (e) => {
  e.waitUntil(
    self.registration.showNotification("test", {
      body: "test body"
    })
  )
})