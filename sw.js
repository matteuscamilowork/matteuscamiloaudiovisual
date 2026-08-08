const CACHE_NAME='mc-v4';
const ASSETS=[
  'index.html',
  'sites.html',
  'briefing.html',
  'styles.css',
  'script.js',
  'i18n.js',
  'translations.js',
  'manifest.json',
  'sitemap.xml',
  'robots.txt',
  'Topo-fundo-OFC.png',
  'Rodape.png',
  'Depoimentos/Depoimento-01.png',
  'Depoimentos/Depoimento-02.png',
  'Depoimentos/Depoimento-03.png',
  'Depoimentos/Depoimento-04.png',
  'Depoimentos/Depoimento-05.png',
  'Depoimentos/Depoimento-06.png',
  'Depoimentos/Depoimento-07.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(v=>v!==CACHE_NAME).map(v=>caches.delete(v)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||e.request.url.includes('formspree.io'))return;
  e.respondWith(caches.match(e.request).then(r=>{
    if(r)return r;
    return fetch(e.request).then(res=>{
      if(res.ok&&new URL(e.request.url).origin===self.location.origin){
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
      }
      return res;
    }).catch(()=>caches.match('index.html'));
  }));
});
