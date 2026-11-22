import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prewarmButtonFirst} from '../preview-audio-prewarm.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('both main TEST entrypoints load exactly one Graphite+Prewarm script and identical fixed layout',()=>{
 const root=read('index.html'),installed=read('test-f.html');
 const meta=JSON.parse(read('preview-build.json'));
 assert.equal(meta.version,'v0.8.20.14-main-graphite-prewarm-control-deck-test');
 assert.equal(meta.production,false);
 for(const html of [root,installed]){
  assert.match(html,/src="\.\/app-graphite-main-082014\.mjs\?v=082014"/);
  assert.match(html,/content="v0\.8\.20\.14-main-graphite-prewarm-test/);
  assert.ok(!html.includes('<script type="module" src="./app.mjs'));
  for(const name of ['styles.css','preview-variants-base.css','preview-graphite.css',
    'preview-graphite-v2.css','preview-graphite-deck.css','preview-graphite-main-082014.css'])
   assert.ok(html.includes('./'+name+'?v=082014'),name);
  for(const id of ['workInput','roundsInput','prepareInput','restInput','clock','roundCurrent','roundTotal',
    'startPauseButton','resetButton','soundToggle','settings','closeSettingsButton'])
   assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id+' repeated');
 }
 assert.match(root,/href="\.\/manifest\.webmanifest"/);
 assert.match(installed,/href="\.\/manifest-cp19f\.webmanifest"/);
});

test('root and dedicated install entry both activate trusted Graphite Prewarm, but not alternative CP18/CP19 experiments',()=>{
 const app=read('app-graphite-main-082014.mjs');
 assert.match(app,/const PREVIEW_MAIN_HOME=\/\(\?:\\\/\|\\\/index\\\.html\|\\\/test-f\\\.html\)\$\/\.test/);
 assert.match(app,/!new URLSearchParams\(globalThis\.location\?\.search\|\|''\)\.has\('cp18'\)/);
 assert.match(app,/!new URLSearchParams\(globalThis\.location\?\.search\|\|''\)\.has\('cp19'\)/);
 assert.match(app,/const PREVIEW_CONTROL_DECK=PREVIEW_VARIANT==='graphite-deck'\|\|PREVIEW_MAIN_HOME/);
 assert.match(app,/const PREVIEW_PREWARM=PREVIEW_CONTROL_DECK\|\|PREVIEW_VARIANT==='graphite-prewarm'/);
 assert.match(app,/PREVIEW_MAIN_HOME\?'0\.8\.20\.14-MAIN'/);
 assert.match(app,/CP19_MODE=\(CP19_F_LAUNCH\|\|CP19_F_ROOT_DEFAULT\)\?'wav-keepalive'/);
});

test('new main runtime preserves all sound, countdown and persisted settings from already approved Control Deck',()=>{
 const a=read('preview-graphite-deck-app.mjs');
 const b=read('app-graphite-main-082014.mjs');
 const get=(s,a,b)=>{
  const from=s.indexOf(a),to=s.indexOf(b,from+a.length);
  assert.ok(from>=0&&to>from,'missing code boundary '+a);
  return s.slice(from,to);
 };
 for(const [a0,b0] of [
  ['function preloadSounds(){','function sound(type){'],
  ['function buttonSound(){','// Pointerdown plays the button sound'],
  ['function fitClock(force=false){',"window.addEventListener('resize'"],
  ['function startPause(){','function reset(){'],
  ['function cp19DirectGestureFallback(type){','function buttonSound(){']
 ])assert.equal(get(a,a0,b0),get(b,a0,b0),a0);
 const normalize=s=>s.replace(/const PREVIEW_MAIN_HOME=[\s\S]*?;\n/,'')
  .replace(/const PREVIEW_CONTROL_DECK=[^\n]+/,'PREVIEW_CONTROL_DECK=X')
  .replace(/const CP19_VERSION=[^\n]+/,'CP19_VERSION=X');
 assert.equal(normalize(a),normalize(b),'only root alias and version can change');
 assert.match(b,/const SETTINGS_KEY=CP19F_UX\?'round-timer-cp19f-settings-v1'/);
 assert.match(b,/const SOUND_KEY='round-timer-cp19f-sound-toggle-v1'/);
 assert.match(b,/if\(PREVIEW_CONTROL_DECK\)el\.start\.dataset\.controlState=/);
});

