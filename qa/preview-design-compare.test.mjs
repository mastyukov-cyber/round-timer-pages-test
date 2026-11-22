import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

const variants=[
 {name:'graphite',tag:'A',heading:'Graphite Steel',theme:'#222d39'},
 {name:'classic',tag:'B',heading:'Classic Apple',theme:'#bec9d2'},
];

test('two full TEST HTML entrypoints share runtime, geometry and assets but different visual skins',()=>{
 const html=variants.map(v=>read('preview-'+v.name+'.html'));
 assert.equal(html.length,2);
 for(let i=0;i<variants.length;i++){
  const v=variants[i],h=html[i];
  assert.ok(h.includes('v0.8.20.10-'+v.tag+'-design-preview'));
  assert.ok(h.includes('Round Timer TEST '+v.tag+' — '+v.heading));
  assert.ok(h.includes('<meta name="theme-color" content="'+v.theme+'">'));
  assert.ok(h.includes('./styles.css?v=08209'));
  assert.ok(h.includes('./preview-variants-base.css?v=082010'));
  assert.ok(h.includes('./preview-'+v.name+'.css?v=082010'));
  assert.ok(h.includes('./preview-variants-app.mjs?v=082010'));
  assert.ok(!h.includes('<script type="module" src="./app.mjs'));
  assert.ok(!h.includes('rel="manifest"'), 'do not install the root PWA from a design preview');
  for(const id of ['workInput','roundsInput','prepareInput','restInput','soundToggle',
    'startPauseButton','resetButton','clock','roundCurrent','roundTotal','closeSettingsButton'])
   assert.ok(h.includes('id="'+id+'"'),v.name+': '+id);
 }
 const normalize=h=>h.replace(/<meta name="round-timer-preview-build"[^>]+>/,'<meta name="round-timer-preview-build" content="X">')
  .replace(/<meta name="theme-color"[^>]+>/,'<meta name="theme-color" content="X">')
  .replace(/preview-(?:graphite|classic)\.css/g,'preview-VARIANT.css')
  .replace(/<title>[^<]+<\/title>/,'<title>X</title>')
  .replace(/미하일 0\.8\.20\.10-[AB] · (Graphite Steel|Classic Apple) · TEST/,'VERSION');
 assert.equal(normalize(html[0]),normalize(html[1]),'same timer, only presentation changes');
});

test('both entrypoints activate CP19-F and use pilot countdown geometry, without changing production root',()=>{
 const app=read('preview-variants-app.mjs'),fit=read('preview-variants-clock-fit.mjs');
 assert.ok(app.includes('const PREVIEW_VARIANT='));
 assert.ok(app.includes('preview-(graphite|classic)'));
 assert.ok(app.includes('||!!PREVIEW_VARIANT'));
 assert.ok(app.includes("import {fitCP19Clock} from './preview-variants-clock-fit.mjs'"));
 assert.ok(app.includes("PREVIEW_VARIANT==='graphite'?'A':'B'"));
 assert.ok(app.includes('shortLandscape?.032:.034'));
 assert.ok(app.includes('shortLandscape?3.35:3.75'));
 assert.ok(fit.includes('const scaleX=portrait?1.79:2.87;'));
 assert.ok(fit.includes('const scaleY=portrait?5.20:2.46;'));
 assert.ok(read('app.mjs').includes("const CP19_VERSION=CP19F_UX?'0.8.20.9':'0.8.19.4'"));
 assert.ok(read('sw.js').includes('round-timer-shell-v0.8.20.9-test-settings-sync'));
});

test('both previews inherit red wheel dashes, mechanical look and compact geometry from the pinned pilot',()=>{
 const css=read('preview-variants-base.css');
 assert.ok(css.includes('CP19-F v0.8.20.10'));
 assert.ok(css.includes('give the remaining countdown priority'));
 assert.ok(css.includes('--wheel-row:44px;width:94%;'));
 assert.ok(css.includes('--wheel-row:34px;'));
 assert.ok(css.includes('--wheel-row:25px;'));
 assert.ok(css.includes('z-index:5;color:#e12b3f;opacity:1'));
 const root=read('styles.css');
 assert.ok(root.includes('CP19-F v0.8.20.9 skeuomorphic'));
 assert.ok(root.includes('.cp19f-ux .cp19f-inline-wheel::before'));
 assert.ok(root.includes('pointer-events:none;'));
 assert.ok(!root.includes('CP19-F v0.8.20.10'));
});

test('A graphite and B classic panel skins are distinct but never obstruct input or hide wheel numbers',()=>{
 const a=read('preview-graphite.css'),b=read('preview-classic.css');
 assert.ok(a.includes('Graphite Steel'));
 assert.ok(b.includes('Classic Apple'));
 for(const css of [a,b]){
  assert.ok(css.includes('html.cp19f-ux #settings[open]'));
  assert.ok(css.includes('.settings-form label'));
  assert.ok(css.includes('.cp19f-audio-row'));
  assert.ok(css.includes('.close-settings'));
  assert.ok(!css.includes('pointer-events:none'));
  assert.ok(!css.includes('display:none'));
  assert.ok(!css.includes('--wheel-row'));
  assert.ok(!css.includes('touch-action:'));
 }
 assert.ok(a.includes('#242d38'));
 assert.ok(b.includes('#dce1e5'));
 assert.ok(a.includes('#f5f7fa'));
 assert.ok(b.includes('#23313b'));
});

test('shared gesture sound and original MP3 paths, and online-first preview navigation, are retained',()=>{
 const app=read('preview-variants-app.mjs'),sw=read('sw.js');
 for(const path of ['./sounds/studio-gong-start.mp3','./sounds/studio-gong-end.mp3',
   './sounds/woodclack-single.mp3','./sounds/woodclack-double.mp3','./sounds/button.mp3'])
  assert.ok(app.includes(path));
 assert.ok(app.includes("const SETTINGS_KEY=CP19F_UX?'round-timer-cp19f-settings-v1':null"));
 assert.ok(app.includes("const accepted=cp19DirectGestureFallback('button');"));
 assert.ok(app.includes("if(CP19F_UX&&event?.target?.closest?.('button,summary'))return;"));
 assert.ok(sw.includes("event.request.mode === 'navigate'"));
 assert.ok(sw.includes("fetch(event.request, {cache:'no-store'})"));
 assert.ok(!sw.includes('preview-graphite.html'),'no mutation to live service worker');
});
