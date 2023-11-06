const installEvent = () => {
  self.addEventListener("install", () => {
    console.log("service worker installed");
  });
};
installEvent();

const activateEvent = () => {
  self.addEventListener("activate", () => {
    console.log("service worker activated");
  });
};
activateEvent();

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = JSON.parse(event.data.text());

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: "/favicon.ico",
        data: {
          url: data.url
        }
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  )
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) =>
        fetch("/api/subscription", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            oldEndpoint: event.oldSubscription.endpoint,
            subscription,
          }),
        })
      )
  );
});