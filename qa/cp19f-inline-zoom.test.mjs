import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('no modal; inline wheel zooms only during interaction and auto-collapses',()=>{
 const js=read('cp19-wheel-picker.mjs'),css=read('styles.css');
 assert.match(js,/wheel\.classList\.add\('is-engaged'\)/);
 assert.match(js,/wheel\.classList\.remove\('is-engaged'\)/);
 assert.match(js,/scroll\.addEventListener\('scroll'/);
 assert.match(js,/scroll\.addEventListener\('scrollend'/);
 assert.match(js,/scroll\.addEventListener\('touchstart'/);
 assert.match(js,/scheduleInlineCollapse\(450\)/);
 assert.doesNotMatch(js,/cp19f-wheel-overlay/);
 assert.match(css,/\.cp19f-inline-wheel\.is-engaged:not\(\.is-disabled\)/);
 assert.match(css,/scale\(1\.055\)/);
 assert.match(css,/scale\(1\.04\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('previous selected option remains authoritative and changes without confirmation',()=>{
 const js=read('cp19-wheel-picker.mjs');
 assert.match(js,/select\.value=select\.options\[n\]\.value/);
 assert.match(js,/select\.dispatchEvent\(new Event\('change'/);
 assert.doesNotMatch(js,/✓ ВЫБРАТЬ/);
 assert.match(read('preview-build.json'),/v0\.8\.20\.4-symmetric-wheel-settings-sync-test/);
});