test('first button sound is decoded before other sounds with no hidden taps or autoplay',async()=>{
 const app=read('app-graphite-main-082014.mjs');
 assert.match(app,/soundsLoading=\(PREVIEW_PREWARM\?prewarmButtonFirst\(soundEntries,decodeEntry\):/);
 assert.match(app,/const buffer=await context\.decodeAudioData\(raw\)/);
 assert.match(app,/const accepted=cp19DirectGestureFallback\('button'\)/);
 assert.doesNotMatch(app,/\.dispatchEvent\(new (?:PointerEvent|MouseEvent)/);
 let done,ready=new Promise(r=>{done=r}),order=[];
 const p=prewarmButtonFirst([['start','gong'],['button','button'],['end','end']],async([name])=>{
  order.push('begin:'+name);
  if(name==='button')await ready;
  order.push('end:'+name);
 });
 assert.deepEqual(order,['begin:button']);
 done();await p;
 assert.deepEqual(order.slice(0,2),['begin:button','end:button']);
 assert.equal(order.length,6);
});

test('landscape round label grows and moves down; already approved countdown size unchanged',()=>{
 const css=read('preview-graphite-main-082014.css');
 assert.match(css,/transform:translateY\(clamp\(9px,2\.1vh,14px\)\) scale\(1\.10\)/);
 assert.match(css,/max-height:350px/);
 assert.match(css,/transform:translateY\(5px\) scale\(1\.06\)/);
 assert.doesNotMatch(css,/font-size\s*:|\.clock\s*\{|\.clock-frame\s*\{|--wheel-row\s*:/);
 const base=read('preview-variants-clock-fit.mjs');
 assert.match(base,/const scaleX=portrait\?1\.79:2\.87/);
 assert.match(base,/const scaleY=portrait\?5\.20:2\.46/);
 const root=read('index.html');
 const n=root.indexOf('preview-graphite-v2.css?v=082014');
 const later=root.indexOf('preview-graphite-main-082014.css?v=082014');
 assert.ok(n>=0&&later>n,'new round-only CSS must take precedence over old round-line transform');
});

test('settings preserve approved Graphite A2 wheels, red limit marks and no enlarged round counter',()=>{
 const g=read('preview-graphite-v2.css'),base=read('preview-variants-base.css');
 assert.match(g,/margin-top:auto/);
 assert.match(base,/--wheel-row:44px;width:94%/);
 assert.match(base,/--wheel-row:34px/);
 assert.match(base,/--wheel-row:25px/);
 assert.match(base,/z-index:5;color:#e12b3f/);
 assert.match(base,/\.cp19f-ux \.round-count\{font-size:3\.75em;\}/);
 const metal=read('preview-graphite-deck.css');
 assert.match(metal,/data-control-state="pause"/);
 assert.match(metal,/#0aaf67/);
 assert.match(metal,/#eda52c/);
});

test('offline SW precaches the exact new root, F launcher, assets, fonts, originals and all WAVs',()=>{
 const sw=read('sw.js');
 assert.match(sw,/round-timer-shell-v0\.8\.20\.14-main-graphite-prewarm/);
 for(const url of [
  "'./'",'./index.html','./test-f.html','./manifest.webmanifest','./manifest-cp19f.webmanifest',
  './styles.css?v=082014','./preview-variants-base.css?v=082014',
  './preview-graphite.css?v=082014','./preview-graphite-v2.css?v=082014',
  './preview-graphite-deck.css?v=082014','./preview-graphite-main-082014.css?v=082014',
  './app-graphite-main-082014.mjs?v=082014','./app-graphite-main-082014.mjs',
  './preview-audio-prewarm.mjs','./preview-variants-clock-fit.mjs',
  './sounds/button.mp3','./sounds/cp19-wav/button.wav',
  './sounds/cp19-wav/studio-gong-start.wav','./sounds/cp19-wav/studio-gong-end.wav',
  './sounds/cp19-wav/woodclack-single.wav','./sounds/cp19-wav/woodclack-double.wav'
 ])assert.ok(sw.includes(url),'missing cache entry '+url);
 assert.match(sw,/cache\.addAll\(SHELL\)/);
 assert.match(sw,/skipWaiting\(\)/);
 assert.match(sw,/clients\.claim\(\)/);
 assert.match(sw,/event\.request\.mode === 'navigate'/);
 assert.match(sw,/cache\.match\(event\.request, \{ignoreSearch:true\}\)/);
});

test('historical FINAL and old experiments are not changed by test-only main deployment',()=>{
 const j=JSON.parse(read('preview-build.json'));
 assert.equal(j.production,false);
 assert.equal(j.cp19f_main_082014.scope,'TEST_MAIN_ONLY');
 assert.equal(j.cp19f_main_082014.physical_iphone_audio.includes('USER_REPORTED_GOOD'),true);
 assert.match(read('preview-graphite-deck.html'),/v0\.8\.20\.13-DECK/);
 assert.match(read('app.mjs'),/CP19F_UX\?'0\.8\.20\.9':'0\.8\.19\.4'/);
 assert.match(read('preview-graphite-prewarm.html'),/0\.8\.20\.12-PW/);
});
