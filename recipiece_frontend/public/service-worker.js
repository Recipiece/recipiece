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
}); //Activate the sw after install
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

// set up the push notification service
self.addEventListener("activate", async () => {
  const urlB64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  

  const applicationServerKey = urlB64ToUint8Array("BNwO_-PWSDeuulw1__wNQ7bESdUriIluXGCIiD4ZA35Qg0o1ini5ULnPEm3RpgRWXedG_KL4SlDAONPhBrCoqcY");
  const options = { applicationServerKey, userVisibleOnly: true };
  const subscription = await self.registration.pushManager.subscribe(options);
  console.log(subscription);
})

//listen for requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
});

self.addEventListener("push", (event) => {

})
