import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('TEST root and dedicated launcher choose F; explicit E and A/B remain selectable',()=>{
 const a=read('app.mjs');
 assert.match(a,/CP19_F_ROOT_DEFAULT=/);
 assert.match(a,/!new URLSearchParams\(globalThis.location\?\.search\|\|''\)\.has\('cp18'\)/);
 assert.match(a,/!new URLSearchParams\(globalThis.location\?\.search\|\|''\)\.has\('cp19'\)/);
 assert.match(a,/CP19_MODE=\(CP19_F_LAUNCH\|\|CP19_F_ROOT_DEFAULT\)\?'wav-keepalive'/);
 assert.match(a,/CP19F_UX\?'0\.8\.20\.8':'0\.8\.19\.4'/);
});
test('server and offline cache never return root for missing test-f.html',async()=>{
 const sw=read('sw.js');const h={};let currentResponse=null;
 const fakeCache={async match(request){if(typeof request==='string'&&request==='./')return new Response('OLD ROOT 0.8.19.2');return currentResponse},async put(){}};
 const sandbox={self:{location:{origin:'https://mastyukov-cyber.github.io'},addEventListener(type,fn){h[type]=fn}},caches:{open:async()=>fakeCache},URL,Response,fetch:async()=>new Response('NEW F 0.8.19.8')};
 vm.runInNewContext(sw,vm.createContext(sandbox));
 let promise;const req={url:'https://mastyukov-cyber.github.io/round-timer-pages-test/test-f.html',method:'GET',mode:'navigate'};
 h.fetch({request:req,respondWith(p){promise=p}});
 assert.equal(await (await promise).text(),'NEW F 0.8.19.8');
 sandbox.fetch=async()=>{throw Error('offline')};
 currentResponse=new Response('CACHED F 0.8.19.8');
 h.fetch({request:req,respondWith(p){promise=p}});
 assert.equal(await (await promise).text(),'CACHED F 0.8.19.8');
 currentResponse=null;
 h.fetch({request:req,respondWith(p){promise=p}});
 const missing=await promise;
 assert.equal(missing.status,503);
 assert.doesNotMatch(await missing.text(),/0\.8\.19\.2/);
});
test('offline root fallback remains supported',async()=>{
 const sw=read('sw.js');const h={};
 const cache={async match(q){return q==='./'?new Response('ROOT CACHED F'):null},async put(){}};
 const sandbox={self:{location:{origin:'https://mastyukov-cyber.github.io'},addEventListener(t,fn){h[t]=fn}},caches:{open:async()=>cache},URL,Response,fetch:async()=>{throw Error('offline')}};
 vm.runInNewContext(sw,vm.createContext(sandbox));
 let pending;h.fetch({request:{url:'https://mastyukov-cyber.github.io/round-timer-pages-test/',method:'GET',mode:'navigate'},respondWith(p){pending=p}});
 assert.equal(await (await pending).text(),'ROOT CACHED F');
});
