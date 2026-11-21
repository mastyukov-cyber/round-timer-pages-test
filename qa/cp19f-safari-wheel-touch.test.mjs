import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Safari wheel uses real nonpassive touchmove, never CSS transforms the scroll viewport',()=>{
 const js=read('cp19-wheel-picker.mjs'),css=read('styles.css');
 for(const name of ['touchstart','touchmove','touchend','touchcancel'])assert.ok(js.includes(`scroll.addEventListener('${name}'`),name);
 assert.match(js,/if\(event\.cancelable\)event\.preventDefault\(\)/);
 assert.match(js,/\{passive:false\}\)/);
 assert.match(js,/scroll\.style\.scrollSnapType='none'/);
 assert.match(js,/choose\(n,true\);scheduleInlineCollapse\(220\)/);
 assert.match(js,/const changed=n!==select\.selectedIndex/);
 assert.match(js,/if\(entry\.busy\|\|entry\.raf\|\|entry\.touching\)return/);
 assert.match(css,/touch-action:none/);
 assert.match(css,/is-engaged:not\(\.is-disabled\) \ .cp19f-inline-center|is-engaged:not\(\.is-disabled\) \.cp19f-inline-center/);
});
test('unchanged user UI labels, audio and standalone launch defaults',()=>{
 const html=read('index.html'),app=read('app.mjs');
 assert.ok(html.indexOf('workInput')<html.indexOf('roundsInput'));
 assert.ok(html.indexOf('roundsInput')<html.indexOf('prepareInput'));
 assert.ok(html.indexOf('prepareInput')<html.indexOf('restInput'));
 assert.match(html,/id="soundToggle"/);
 assert.match(app,/soundEnabled/);
});
