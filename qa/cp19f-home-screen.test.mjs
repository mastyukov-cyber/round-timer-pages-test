import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('dedicated F launch never depends on Safari query parameter',()=>{
 const m=JSON.parse(read('manifest-cp19f.webmanifest'));
 assert.equal(m.start_url,'./test-f.html');
 assert.equal(m.id,'./test-f.html');
 assert.equal(m.display,'standalone');
 assert.ok(!m.start_url.includes('?'));
 const app=read('app.mjs');
 assert.match(app,/CP19_F_LAUNCH=\(globalThis\.location\?\.pathname\|\|''\)\.endsWith\('\/test-f\.html'\)/);
 assert.match(app,/CP19_MODE=\(CP19_F_LAUNCH\|\|CP19_F_ROOT_DEFAULT\)\?'wav-keepalive':cp19Mode/);
});
test('install page has distinct app identity, title and F manifest',()=>{
 const html=read('test-f.html');
 assert.match(html,/href="\.\/manifest-cp19f\.webmanifest"/);
 assert.match(html,/content="Таймер F TEST"/);
 assert.match(html,/0\.8\.20\.5/);
 assert.match(html,/src="\.\/app\.mjs\?v=08205"/);
 assert.match(read('index.html'),/href="\.\/manifest\.webmanifest"/);
 assert.equal(JSON.parse(read('manifest.webmanifest')).start_url,'./');
});
test('offline cache includes F entrypoint and manifest with new cache identity',()=>{
 const sw=read('sw.js');
 for(const path of ['./test-f.html','./manifest-cp19f.webmanifest','./cp19-haptics.mjs','./sounds/cp19-wav/button.wav']){
  assert.ok(sw.includes(path),`missing ${path}`);
 }
 assert.match(sw,/round-timer-shell-v0\.8\.20\.5-test-settings-sync/);
 assert.match(sw,/cache\.addAll\(SHELL\)/);
});
test('F manifest and app are TEST-scoped and original WAV sound mode unchanged',()=>{
 const j=JSON.parse(read('preview-build.json'));
 assert.equal(j.production,false);
 assert.equal(j.cp19f_home.start_url,'./test-f.html');
 assert.equal(j.cp19f_home.mode,'wav-keepalive');
 assert.match(read('app.mjs'),/CP19F_UX\?'0\.8\.20\.5':'0\.8\.19\.4'/);
 assert.match(read('cp19-audio-modes.mjs'),/'wav-keepalive':Object\.freeze\(\{label:'WAV \+ Web Audio \+ prime \+ keep-alive'/);
});
