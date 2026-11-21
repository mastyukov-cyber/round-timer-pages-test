import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCP19Haptics} from '../cp19-haptics.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('safe haptics: no-op on iOS Safari where navigator.vibrate absent',()=>{
 const h=createCP19Haptics({navigatorRef:{}});
 assert.equal(h.supported,false);assert.equal(h.tap(),false);assert.equal(h.picker(),false);
});
test('haptics: short tap, picker tick and cooldown on supported browsers',()=>{
 let t=1000;const calls=[];
 const h=createCP19Haptics({navigatorRef:{vibrate(v){calls.push(v);return true;}},now:()=>t,cooldownMs:70});
 assert.equal(h.supported,true);assert.equal(h.tap(),true);assert.deepEqual(calls,[12]);
 t+=40;assert.equal(h.picker(),false);t+=50;assert.equal(h.picker(),true);
 assert.deepEqual(calls,[12,8]);
});
test('haptics never throw when vibrate rejects or returns false',()=>{
 for(const nav of [{vibrate(){throw Error('disabled')}},{vibrate(){return false;}}]){
  const h=createCP19Haptics({navigatorRef:nav});assert.equal(h.tap(),false);
 }
});
test('F-only visual profile has safe width fitting and matching CSS transforms',()=>{
 const app=read('app.mjs'),css=read('styles.css');
 assert.match(app,/CP19F_UX=CP19_MODE==='wav-keepalive'/);
 assert.match(app,/CP19F_UX\?1\.62/);assert.match(app,/CP19F_UX\?2\.45/);
 assert.match(css,/\.cp19f-ux \.clock\{transform:scale\(1\.62,4\.12\)/);
 assert.match(css,/\.cp19f-ux \.clock\{transform:scale\(2\.45,1\.85\)/);
 assert.match(app,/CP19F_UX\?\.987/);
 assert.match(css,/\.cp19f-ux \.settings-form select\{/);
 assert.match(css,/min-height:62px/);assert.match(css,/min-height:46px/);
});
test('select keeps native wheel, UX haptic only for F, no duplicate click audio',()=>{
 const app=read('app.mjs'),html=read('index.html');
 for(const id of ['workInput','restInput','roundsInput','prepareInput'])assert.match(html,new RegExp('<select id="'+id+'"'));
 assert.match(app,/cp19Haptics\?\.tap\(\)/);
 assert.match(app,/cp19Haptics\?\.picker\(\)/);
 assert.match(app,/event\.target\?\.tagName==='SELECT'/);
 assert.match(app,/const cp19Haptics=CP19F_UX\?/);
});
test('offline shell precaches new haptic module, keeps approved WAV assets',()=>{
 const sw=read('sw.js');
 assert.match(sw,/cp19-haptics\.mjs/);
 assert.match(sw,/round-timer-shell-v0\.8\.19\.8-test-cp19f-root-cachefix/);
 for(const sound of ['button','studio-gong-start','studio-gong-end','woodclack-single','woodclack-double'])assert.ok(sw.includes('sounds/cp19-wav/'+sound+'.wav'));
});
