import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('A2 selected Graphite maintains original dark style and entire wheel grid',()=>{
 const old=read('preview-graphite.html'),current=read('preview-graphite-v2.html');
 assert.match(current,/Round Timer TEST A2 — Graphite Steel/);
 assert.match(current,/v0\.8\.20\.11-A2-design-preview/);
 assert.match(current,/preview-graphite\.css\?v=082010/);
 assert.match(current,/preview-graphite-v2\.css\?v=082011/);
 assert.match(current,/preview-graphite-v2-app\.mjs\?v=082011/);
 for(const id of ['workInput','roundsInput','prepareInput','restInput',
  'clock','roundCurrent','roundTotal','soundToggle','startPauseButton','resetButton'])
  assert.ok(current.includes('id="'+id+'"'),id);
 assert.equal((current.match(/<label>/g)||[]).length,4);
 assert.equal((old.match(/<label>/g)||[]).length,4);
 assert.ok(!current.includes('rel="manifest"'));
});

test('rounds picker aligns vertically with work picker, without changing wheel dimensions or interactions',()=>{
 const css=read('preview-graphite-v2.css'),picker=read('cp19-wheel-picker.mjs');
 assert.match(css,/\.settings-form\s*>\s*label:nth-of-type\(-n\+4\)\s*>\s*\.cp19f-inline-wheel\s*\{\s*margin-top:auto/);
 assert.match(css,/align-items:stretch/);
 assert.match(picker,/select\.insertAdjacentElement\('afterend',wheel\)/);
 assert.match(picker,/const label=select\.closest\('label'\)/);
 assert.ok(!css.includes('--wheel-row'));
 assert.doesNotMatch(css,/(^|[;{\s])height\s*:/m);
 assert.ok(!css.includes('width:'));
 assert.ok(!css.includes('position:absolute'));
});

test('landscape round label moves down ~5-9px and grows 5.5% without resizing remaining countdown',()=>{
 const css=read('preview-graphite-v2.css');
 assert.match(css,/@media \(orientation:landscape\)/);
 assert.match(css,/transform:translateY\(clamp\(5px,1\.4vh,9px\)\) scale\(1\.055\)/);
 assert.match(css,/max-height:350px/);
 assert.match(css,/translateY\(3px\) scale\(1\.03\)/);
 assert.doesNotMatch(css,/\.clock(?:-frame)?\s*\{/);
 assert.doesNotMatch(css,/font-size\s*:/);
 const base=read('preview-variants-clock-fit.mjs');
 assert.match(base,/const scaleX=portrait\?1\.79:2\.87/);
 assert.match(base,/const scaleY=portrait\?5\.20:2\.46/);
});

test('frozen countdown and sound logic: A2 app is byte-equivalent to A except the route and version strings',()=>{
 const original=read('preview-variants-app.mjs'),updated=read('preview-graphite-v2-app.mjs');
 const normalize=s=>s.replace(/const PREVIEW_VARIANT=[^\n]+/,'PREVIEW_VARIANT=PINNED')
                     .replace(/const CP19_VERSION=[^\n]+/,'CP19_VERSION=PINNED');
 assert.match(updated,/preview-\(graphite-v2\|graphite\|classic\)/);
 assert.match(updated,/PREVIEW_VARIANT==='graphite-v2'\?'0\.8\.20\.11-A2'/);
 assert.equal(normalize(updated),normalize(original),'any change to countdown or audio logic is forbidden');
 assert.match(updated,/if\(CP19F_UX&&event\?\.target\?\.closest\?\.\('button,summary'\)\)return/);
 assert.match(updated,/const accepted=cp19DirectGestureFallback\('button'\)/);
 assert.match(updated,/import \{fitCP19Clock\} from '\.\/preview-variants-clock-fit\.mjs'/);
});

test('three synthetic pointer events are not trusted user activation (diagnostic-only, never shipped)',()=>{
 const tgt=new EventTarget(),trusted=[];
 tgt.addEventListener('pointerdown',event=>trusted.push(event.isTrusted));
 for(let i=0;i<3;i++)tgt.dispatchEvent(new Event('pointerdown'));
 assert.equal(trusted.length,3);
 assert.deepEqual(trusted,[false,false,false]);
 // These programmatic events do NOT confer a trusted iOS Safari audio gesture.
 const app=read('preview-graphite-v2-app.mjs');
 assert.doesNotMatch(app,/dispatchEvent\(new (?:PointerEvent|MouseEvent)/);
 assert.doesNotMatch(app,/new PointerEvent\('pointerdown'/);
});

test('Graphite A2 preview changes only new files; root TEST and final untouched by pilot',()=>{
 const html=read('preview-graphite-v2.html');
 assert.match(html,/src="\.\/preview-graphite-v2-app\.mjs\?v=082011"/);
 assert.equal(JSON.parse(read('preview-build.json')).version,
  'v0.8.20.15-main-graphite-ambient-music-test');
 assert.equal(JSON.parse(read('preview-build.json')).production,false);
 assert.match(read('sw.js'),/round-timer-shell-v0\.8\.20\.15-main-graphite-ambient/);
 assert.match(read('index.html'),/src="\.\/app-graphite-main-082015\.mjs\?v=082015"/);
});
