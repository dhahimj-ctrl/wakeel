/* عامل الخدمة لتطبيق منصة الوكيل
   - الصفحة نفسها: من الشبكة أولاً (لتصل التحديثات فورًا)، ومن النسخة المحفوظة عند انقطاع الإنترنت.
   - مكتبات الخطوط والسكربتات الخارجية: تُحفظ لتسريع الفتح.
   - بيانات السحابة (Firebase) لا تُحفظ إطلاقًا. */
const CACHE = "wakeel-app-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const STATIC_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "www.gstatic.com"];
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, cp)); } return res; })
      .catch(() => caches.match(req.mode === "navigate" ? "./index.html" : req, { ignoreSearch: req.mode === "navigate" })));
    return;
  }
  if (STATIC_HOSTS.includes(url.hostname) && !/firestore|identitytoolkit|securetoken/.test(url.href)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; })));
  }
});
