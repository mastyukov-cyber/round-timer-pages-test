import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CP19_TOUCH_GAIN, wheelIndex, wheelLabel} from '../cp19-wheel-picker.mjs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('infinity is one enlarged glyph without the word in visible wheel and option',()=>{
 assert.equal(wheelLabel({id:'roundsInput'},{value:'infinity',textContent:'∞ Бесконечно'}),'∞');
 assert.equal(wheelLabel({id:'roundsInput'},{value:'5',textContent:'5'}),'5');
 const picker=read('cp19-wheel-picker.mjs'),app=read('app.mjs'),css=read('styles.css');
 assert.match(app,/option\.textContent=c==='infinity'\?'∞'/);
 assert.doesNotMatch(app,/∞ Бесконечно/);
 assert.match(picker,/is-infinity/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-option\.is-infinity\.is-current\{font-size:/);
});

test('each option centers horizontally and vertically inside a full CSS row',()=>{
 const css=read('styles.css');
 assert.match(css,/\.cp19f-inline-option\{\s*display:flex;align-items:center;justify-content:center;/);
 assert.match(css,/height:var\(--wheel-row\)/);
 assert.match(css,/\.cp19f-inline-center\{[\s\S]*?top:50%/);
 assert.match(css,/\.cp19f-inline-wheel\{--wheel-row:40px/);
 assert.match(css,/\.cp19f-inline-wheel\{--wheel-row:28px/);
});

test('Safari dragging is 20 percent more sensitive while touching, preserving limits and release commit',()=>{
 const picker=read('cp19-wheel-picker.mjs');
 assert.equal(CP19_TOUCH_GAIN,1.2);
 assert.equal(wheelIndex(3*52*CP19_TOUCH_GAIN,52,13),4);
 assert.equal(wheelIndex(-100,52,13),0);
 assert.equal(wheelIndex(100000,52,13),12);
 assert.match(picker,/entry\.touchStartTop\+delta\*CP19_TOUCH_GAIN/);
 assert.match(picker,/scroll\.addEventListener\('touchend',endTouch/);
 assert.match(picker,/const n=wheelIndex\(scroll\.scrollTop,rowHeight\(\),select\.options\.length\);\s*choose\(n,true\)/);
});

test('v0.8.20.9 has a unique offline cache and unchanged settings storage semantics',()=>{
 const app=read('app.mjs'),sw=read('sw.js'),html=read('index.html');
 const meta=JSON.parse(read('preview-build.json'));
 assert.equal(meta.version,'v0.8.20.15-main-graphite-ambient-music-test');
 assert.equal(meta.production,false);
 assert.equal(meta.cp19f_wheel_optics.touch_drag_gain,1.2);
 assert.match(app,/round-timer-cp19f-settings-v1/);
 assert.match(sw,/round-timer-shell-v0\.8\.20\.15-main-graphite-ambient/);
 assert.match(html,/src="\.\/app-graphite-main-082015\.mjs\?v=082015"/);
});
