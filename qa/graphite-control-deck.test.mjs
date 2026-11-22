import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prewarmButtonFirst} from '../preview-audio-prewarm.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Graphite Control Deck is a standalone combined TEST version with unchanged timer markup',()=>{
 const old=read('preview-graphite-prewarm.html'),html=read('preview-graphite-deck.html');
 assert.match(html,/v0\.8\.20\.13-DECK-graphite-prewarm-test/);
 assert.match(html,/Round Timer TEST 0\.8\.20\.13 — Graphite Control Deck/);
 for(const css of ['styles.css?v=08209','preview-variants-base.css?v=082010','preview-graphite.css?v=082010',
  'preview-graphite-v2.css?v=082011','preview-graphite-deck.css?v=082013'])
  assert.ok(html.includes('./'+css),css);
 assert.match(html,/src="\.\/preview-graphite-deck-app\.mjs\?v=082013"/);
 assert.doesNotMatch(html,/rel="manifest"/);
 for(const id of ['workInput','roundsInput','prepareInput','restInput','clock','roundCurrent','roundTotal',
  'startPauseButton','resetButton','soundToggle','settings','closeSettingsButton']){
  assert.ok(html.includes('id="'+id+'"'),id);
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id+' uniqueness');
 }
 assert.equal((old.match(/<label>/g)||[]).length,(html.match(/<label>/g)||[]).length);
});

test('Audio Prewarm button fetch/decode precedes other cues and creates no synthetic touch or autoplay',async()=>{
 const app=read('preview-graphite-deck-app.mjs'),prewarm=read('preview-audio-prewarm.mjs');
 assert.match(app,/const PREVIEW_CONTROL_DECK=PREVIEW_VARIANT==='graphite-deck'/);
 assert.match(app,/const PREVIEW_PREWARM=PREVIEW_CONTROL_DECK\|\|PREVIEW_VARIANT==='graphite-prewarm'/);
 assert.match(app,/soundsLoading=\(PREVIEW_PREWARM\?prewarmButtonFirst\(soundEntries,decodeEntry\):/);
 assert.match(app,/const buffer=await context\.decodeAudioData\(raw\)/);
 assert.match(app,/const resp=await fetch\(url\)/);
 assert.match(app,/const accepted=cp19DirectGestureFallback\('button'\)/);
 assert.match(app,/if\(CP19F_UX&&event\?\.target\?\.closest\?\.\('button,summary'\)\)return/);
 assert.doesNotMatch(prewarm,/\.play\(|\.start\(|\.resume\(/);
 assert.doesNotMatch(app,/dispatchEvent\(new (?:PointerEvent|MouseEvent)/);
 let done,gate=new Promise(resolve=>{done=resolve}),log=[];
 const promise=prewarmButtonFirst([['start','gong'],['button','click'],['end','end']],
  async ([name])=>{log.push('started:'+name);if(name==='button')await gate;log.push('done:'+name)});
 assert.deepEqual(log,['started:button']);
 done();await promise;
 assert.equal(log[1],'done:button');
 assert.equal(log.length,6);
});

test('original Graphite A2 clock fitting, round formatting and sound-button handler remain byte-exact',()=>{
 const old=read('preview-graphite-prewarm-app.mjs'),next=read('preview-graphite-deck-app.mjs');
 const section=(text,start,end)=>{
  const a=text.indexOf(start),b=text.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,'missing section '+start);
  return text.slice(a,b);
 };
 for(const [a,b] of [
  ['function fitClock(force=false){','window.addEventListener(\'resize\''],
  ['function fitLabels(){','window.addEventListener(\'resize\''],
  ['function buttonSound(){','// Pointerdown plays the button sound'],
  ['function startPause(){','function reset(){'],
  ['function preloadSounds(){','function sound(type){'],
  ['function cp19DirectGestureFallback(type){','function buttonSound(){']
 ])assert.equal(section(next,a,b),section(old,a,b),a);
 assert.equal(read('preview-variants-clock-fit.mjs').includes('scaleX=portrait?1.79:2.87'),true);
 assert.equal(read('preview-variants-clock-fit.mjs').includes('scaleY=portrait?5.20:2.46'),true);
 const css=read('preview-graphite-deck.css');
 assert.doesNotMatch(css,/\.clock\s*\{|\.clock-frame\s*\{|\.round-line\s*\{|font-size\s*:|--wheel-row\s*:/);
});

test('only visible action state changes with START to PAUSE; no new countdown updates',()=>{
 const old=read('preview-graphite-prewarm-app.mjs'),next=read('preview-graphite-deck-app.mjs');
 const original="  el.start.textContent=action;\n  el.start.disabled=!!el.settings.open;";
 const changed="  el.start.textContent=action;\n  if(PREVIEW_CONTROL_DECK)el.start.dataset.controlState=session?.status==='running'?'pause':'start';\n  el.start.disabled=!!el.settings.open;";
 assert.ok(old.includes(original));
 assert.ok(next.includes(changed));
 const normalize=s=>s.replace(/const PREVIEW_VARIANT=[^\n]+/,'PREVIEW_VARIANT=PIN')
  .replace(/const PREVIEW_CONTROL_DECK=[^\n]+\n/,'')
  .replace(/const PREVIEW_PREWARM=[^\n]+/,'PREVIEW_PREWARM=PIN')
  .replace(/const CP19_VERSION=[^\n]+/,'CP19_VERSION=PIN')
  .replace(/const prewarmReadout=[^\n]+/,'PREWARM_READOUT=PIN')
  .replace(changed,original);
 assert.equal(normalize(old),normalize(next),'timer and sound behavior may not silently change');
});

test('main-screen controls visually match approved graphite metal, with pause in amber',()=>{
 const css=read('preview-graphite-deck.css');
 assert.match(css,/APP-001 TEST 0\.8\.20\.13 — Graphite Control Deck/);
 assert.match(css,/\.controls \.main-button\{/);
 assert.match(css,/\.controls \.secondary-button\{/);
 assert.match(css,/data-control-state="pause"/);
 assert.match(css,/#0aaf67/);
 assert.match(css,/#eda52c/);
 assert.match(css,/#475768/);
 assert.match(css,/\.secondary-button::before\{/);
 assert.match(css,/#e33d4b/);
 assert.match(css,/#settings:not\(\[open\]\)/);
 assert.match(css,/button:focus-visible/);
 assert.match(css,/button:disabled/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/display:none|pointer-events:auto|touch-action:none/i);
});

test('Graphite A2 settings, wheel mechanics, red limit dashes and frozen countdown preserved',()=>{
 const html=read('preview-graphite-deck.html');
 assert.match(html,/preview-graphite-v2\.css\?v=082011/);
 assert.match(html,/preview-variants-base\.css\?v=082010/);
 const css=read('preview-variants-base.css'),graphite=read('preview-graphite-v2.css');
 assert.match(css,/--wheel-row:44px;width:94%/);
 assert.match(css,/z-index:5;color:#e12b3f/);
 assert.match(graphite,/margin-top:auto/);
 assert.match(graphite,/scale\(1\.055\)/);
 const metadata=JSON.parse(read('preview-build.json'));
 assert.equal(metadata.production,false);
 assert.equal(metadata.version,'v0.8.20.15-main-graphite-ambient-music-test');
 assert.match(read('sw.js'),/round-timer-shell-v0\.8\.20\.15-main-graphite-ambient/);
 assert.match(read('index.html'),/src="\.\/app-graphite-main-082015\.mjs\?v=082015"/);
});
