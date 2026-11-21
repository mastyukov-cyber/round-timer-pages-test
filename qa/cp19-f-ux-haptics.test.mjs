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
test('F uses visible clock fitting instead of canceled CSS scaling',()=>{
 const app=read('app.mjs'),css=read('styles.css');
 assert.match(app,/CP19F_UX=CP19_MODE==='wav-keepalive'/);
 assert.match(app,/fitCP19Clock\(/);
 assert.match(app,/el\.clock\.style\.transform=`scale\(/);
 assert.match(css,/\.cp19f-ux \.clock\{transform:scale\(1\.70,4\.64\)/);
 assert.match(css,/\.cp19f-ux \.clock\{transform:scale\(2\.85,2\.05\)/);
 assert.match(css,/\.cp19f-inline-wheel/);
 assert.match(css,/\.cp19f-inline-scroll/);
});
test('native selects remain authoritative and F gets a custom large wheel',()=>{
 const app=read('app.mjs'),html=read('index.html');
 for(const id of ['workInput','restInput','roundsInput','prepareInput'])assert.match(html,new RegExp('<select id="'+id+'"'));
 assert.match(app,/cp19Haptics\?\.tap\(\)/);
 assert.match(app,/cp19Haptics\?\.picker\(\)/);
 assert.match(app,/event\.target\?\.tagName==='SELECT'/);
 assert.match(app,/const cp19Haptics=CP19F_UX\?/);
 assert.match(app,/createCP19WheelPicker/);
 assert.match(read('cp19-wheel-picker.mjs'),/select.dispatchEvent\(new Event\('change'/);
});
test('offline shell precaches new haptic module, keeps approved WAV assets',()=>{
 const sw=read('sw.js');
 assert.match(sw,/cp19-haptics\.mjs/);
 assert.match(sw,/round-timer-shell-v0\.8\.20\.2-test-safari-wheel-touch/);
 for(const sound of ['button','studio-gong-start','studio-gong-end','woodclack-single','woodclack-double'])assert.ok(sw.includes('sounds/cp19-wav/'+sound+'.wav'));
});
