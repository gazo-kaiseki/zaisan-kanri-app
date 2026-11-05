/**
 * Service Worker。
 *
 * 目的は2つ。
 *   1. Android Chrome に「アプリをインストール」を出す（PWAの要件）
 *   2. 電波の届かない倉庫でもアプリ自体は起動できるようにする
 *
 * 方針:
 *   自分のファイル   … ネットワーク優先。デプロイ後に古い版が残らないようにする
 *   デコーダ(CDN)    … キャッシュ優先。バージョン固定なので安全で、起動が速くなる
 *   GAS API / 認証   … 一切キャッシュしない。古い台帳や認証結果を返すと事故になる
 */

const BUILD = '__BUILD__';
const CACHE = 'zaisan-' + BUILD;

const SHELL = [
  './',
  './index.html',
  './config.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* キャッシュしてはいけないホスト。台帳や認証はつねに最新を取る。 */
const NEVER_CACHE = [
  'script.google.com',
  'script.googleusercontent.com',
  'accounts.google.com',
  'oauth2.googleapis.com',
  'www.googleapis.com',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .catch(() => {})          // 1つでも失敗したらインストールごと失敗するのを避ける
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }

  if (NEVER_CACHE.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  if (url.origin === self.location.origin) {
    // ネットワーク優先。失敗したらキャッシュ、それも無ければアプリ本体を返す
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // 外部CDN（zxing-wasm など）はキャッシュ優先で、裏側で更新する
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
