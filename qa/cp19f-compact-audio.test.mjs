import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('four inline wheels are 12% shorter in portrait, without changing selected text centering',()=>{
 const css=read('styles.css');
 assert.ok(css.includes('.cp19f-ux .cp19f-inline-wheel{--wheel-row:46px;width:96%;margin-inline:auto;}'));
 assert.ok(css.includes('--wheel-row:52px'));
 assert.ok(css.includes('height:calc(var(--wheel-row)*3)'));
 assert.ok(css.includes('display:flex;align-items:center;justify-content:center;width:100%;height:var(--wheel-row)'));
 assert.ok(css.includes('.cp19f-ux .cp19f-inline-option.is-current {\n font-size:clamp(1.95rem,7.95vw,2.61rem);'));
});

test('landscape compact rows fit normal and short screens, large infinity stays within the row',()=>{
 const css=read('styles.css');
 assert.match(css,/@media \(orientation:landscape\)\{\s*\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:36px;\}/);
 assert.match(css,/@media \(orientation:landscape\) and \(max-height:450px\)\{\s*\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:26px;\}/);
 assert.ok(css.includes('.cp19f-ux .cp19f-inline-option.is-infinity.is-current{font-size:clamp(2.4rem,9vw,2.7rem);}'));
 assert.ok(css.includes('.cp19f-ux .cp19f-inline-option.is-infinity.is-current{font-size:1.48rem;}'));
});

test('button HTMLAudio created/loaded first and WebAudio cold priority starts with button',()=>{
 const html=read('html-audio.mjs'),app=read('app.mjs');
 assert.ok(html.indexOf('button:paths.button?makeAudio(paths.button):null') <
   html.indexOf('start:makeAudio(paths.start)'));
 assert.ok(html.indexOf('buttonAlt:paths.button?makeAudio(paths.button):null') <
   html.indexOf('start:makeAudio(paths.start)'));
 assert.match(html,/element\.preload='auto'/);
 assert.match(html,/element\.load\?\.\(\)/);
 assert.ok(app.includes("if(CP19)soundEntries.sort(([a],[b])=>Number(b==='button')-Number(a==='button'))"));
 assert.ok(app.includes('soundsLoading=Promise.all(soundEntries.map(async([name,url])=>{'));
});

test('cold button fallback occurs before unlockAudio and does not schedule another cue',()=>{
 const app=read('app.mjs'),btn=app.slice(app.indexOf('function buttonSound(){'),app.indexOf('// Pointerdown plays the button sound'));
 assert.ok(btn.includes("if(CP19&&(!audioContext||audioContext.state!=='running'||!soundBuffers.button))"));
 const fallback=btn.indexOf("const accepted=cp19DirectGestureFallback('button');");
 const unlock=btn.indexOf('void Promise.resolve(unlockAudio()).catch(()=>{});');
 assert.ok(fallback>0&&unlock>fallback);
 assert.ok(btn.includes('return accepted;'));
 assert.ok(btn.includes('const maxLateMs=CP19?0:'));
 assert.match(app,/if\(!CP19\|\|!soundEnabled\|\|document\.hidden\|\|audioInterruption\.interrupted\|\|!htmlSounds\)return false/);
});

test('cache refresh to 0.8.20.9 preserves settings, audio, production isolation and haptic guards',()=>{
 const app=read('app.mjs'),sw=read('sw.js'),html=read('index.html');
 const meta=JSON.parse(read('preview-build.json'));
 assert.equal(meta.version,'v0.8.20.9-skeuomorphic-wheels-landscape-first-tap-test');
 assert.equal(meta.production,false);
 assert.equal(meta.cp19f_compact_wheels_cold_priority.real_iphone_qa,'NOT_RUN');
 assert.equal(meta.cp19f_compact_wheels_cold_priority.portrait_row_px_after,46);
 assert.match(app,/round-timer-cp19f-settings-v1/);
 assert.match(app,/CP19F_UX\?'0\.8\.20\.9':'0\.8\.19\.4'/);
 assert.match(sw,/round-timer-shell-v0\.8\.20\.9-test-settings-sync/);
 assert.match(html,/src="\.\/app\.mjs\?v=08209"/);
 const haptics=read('cp19-haptics.mjs');
 assert.match(haptics,/typeof navigatorRef\?\.vibrate==='function'/);
 assert.doesNotMatch(haptics,/\.click\(\)/);
});
