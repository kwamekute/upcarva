const CACHE_NAME = "upcarva";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
});

self.addEventListener("fetch", (event) => {
  // pass-through for now (no caching yet)
});