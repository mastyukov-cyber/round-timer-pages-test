import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prewarmButtonFirst} from '../preview-audio-prewarm.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('prewarm decodes button before starting competing gong/clack requests',async()=>{
 const entries=[['start','gong.wav'],['end','end.wav'],['clack','clack.wav'],['button','button.wav']];
 let releaseButton;
 const buttonGate=new Promise(resolve=>{releaseButton=resolve});
 const order=[];
 const job=prewarmButtonFirst(entries,async ([name])=>{
  order.push('begin:'+name);
  if(name==='button')await buttonGate;
  order.push('done:'+name);
 });
 assert.deepEqual(order,['begin:button']);
 releaseButton();
 await job;
 assert.equal(order[0],'begin:button');
 assert.equal(order[1],'done:button');
 assert.deepEqual(order.filter(x=>x.startsWith('begin:')).sort(),
  ['begin:button','begin:clack','begin:end','begin:start']);
});

test('missing button falls back to original parallel cue preload without side effects',async()=>{
 const started=[];
 await prewarmButtonFirst([['start','a'],['end','b']],async([name])=>started.push(name));
 assert.deepEqual(started,['start','end']);
 await assert.rejects(prewarmButtonFirst(null,()=>{}),TypeError);
 await assert.rejects(prewarmButtonFirst([],null),TypeError);
});

test('Graphite Prewarm LAB has same UI, dark theme and clock geometry as approved A2',()=>{
 const original=read('preview-graphite-v2.html');
 const candidate=read('preview-graphite-prewarm.html');
 assert.match(candidate,/v0\.8\.20\.12-PW-audio-prewarm-lab/);
 assert.match(candidate,/preview-graphite-prewarm-app\.mjs\?v=082012/);
 assert.match(candidate,/preview-graphite-v2\.css\?v=082011/);
 assert.match(candidate,/preview-graphite\.css\?v=082010/);
 assert.doesNotMatch(candidate,/preview-variants-clock-fit/);
 assert.equal((original.match(/<label>/g)||[]).length,(candidate.match(/<label>/g)||[]).length);
 for(const id of ['workInput','roundsInput','prepareInput','restInput','startPauseButton','resetButton','clock','roundCurrent','roundTotal'])
  assert.ok(candidate.includes('id="'+id+'"'),id);
 assert.doesNotMatch(candidate,/rel="manifest"/);
 assert.ok(read('preview-graphite-v2.css').includes('round-line'));
});

test('clock, full timer behavior and button play operation stay bit-identical to Graphite A2',()=>{
 const original=read('preview-graphite-v2-app.mjs');
 const exp=read('preview-graphite-prewarm-app.mjs');
 function snippet(text,start,end){
  const a=text.indexOf(start),b=text.indexOf(end,a);
  assert.ok(a>=0&&b>a,'missing section '+start);
  return text.slice(a,b);
 }
 for(const [a,b] of [
  ['function fitClock(force=false){',"window.addEventListener('resize'"],
  ['function buttonSound(){','// Pointerdown plays the button sound'],
  ['function startPause(){','function reset(){'],
  ['function draw(', 'function startPause(){']]){
  assert.equal(snippet(exp,a,b),snippet(original,a,b),a+' must stay frozen');
 }
 const clock=read('preview-variants-clock-fit.mjs');
 assert.match(clock,/scaleX=portrait\?1\.79:2\.87/);
 assert.match(clock,/scaleY=portrait\?5\.20:2\.46/);
});

test('prewarm fetch+decode is before first gesture, no autoplay, no synthesized taps',()=>{
 const exp=read('preview-graphite-prewarm-app.mjs');
 assert.match(exp,/const PREVIEW_PREWARM=PREVIEW_VARIANT==='graphite-prewarm'/);
 assert.match(exp,/soundsLoading=\(PREVIEW_PREWARM\?prewarmButtonFirst\(soundEntries,decodeEntry\):/);
 assert.match(exp,/const buffer=await context\.decodeAudioData\(raw\)/);
 assert.match(exp,/const resp=await fetch\(url\)/);
 assert.match(exp,/PREVIEW_PREWARM&&name==='button'/);
 assert.match(exp,/if\(soundEnabled&&isPreview&&audioMode==='web'&&\(window\.AudioContext/);
 assert.match(exp,/void preloadSounds\(\)/);
 assert.doesNotMatch(exp,/dispatchEvent\(new (?:PointerEvent|MouseEvent)/);
 assert.doesNotMatch(exp,/\.play\(\)[\s;]*\/\/.*auto/i);
 const module=read('preview-audio-prewarm.mjs');
 assert.doesNotMatch(module,/\.play\(|\.start\(|\.resume\(/);
});

test('first audible sample measurement is local playing event, not an acoustic-latency claim',()=>{
 const exp=read('preview-graphite-prewarm-app.mjs');
 assert.match(exp,/event\.isTrusted/);
 assert.match(exp,/addEventListener\('playing'/);
 assert.match(exp,/performance\.now\(\)-firstButtonPointerAt/);
 assert.match(exp,/не замер динамика/);
 assert.match(exp,/className='prewarm-readout'/);
 assert.doesNotMatch(exp,/prewarmReadout.*diagnosticSender\.report/);
 assert.equal(JSON.parse(read('preview-build.json')).production,false);
 assert.equal(JSON.parse(read('preview-build.json')).version,
  'v0.8.20.9-skeuomorphic-wheels-landscape-first-tap-test');
 assert.match(read('sw.js'),/round-timer-shell-v0\.8\.20\.9-test-settings-sync/);
});
