// Service worker: lets the app open offline. Place next to the HTML files.
var C='plan-v7';
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(['./'])}).catch(function(){}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!=C}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function put(r,res){if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)})}return res}
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);
  if(/supabase\.co$/.test(u.hostname))return;                       // data always goes to the network
  if(u.origin===location.origin){                                    // pages: network first (4s), cache as fallback
    e.respondWith(new Promise(function(ok,no){var t=setTimeout(function(){no()},4000);fetch(r).then(function(x){clearTimeout(t);ok(x)},function(){clearTimeout(t);no()})})
      .then(function(x){return put(r,x)})
      .catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('./')})}));
  }else if(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.hostname)){   // libraries/fonts: cache first
    e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(x){return put(r,x)})}));
  }
});
