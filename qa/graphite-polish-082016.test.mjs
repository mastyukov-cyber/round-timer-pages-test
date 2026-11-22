import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('bottom wheel labels PREPARE and REST share exactly the same grid alignment and no native label-4 margin',()=>{
 const css=read('graphite-polish-082016.css');
 assert.match(css,/label:nth-of-type\(3\),[\s\S]*?label:nth-of-type\(4\)\s*\{[\s\S]*?margin-bottom:0/);
 assert.match(css,/label:nth-of-type\(3\) > \.cp19f-inline-wheel,[\s\S]*?label:nth-of-type\(4\) > \.cp19f-inline-wheel\s*\{[\s\S]*?margin-top:auto/);
 assert.match(read('styles.css'),/\.settings-form label:nth-of-type\(4\) \{margin-bottom:8px;\}/);
 assert.match(read('preview-graphite-v2.css'),/margin-top:auto/);
});
test('both metallic buttons have all four corners rounded, with no inherited radius',()=>{
 const css=read('graphite-polish-082016.css');
 assert.match(css,/\.controls \.main-button,[\s\S]*?\.controls \.secondary-button\s*\{[\s\S]*?border-radius:16px/);
 assert.match(css,/orientation:landscape[\s\S]*?border-radius:10px/);
 assert.doesNotMatch(css,/border-radius\s*:\s*inherit\s*;/);
 assert.match(read('preview-graphite-deck.css'),/data-control-state="pause"/);
});
test('OFF is dark graphite unlit; ON stays green and its glow is untouched',()=>{
 const css=read('graphite-polish-082016.css');
 const off=css.indexOf('data-sound="off"'),on=css.indexOf('data-sound="on"');
 assert.ok(off>=0&&on>off);
 assert.match(css,/data-sound="off"\]\s*\{[\s\S]*?background:linear-gradient\(180deg,#394550,#202a34 58%,#151d25\)/);
 assert.match(css,/data-sound="off"\]::after\s*\{[\s\S]*?background:linear-gradient\(180deg,#b4bec6,#717e89\)/);
 assert.match(read('styles.css'),/data-sound="on"\]\{background:#00b338/);
 assert.match(read('app-graphite-main-082015.mjs'),/el\.soundToggle\.dataset\.sound=soundEnabled\?'on':'off'/);
});
test('landscape ROUND is slightly lower/larger while countdown font and fit remain frozen',()=>{
 const css=read('graphite-polish-082016.css');
 assert.match(css,/transform:translateY\(clamp\(15px,3\.2vh,23px\)\) scale\(1\.25\)/);
 assert.match(css,/max-height:350px/);
 assert.match(css,/transform:translateY\(9px\) scale\(1\.14\)/);
 const stripped=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(stripped,/\.clock\s*\{|\.clock-frame\s*\{|font-size\s*:|--wheel-row\s*:/);
 const fit=read('preview-variants-clock-fit.mjs');
 assert.match(fit,/const scaleX=portrait\?1\.79:2\.87/);
 assert.match(fit,/const scaleY=portrait\?5\.20:2\.46/);
});
test('approved Apple Music ambient, button prewarm and original sound file routes are not changed',()=>{
 const app=read('app-graphite-main-082015.mjs');
 assert.match(app,/ensureAmbientAudioSession\(navigator\)/);
 assert.match(app,/const PREVIEW_PREWARM=PREVIEW_CONTROL_DECK\|\|PREVIEW_VARIANT==='graphite-prewarm'/);
 assert.match(app,/soundsLoading=\(PREVIEW_PREWARM\?prewarmButtonFirst\(soundEntries,decodeEntry\):/);
 assert.match(read('sw.js'),/round-timer-shell-v0\.8\.20\.15-main-graphite-ambient/);
});
