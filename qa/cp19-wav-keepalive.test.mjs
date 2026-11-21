import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CP19_MODES,cp19Mode,cp19Paths} from '../cp19-audio-modes.mjs';
const src=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('F differs from user-approved E only in MP3/WAV codec',()=>{
 const e=CP19_MODES['mp3-keepalive'],f=CP19_MODES['wav-keepalive'];
 assert.equal(cp19Mode('?cp19=wav-keepalive'),'wav-keepalive');
 assert.equal(e.codec,'mp3');assert.equal(f.codec,'wav');
 for(const field of ['transport','prime','keepalive'])assert.equal(e[field],f[field]);
 assert.equal(e.transport,'web');assert.equal(e.prime,true);assert.equal(e.keepalive,true);
 const mp3=cp19Paths(e.codec),wav=cp19Paths(f.codec);
 for(const name of ['button','start','end','clack','double']){
  assert.match(mp3[name],/\.mp3$/);assert.match(wav[name],/\.wav$/);
  assert.equal(wav[name].replace('./sounds/cp19-wav/','./sounds/').replace(/\.wav$/,'.mp3'),mp3[name]);
 }
});
test('F adds a distinct version and separate stored session without affecting E',()=>{
 const app=src('app.mjs');
 assert.match(app,/CP19F_UX\?'0\.8\.20\.2':'0\.8\.19\.4'/);
 assert.match(app,/timer-active-session-cp19-\$\{CP19_MODE\}-v1/);
 assert.match(app,/\$\{CP19_VERSION\} · TEST \$\{CP19.label\}/);
 assert.match(app,/CP19\?150:3000/);
 assert.match(app,/kind==='button'\?\.1944/);
 assert.match(app,/type==='ten-double'\?\[0,\.478\]/);
});
test('F uses existing five verified WAV from offline shell, not worklet',()=>{
 const manifest=JSON.parse(src('cp19-wav-manifest.json'));
 assert.equal(manifest.files.length,5);
 const shell=src('sw.js');
 assert.match(shell,/round-timer-shell-v0\.8\.20\.2-test-safari-wheel-touch/);
 for(const file of manifest.files)assert.ok(shell.includes(`./sounds/cp19-wav/${file.wav}`));
 assert.equal(CP19_MODES['wav-keepalive'].transport,'web');
});
test('TEST manifest exposes F as non-production and preserves E comparison',()=>{
 const m=JSON.parse(src('preview-build.json'));
 assert.equal(m.production,false);
 assert.equal(m.cp19_variants.length,6);
 assert.ok(m.cp19_variants.some(x=>x.name==='mp3-keepalive'));
 assert.ok(m.cp19_variants.some(x=>x.name==='wav-keepalive'));
 assert.equal(m.version,'v0.8.20.2-safari-wheel-touch-test');
});
