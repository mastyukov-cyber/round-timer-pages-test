import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('first and last selections show balanced, non-interactive edge placeholders',()=>{
 const js=read('cp19-wheel-picker.mjs'),css=read('styles.css');
 assert.match(js,/minMarker.textContent='—'/);
 assert.match(js,/maxMarker.textContent='—'/);
 assert.match(js,/wheel.append\(center,scroll,minMarker,maxMarker\)/);
 assert.match(js,/minMarker.hidden=entry.index!==0/);
 assert.match(js,/maxMarker.hidden=entry.index!==select.options.length-1/);
 assert.match(js,/minMarker.hidden=idx!==0/);
 assert.match(css,/\.cp19f-inline-limit\{[\s\S]*?pointer-events:none/);
 assert.match(css,/\.cp19f-inline-limit-top\{top:0;\}/);
 assert.match(css,/\.cp19f-inline-limit-bottom\{bottom:0;\}/);
});
test('iPhone-approved touch scrolling and audio remain untouched by visual placeholders',()=>{
 const js=read('cp19-wheel-picker.mjs');
 assert.match(js,/scroll.addEventListener\('touchmove'/);
 assert.match(js,/\{passive:false\}/);
 assert.match(js,/select.value=select.options\[n\].value/);
 assert.match(js,/scroll.scrollTop=Math.max\(0/);
 const cache=read('sw.js');
 assert.match(cache,/round-timer-shell-v0\.8\.20\.9-test-settings-sync/);
});
