import test from 'node:test';
import assert from 'node:assert/strict';
import {fitCP19Clock} from '../cp19-clock-fit.mjs';
import {wheelIndex} from '../cp19-wheel-picker.mjs';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('clock fitting respects measured width and height in portrait and landscape',()=>{
 for(const [w,h,p] of [[416,440,true],[897,255,false],[390,300,true],[844,200,false]]){
  const r=fitCP19Clock({width:w,height:h,rawWidth:300,portrait:p});
  assert.ok(Number.isFinite(r.fontSize)&&r.fontSize>=10);
  assert.ok(r.drawnWidth<=w*(p?.994:.987)+.01);
  assert.ok(r.drawnHeight<=h*.965+.01);
 }
});
test('new aspect ratio makes portrait digits visibly taller when width is limiting',()=>{
 const r=fitCP19Clock({width:416,height:600,rawWidth:300,portrait:true});
 const prev=(416*.987/(3*1.62))*4.12;
 assert.ok(r.drawnHeight>prev*1.06,{newHeight:r.drawnHeight,prev});
});
test('landscape clock fills increased allotted vertical frame without clipping',()=>{
 const r=fitCP19Clock({width:897,height:225,rawWidth:300,portrait:false});
 const prev=209*.975;
 assert.ok(r.drawnHeight>prev*1.04,{newHeight:r.drawnHeight,prev});
});
test('wheel scrolling clamps finite choices without skipping invalid values',()=>{
 assert.equal(wheelIndex(0,64,12),0);
 assert.equal(wheelIndex(3*64,64,12),3);
 assert.equal(wheelIndex(999999,64,12),11);
 assert.equal(wheelIndex(-100,64,12),0);
});
test('four inline scroll wheels preserve native select and update timer on scroll or arrows',()=>{
 const source=read('cp19-wheel-picker.mjs'),css=read('styles.css'),app=read('app.mjs');
 assert.match(source,/scroll\.addEventListener\('scroll'/);
 assert.match(source,/scroll\.addEventListener\('keydown'/);
 assert.match(source,/select\.value=select\.options\[n\]\.value/);
 assert.match(source,/select\.dispatchEvent\(new Event\('change'/);
 assert.match(source,/scroll\.scrollTop=idx\*h/);
 assert.match(css,/\.cp19f-inline-wheel\{/);
 assert.match(css,/scroll-snap-type:y mandatory/);
 assert.match(css,/\.cp19f-inline-center\{/);
 assert.match(app,/if\(CP19F_UX\)document\.addEventListener\('pointerdown'/);
});
test('service worker caches new UI modules for offline PWA and retains approved WAVs',()=>{
 const sw=read('sw.js');
 for(const x of ['cp19-clock-fit.mjs','cp19-wheel-picker.mjs','sounds/cp19-wav/button.wav','sounds/cp19-wav/studio-gong-start.wav']){
  assert.ok(sw.includes(x),x);
  assert.ok(existsSync(new URL('../'+x,import.meta.url)),x);
 }
 assert.match(sw,/round-timer-shell-v0\.8\.20\.5-test-settings-sync/);
});
