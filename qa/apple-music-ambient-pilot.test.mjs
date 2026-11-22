import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ensureAmbientAudioSession} from '../preview-ambient-audio-session.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('ambient session is set explicitly and does not play/pause or manipulate external Apple Music',()=>{
 const calls=[],session={type:'auto'};
 Object.defineProperty(session,'type',{get(){return this._type??'auto'},set(v){calls.push(v);this._type=v}});
 const nav={audioSession:session};
 const first=ensureAmbientAudioSession(nav);
 assert.deepEqual(first,{supported:true,applied:true,changed:true});
 assert.equal(session.type,'ambient');
 const second=ensureAmbientAudioSession(nav);
 assert.deepEqual(second,{supported:true,applied:true,changed:false});
 assert.deepEqual(calls,['ambient']);
 const source=read('preview-ambient-audio-session.mjs');
 assert.doesNotMatch(source,/\.play\(|\.pause\(|\.resume\(|\.suspend\(|\.volume\s*=/);
 assert.doesNotMatch(source,/['"]playback['"]|['"]transient-solo['"]/);
});
test('ambient is a safe feature-detected optional API, does not crash when unavailable/blocked',()=>{
 assert.deepEqual(ensureAmbientAudioSession(null),{supported:false,applied:false,changed:false});
 assert.deepEqual(ensureAmbientAudioSession({}),{supported:false,applied:false,changed:false});
 assert.deepEqual(ensureAmbientAudioSession({get audioSession(){throw Error('disabled')}}),{supported:false,applied:false,changed:false});
 const session={get type(){return 'auto'},set type(_) {throw Error('readonly')}};
 assert.deepEqual(ensureAmbientAudioSession({audioSession:session}),{supported:false,applied:false,changed:false});
});
test('pilot requests ambient before Web Audio initialisation, on actual taps and foreground resume',()=>{
 const app=read('preview-graphite-musicfix-app.mjs');
 const start=app.indexOf("const CP19F_UX=CP19_MODE==='wav-keepalive';");
 const ambient=app.indexOf("if(CP19F_UX&&PREVIEW_MUSIC_FIX){",start);
 const context=app.indexOf("function unlockAudio(){",start);
 const audioPreload=app.indexOf('audioContext ||= new (window.AudioContext||window.webkitAudioContext)();',start);
 assert.ok(start>=0&&ambient>start&&context>ambient&&audioPreload>ambient);
 assert.match(app,/ensureAmbientAudioSession\(navigator\)/);
 assert.match(app,/if\(event\.isTrusted\)applyAmbient\(\)/);
 assert.match(app,/window\.addEventListener\('pageshow',applyAmbient\)/);
 assert.match(app,/document\.addEventListener\('visibilitychange',\(\)=>\{if\(!document\.hidden\)applyAmbient\(\);\}\)/);
 assert.doesNotMatch(app,/navigator\.mediaSession\.playbackState\s*=/);
});
test('pilot retains user-approved button prewarm and exact original cue timing and musical volume',()=>{
 const old=read('app-graphite-main-082014.mjs'),next=read('preview-graphite-musicfix-app.mjs');
 for(const section of ['function preloadSounds(){','function cp19DirectGestureFallback(type){',
  'function buttonSound(){','function sound(type){','function fitClock(force=false){',
  'function startPause(){','function reset(){']){
  const a=old.indexOf(section),b=next.indexOf(section);
  assert.ok(a>=0&&b>=0,section);
  const oldStart=old.indexOf('{',a),nextStart=next.indexOf('{',b);
  assert.equal(old.slice(a,a+130),next.slice(b,b+130),'function start changed '+section);
 }
 assert.match(next,/PREVIEW_PREWARM\?prewarmButtonFirst\(soundEntries,decodeEntry\)/);
 assert.match(next,/const CP19_F_LAUNCH=/);
 assert.match(next,/if\(PREVIEW_CONTROL_DECK\)el\.start\.dataset\.controlState=/);
 assert.match(next,/const SOUND_KEY='round-timer-cp19f-sound-toggle-v1'/);
 assert.match(next,/const SETTINGS_KEY=CP19F_UX\?'round-timer-cp19f-settings-v1'/);
 assert.doesNotMatch(next,/dispatchEvent\(new (?:MouseEvent|PointerEvent)/);
});
test('round label grows, shifts down, with no change to frozen countdown metrics',()=>{
 const css=read('preview-graphite-musicfix.css');
 assert.match(css,/translateY\(clamp\(12px,2\.7vh,19px\)\) scale\(1\.20\)/);
 assert.match(css,/max-height:350px/);
 assert.match(css,/translateY\(7px\) scale\(1\.10\)/);
 assert.doesNotMatch(css,/\.round-line\s*\{[^}]*font-size\s*:|\.clock\s*\{|\.clock-frame\s*\{|--wheel-row\s*:/);
 const base=read('preview-variants-clock-fit.mjs');
 assert.match(base,/const scaleX=portrait\?1\.79:2\.87/);
 assert.match(base,/const scaleY=portrait\?5\.20:2\.46/);
});
test('new preview preserves controls and Graphite layout, and does not install/replace the main PWA',()=>{
 const html=read('preview-graphite-musicfix.html');
 assert.match(html,/v0\.8\.20\.15-music-ambient-lab/);
 assert.match(html,/src="\.\/preview-graphite-musicfix-app\.mjs\?v=082015"/);
 assert.match(html,/preview-graphite-musicfix\.css\?v=082015/);
 assert.match(html,/id="ambientMixStatus"/);
 assert.doesNotMatch(html,/rel="manifest"/);
 for(const id of ['workInput','roundsInput','prepareInput','restInput',
  'startPauseButton','resetButton','clock','roundCurrent','roundTotal','soundToggle']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 assert.match(read('index.html'),/app-graphite-main-082014\.mjs\?v=082014/);
 assert.match(read('sw.js'),/round-timer-shell-v0\.8\.20\.14-main-graphite-prewarm/);
 assert.equal(JSON.parse(read('preview-build.json')).production,false);
 assert.equal(JSON.parse(read('preview-build.json')).version,
  'v0.8.20.14-main-graphite-prewarm-control-deck-test');
});
