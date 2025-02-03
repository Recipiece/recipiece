/* eslint-disable no-restricted-globals */
const CACHE_NAME = "cache_sample";
const urlsToCache = ["index.html"];
const version = "v0.0.1"; //install sw at first time
//place to cache assets to speed up the loading time of web page
self.addEventListener("install", (event) => {
  console.log("sw install event");
  event.waitUntil(
    caches.open(version + CACHE_NAME).then((cache) => {
      console.log("opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

//Activate the sw after install
//Place where old caches are cleared
self.addEventListener("activate", (event) => {
  console.log("sw activate event");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.indexOf(version) !== 0;
          })
          .map(function (cachName) {
            return caches.delete(cachName);
          })
      )
    )
  );
});

//listen for requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const { tag, data } = event.notification;

  let destinationUrl = "";
  if (tag.startsWith("recipeShare")) {
    destinationUrl = `/recipe/view/${data.id}`;
  } else if (tag.startsWith("shoppingListShare")) {
    destinationUrl = `/shopping-list/${data.id}`;
  } else if (tag.startsWith("mealPlanShare")) {
    destinationUrl = `/meal-plan/view/${data.id}`;
  } else if (tag.startsWith("thawMeatTimer")) {
    destinationUrl = `/recipe/view/${data.id}`;
  }

  if (destinationUrl.length > 0) {
    event.waitUntil(self.clients.openWindow(destinationUrl));
  }

  event.notification.close();
});

self.addEventListener("push", (event) => {
  const eventJson = event.data?.json();
  if (eventJson) {
    const { title, ...restNotificationOptions } = eventJson;
    self.registration.showNotification(title, {
      icon: "./icon-512x512.png",
      ...restNotificationOptions,
    });
  }
});

// self.addEventListener("pushsubscriptionchange", (event) => {});
