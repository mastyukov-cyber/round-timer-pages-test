import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ensureAmbientAudioSession} from '../preview-ambient-audio-session.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('MAIN 0.8.20.15: root + installed F have correct program, Graphite and PWA manifests',()=>{
 const meta=JSON.parse(read('preview-build.json'));
 assert.equal(meta.version,'v0.8.20.15-main-graphite-ambient-music-test');
 assert.equal(meta.production,false);
 for(const html of [read('index.html'),read('test-f.html')]){
  assert.match(html,/src="\.\/app-graphite-main-082015\.mjs\?v=082015"/);
  assert.match(html,/preview-graphite-musicfix\.css\?v=082015/);
  assert.match(html,/content="v0\.8\.20\.15-main-graphite-ambient-test/);
  assert.match(html,/preview-graphite-deck\.css\?v=082014/);
  for(const id of ['workInput','roundsInput','prepareInput','restInput','clock','roundCurrent','roundTotal','settings','startPauseButton','resetButton','soundToggle'])
   assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 assert.match(read('index.html'),/href="\.\/manifest\.webmanifest"/);
 assert.match(read('test-f.html'),/href="\.\/manifest-cp19f\.webmanifest"/);
});

test('MAIN 0.8.20.15 is byte-equivalent to tested audio pilot, except enabling on root/test-f and version',()=>{
 const pil=read('preview-graphite-musicfix-app.mjs');
 const main=read('app-graphite-main-082015.mjs');
 let expected=pil;
 const a="const PREVIEW_MUSIC_FIX=PREVIEW_VARIANT==='graphite-musicfix';\n";
 const b=" && !new URLSearchParams(globalThis.location?.search||'').has('cp19');\nconst PREVIEW_CONTROL_DECK=";
 const c=" && !new URLSearchParams(globalThis.location?.search||'').has('cp19');\nconst PREVIEW_MUSIC_FIX=PREVIEW_VARIANT==='graphite-musicfix'||PREVIEW_MAIN_HOME;\nconst PREVIEW_CONTROL_DECK=";
 const d="const CP19_VERSION=CP19F_UX?(PREVIEW_MUSIC_FIX?'0.8.20.15-MUSIC':";
 const e="const CP19_VERSION=CP19F_UX?(PREVIEW_MAIN_HOME?'0.8.20.15-MAIN':PREVIEW_MUSIC_FIX?'0.8.20.15-MUSIC':";
 assert.ok(expected.includes(a)&&expected.includes(b)&&expected.includes(d));
 expected=expected.replace(a,'').replace(b,c).replace(d,e);
 assert.equal(main,expected,'any unreviewed countdown, timing, audio or controls differences are forbidden');
});

test('MAIN 0.8.20.15 sets ambient before creating any AudioContext and reasserts on trusted touch and return',()=>{
 const app=read('app-graphite-main-082015.mjs');
 const first=app.indexOf("if(CP19F_UX&&PREVIEW_MUSIC_FIX){");
 const creating=app.indexOf("audioContext ||= new (window.AudioContext||window.webkitAudioContext)();");
 assert.ok(first>0&&creating>first);
 assert.match(app,/const PREVIEW_MUSIC_FIX=PREVIEW_VARIANT==='graphite-musicfix'\|\|PREVIEW_MAIN_HOME/);
 assert.match(app,/ensureAmbientAudioSession\(navigator\)/);
 assert.match(app,/if\(event\.isTrusted\)applyAmbient\(\)/);
 assert.match(app,/window\.addEventListener\('pageshow',applyAmbient\)/);
 assert.match(app,/const PREVIEW_PREWARM=PREVIEW_CONTROL_DECK\|\|PREVIEW_VARIANT==='graphite-prewarm'/);
 assert.match(app,/soundsLoading=\(PREVIEW_PREWARM\?prewarmButtonFirst\(soundEntries,decodeEntry\):/);
 assert.doesNotMatch(app,/dispatchEvent\(new (?:MouseEvent|PointerEvent)/);
});

test('ambient API feature detection never stops external music or throws without Safari support',()=>{
 const fake={audioSession:{type:'auto'}},ok=ensureAmbientAudioSession(fake);
 assert.deepEqual(ok,{supported:true,applied:true,changed:true});
 assert.equal(fake.audioSession.type,'ambient');
 assert.deepEqual(ensureAmbientAudioSession(null),{supported:false,applied:false,changed:false});
 const helper=read('preview-ambient-audio-session.mjs');
 assert.doesNotMatch(helper,/\.play\(|\.pause\(|\.resume\(|\.suspend\(|\.volume\s*=/);
 assert.doesNotMatch(helper,/navigator\.mediaSession\.playbackState/);
});

test('landscape ROUND is 20 percent larger with downshift, countdown font+fit remains SHA-unchanged',()=>{
 const css=read('preview-graphite-musicfix.css');
 assert.match(css,/transform:translateY\(clamp\(12px,2\.7vh,19px\)\) scale\(1\.20\)/);
 assert.match(css,/transform:translateY\(7px\) scale\(1\.10\)/);
 const roundSection=css.slice(css.indexOf('@media (orientation:landscape){'),css.indexOf('html.cp19f-ux .ambient-mix-status'));
 assert.doesNotMatch(roundSection,/font-size\s*:|\.clock\s*\{|\.clock-frame\s*\{|--wheel-row\s*:/);
 const clock=read('preview-variants-clock-fit.mjs');
 assert.match(clock,/const scaleX=portrait\?1\.79:2\.87/);
 assert.match(clock,/const scaleY=portrait\?5\.20:2\.46/);
});

test('new offline shell precaches new version exactly while retaining original five MP3 and approved WAV',()=>{
 const sw=read('sw.js');
 assert.match(sw,/round-timer-shell-v0\.8\.20\.15-main-graphite-ambient/);
 for(const item of ['./','./index.html','./test-f.html','./manifest.webmanifest','./manifest-cp19f.webmanifest',
  './preview-graphite-musicfix.css?v=082015','./app-graphite-main-082015.mjs?v=082015',
  './preview-ambient-audio-session.mjs','./preview-audio-prewarm.mjs',
  './preview-variants-clock-fit.mjs','./sounds/button.mp3','./sounds/studio-gong-start.mp3',
  './sounds/studio-gong-end.mp3','./sounds/woodclack-single.mp3','./sounds/woodclack-double.mp3',
  './sounds/cp19-wav/button.wav','./sounds/cp19-wav/studio-gong-start.wav',
  './sounds/cp19-wav/studio-gong-end.wav','./sounds/cp19-wav/woodclack-single.wav','./sounds/cp19-wav/woodclack-double.wav'
 ])assert.ok(sw.includes(item),'uncached '+item);
 assert.match(sw,/cache\.addAll\(SHELL\)/);
 assert.match(sw,/skipWaiting\(\)/);
 assert.match(sw,/clients\.claim\(\)/);
});

test('main 0.8.20.15 is TEST-only, real iPhone Apple Music/silent-switch acceptance not claimed',()=>{
 const j=JSON.parse(read('preview-build.json'));
 assert.equal(j.production,false);
 assert.equal(j.cp19f_main_082015.scope,'TEST_MAIN_ONLY');
 assert.equal(j.cp19f_main_082015.apple_music_physical_iphone_qa,'NOT_RUN');
 assert.match(j.cp19f_main_082015.silent_mode_warning,/silent mode/);
 assert.match(read('app.mjs'),/CP19F_UX\?'0\.8\.20\.9':'0\.8\.19\.4'/);
 assert.match(read('preview-graphite-deck.html'),/v0\.8\.20\.13-DECK/);
});
