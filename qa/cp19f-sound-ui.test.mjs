import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(const path of ['index.html','test-f.html']){
 test(`${path} has required 2×2 order and sound switch directly below`,()=>{
  const html=read(path);
  const fields=['id="workInput"','id="roundsInput"','id="prepareInput"','id="restInput"','id="soundControl"'];
  const indexes=fields.map(v=>html.indexOf(v));
  assert.ok(indexes.every(v=>v>0),indexes);
  assert.ok(indexes.every((v,i)=>!i||v>indexes[i-1]),indexes);
  assert.match(html,/id="soundToggle"[^>]+role="switch"[^>]+aria-label="Звук таймера"/);
  assert.match(html,/data-sound="on">ВКЛ<\/button>/);
  assert.match(html,/content="v0\.8\.20\.4/);
 });
}
test('chosen glow toggle is green ON/red OFF with white knob, large wheels are grey',()=>{
 const css=read('styles.css');
 for(const c of ['.cp19f-audio-toggle[data-sound="on"]','.cp19f-audio-toggle[data-sound="off"]','::after','.cp19f-wheel-window','.cp19f-wheel-center','.cp19f-wheel-option.is-current']) assert.ok(css.includes(c),c);
 assert.match(css,/data-sound="on"[^\n]*background:#00b338;[^\n]*box-shadow:/);
 assert.match(css,/data-sound="off"[^\n]*background:#d52230;[^\n]*box-shadow:/);
 assert.match(css,/\.cp19f-wheel-center\{background:linear-gradient\(180deg,#e1e3e7,#bfc4cb\)/);
 assert.match(css,/\.cp19f-wheel-option\.is-current\{color:#0e151d/);
 assert.match(css,/\.cp19f-audio-toggle::after\{content:"";/);
});
test('mute controls all timer audio paths, persists ON/OFF, cancels delayed cues and leaves external music alone',()=>{
 const app=read('app.mjs');
 assert.match(app,/const SOUND_KEY='round-timer-cp19f-sound-toggle-v1'/);
 assert.match(app,/localStorage\.getItem\(SOUND_KEY\)!=='off'/);
 assert.match(app,/localStorage\.setItem\(SOUND_KEY,soundEnabled\?'on':'off'\)/);
 assert.match(app,/el\.soundToggle\.dataset\.sound=soundEnabled\?'on':'off'/);
 assert.match(app,/el\.soundToggle\.setAttribute\('aria-checked',String\(soundEnabled\)\)/);
 assert.match(app,/function sound\(type\)\{\s*if\(!soundEnabled\|\|document\.hidden/);
 assert.match(app,/function buttonSound\(\)\{\s*if\(!soundEnabled\|\|!isPreview/);
 assert.match(app,/canPlay: context=>soundEnabled &&/);
 assert.match(app,/else if\(soundEnabled\)delayedStartGong\.schedule/);
 assert.match(app,/delayedStartGong\.invalidate\(\);\s*stopActiveAudio\(\{fadeMs:0,preserveMix:true\}\);\s*cp19KeepAlive\.stop\(\)/);
 assert.match(app,/if\(soundEnabled\)\{\s*cp19Gesture\(\);/);
 assert.match(app,/event\?\.target\?\.closest\?\.\('#soundToggle'\)/);
 assert.doesNotMatch(app,/navigator\.mediaSession\.setPositionState\(/);
});
test('new PWA cache changes identity and includes versioned JS/CSS',()=>{
 const sw=read('sw.js');
 for(const file of ['./styles.css?v=08204','./app.mjs?v=08204','cp19-wheel-picker.mjs']) assert.ok(sw.includes(file),file);
 assert.match(sw,/round-timer-shell-v0\.8\.20\.4-test-settings-sync/);
});
