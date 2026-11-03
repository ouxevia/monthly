// 서비스 워커: 인터넷이 끊겨도 마지막으로 받은 버전으로 사이트가 열리게 함
//
// - 사이트 파일(html · css · js · 아이콘 · 글꼴): 인터넷이 되면 항상 최신 파일을 받고 사본을 저장,
//   안 되면(또는 너무 느리면) 저장해 둔 사본을 씀 → 업데이트는 지금처럼 새로고침으로 바로 반영
// - 구글 글꼴 파일: 한 번 받으면 사본을 씀 (파일이 바뀌지 않음)
// - Supabase(로그인 · 동기화) 요청은 건드리지 않음: 플래너 데이터는 앱이 localStorage에 따로 저장

const CACHE = 'exam-monthly-v2';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css',
  'js/app.js', 'js/data.js', 'js/store.js', 'js/cloud.js', 'js/config.js', 'js/fonts.js',
  'js/vendor/supabase-2.116.0.js', 'js/vendor/html2canvas-1.4.1.min.js',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-32.png',
];
const SLOW_MS = 4000; // 인터넷이 이보다 느리면 저장된 사본을 먼저 보여 줌

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function save(req, res) {
  if (res && res.ok && res.type !== 'opaqueredirect') {
    const c = await caches.open(CACHE);
    await c.put(req, res.clone());
  }
  return res;
}

async function cached(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  // 페이지 주소로 들어오면(#로그인 정보 등) 저장된 첫 화면으로
  if (req.mode === 'navigate') return caches.match(new URL('./', self.registration.scope).href);
  return undefined;
}

// 최신 파일 우선, 실패하거나 느리면 사본
async function networkFirst(req) {
  const net = fetch(req).then((res) => save(req, res));
  const copy = await cached(req);
  if (!copy) return net;
  const slow = new Promise((resolve) => setTimeout(() => resolve(copy), SLOW_MS));
  return Promise.race([net.catch(() => copy), slow]);
}

// 사본 우선 (한 번 받으면 바뀌지 않는 구글 글꼴 파일)
async function cacheFirst(req) {
  const copy = await caches.match(req);
  return copy || fetch(req).then((res) => save(req, res));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.host === 'fonts.gstatic.com') { e.respondWith(cacheFirst(req)); return; }
  if (url.origin === self.location.origin || url.host === 'fonts.googleapis.com') e.respondWith(networkFirst(req));
});
