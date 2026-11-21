import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('selected wheel number is 1.5x compared with existing portrait font',()=>{
 const css=read('styles.css');
 assert.match(css,/\.cp19f-inline-option\.is-current\{color:#111820;[^\n]*font-size:clamp\(1\.3rem,5\.3vw,1\.74rem\)/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-option\.is-current \{\s*font-size:clamp\(1\.95rem,7\.95vw,2\.61rem\);/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-option\.is-current \{[\s\S]*?line-height:1;/);
});
test('selected number enlargement respects all landscape wheel heights',()=>{
 const css=read('styles.css');
 assert.match(css,/\.cp19f-ux \.cp19f-inline-option\.is-current \{font-size:1\.905rem;\}/);
 assert.match(css,/@media \(orientation:landscape\) and \(max-height:450px\) \{\s*\.cp19f-ux \.cp19f-inline-option\.is-current \{font-size:1\.74rem;\}/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-option\.is-infinity\.is-current \{font-size:1\.65rem;\}/);
 assert.match(css,/\.cp19f-inline-wheel\{--wheel-row:28px/);
});
test('landscape round word and count are doubled and lowered without affecting portrait',()=>{
 const css=read('styles.css');
 assert.match(css,/\.round-word \{font-size:1em/);
 assert.match(css,/\.round-count \{font-size:4\.5em/);
 assert.match(css,/@media \(orientation:landscape\)\{\.cp19f-ux \.round-count\{font-size:3\.75em;\}\}/);
 assert.match(css,/\.cp19f-ux \.round-word \{font-size:2em;\}/);
 assert.match(css,/\.cp19f-ux \.round-count \{font-size:7\.5em;\}/);
 assert.match(css,/margin-top:clamp\(2px,\.7vh,5px\);\s*transform:translateY\(clamp\(5px,1\.5vh,9px\)\)/);
 assert.match(css,/@media \(orientation:landscape\) and \(max-height:350px\) \{[\s\S]*?\.round-count \{font-size:6\.25em;\}/);
});
test('0.8.20.8 preserves timer configuration and original audio; changes cache identity',()=>{
 const app=read('app.mjs'),sw=read('sw.js'),html=read('index.html');
 const meta=JSON.parse(read('preview-build.json'));
 assert.equal(meta.version,'v0.8.20.8-compact-wheels-cold-audio-priority-test');
 assert.equal(meta.production,false);
 assert.equal(meta.cp19f_selected_wheel_landscape_round.selected_value_magnification,1.5);
 assert.equal(meta.cp19f_selected_wheel_landscape_round.landscape_round_word_factor,2);
 assert.equal(meta.cp19f_selected_wheel_landscape_round.landscape_round_count_factor,2);
 assert.match(app,/round-timer-cp19f-settings-v1/);
 assert.match(app,/CP19F_UX\?'0\.8\.20\.8':'0\.8\.19\.4'/);
 assert.match(sw,/round-timer-shell-v0\.8\.20\.8-test-settings-sync/);
 assert.match(html,/src="\.\/app\.mjs\?v=08208"/);
});
