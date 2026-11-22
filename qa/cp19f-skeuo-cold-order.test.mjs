import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('metallic wheel has opaque edge vignette and rim shading without blocking touches',()=>{
 const css=read('styles.css');
 assert.match(css,/CP19-F v0\.8\.20\.9 skeuomorphic/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel::before\{[\s\S]*?pointer-events:none;[\s\S]*?#0d111ac2 0%/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel::after\{[\s\S]*?pointer-events:none;[\s\S]*?inset 7px 0 10px/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-center\{[\s\S]*?linear-gradient\(180deg/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-option\.is-current\{[\s\S]*?text-shadow/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:46px;width:96%/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:36px/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:26px/);
});
test('global cold audio prime defers to the direct button/summary gesture; wheel primes normally',()=>{
 const app=read('app.mjs');
 const start=app.indexOf('function cp19Gesture(event){'),end=app.indexOf("if(CP19?.prime)document.addEventListener('pointerdown',cp19Gesture",start);
 assert.ok(start>=0&&end>start,'gesture definition present');
 let created=0,primed=0,unlocked=0;
 const ctx={CP19:{prime:true},CP19F_UX:true,document:{hidden:false},soundEnabled:true,
  audioContext:null,window:{AudioContext:class{constructor(){created++}get state(){return 'suspended'}}},
  webRetirement:{retire(){throw Error('unexpected retirement')}},
  cp19PrimeAudio(){primed++},unlockAudio(){unlocked++;return Promise.resolve(true)},
  audioGestureSeen:false};
 vm.runInNewContext(app.slice(start,end),ctx);
 const gesture=(control,switcher=false)=>({target:{closest(selector){
  if(selector==='#soundToggle')return switcher?{}:null;
  if(selector==='button,summary')return control?{}:null;
  return null;
 }}});
 ctx.cp19Gesture(gesture(true));
 assert.equal(created,0);
 assert.equal(primed,0);
 assert.equal(unlocked,0);
 ctx.cp19Gesture(gesture(false,true));
 assert.equal(unlocked,0);
 ctx.cp19Gesture(gesture(false));
 assert.equal(created,1);
 assert.equal(primed,1);
 assert.equal(unlocked,1);
 assert.equal(ctx.audioGestureSeen,true);
});
test('direct gesture fallback and start/pause safeguards remain in place',()=>{
 const app=read('app.mjs');
 assert.match(app,/if\(CP19&&\(!audioContext\|\|audioContext\.state!=='running'\|\|!soundBuffers\.button\)\)\{/);
 assert.match(app,/const accepted=cp19DirectGestureFallback\('button'\);\s*void Promise\.resolve\(unlockAudio\(\)\)/);
 assert.match(app,/stopActiveAudio\(\{preserveButton:isPreview,preserveMix:keepForegroundMix\(\)\}\)/);
 assert.match(app,/const maxLateMs=CP19\?0:/);
 assert.match(app,/if\(!CP19\|\|!soundEnabled\|\|document\.hidden\|\|audioInterruption\.interrupted\|\|!htmlSounds\)return false/);
});
test('landscape round count has 18 percent more sizing room, accurate ratio width fitting',()=>{
 const app=read('app.mjs'),css=read('styles.css');
 assert.match(app,/const shortLandscape=!portrait&&window\.innerHeight<=350/);
 assert.match(app,/CP19F_UX\?\(shortLandscape\?\.034:\.040\)/);
 assert.match(app,/const wordFactor=portrait\?1:CP19F_UX\?\(shortLandscape\?1\.65:2\)/);
 assert.match(app,/const countFactor=portrait\?4\.5:CP19F_UX\?\(shortLandscape\?6\.25:7\.5\)/);
 assert.match(app,/base\*wordFactor/);
 assert.match(app,/base\*countFactor/);
 assert.match(app,/const max=\(el\.round\.parentElement\.clientWidth\|\|window\.innerWidth\)\*\.94/);
 assert.match(css,/\.cp19f-ux \.round-count \{font-size:7\.5em;\}/);
 assert.match(css,/@media \(orientation:landscape\) and \(max-height:350px\)/);
});
test('approved TEST candidate retains unique 0.8.20.9 version and production:false',()=>{
 const app=read('app.mjs'),sw=read('sw.js'),manifest=JSON.parse(read('preview-build.json'));
 assert.match(app,/CP19F_UX\?'0\.8\.20\.9':'0\.8\.19\.4'/);
 assert.match(sw,/round-timer-shell-v0\.8\.20\.9-test-settings-sync/);
 assert.equal(manifest.production,false);
 assert.equal(manifest.version,'v0.8.20.9-skeuomorphic-wheels-landscape-first-tap-test');
});
