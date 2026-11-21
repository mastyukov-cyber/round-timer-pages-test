import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHtmlAudioController} from '../html-audio.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.mjs');
function section(start,end){
 const a=app.indexOf(start),b=app.indexOf(end,a);
 assert.ok(a>=0&&b>a,'missing section '+start);
 return app.slice(a,b);
}
function buttonHarness(options={}){
 const calls=[];let webReady=!!options.webReady, fallbackWorks=options.fallbackWorks!==false;
 const context={
  CP19:{prime:true},CP18_BUTTON_WINDOW_MS:null,isPreview:true,
  soundEnabled:true,document:{hidden:false},audioInterruption:{interrupted:false},
  audioMode:'web',audioGestureSeen:false,buttonCueEpoch:0,
  audioContext:webReady?{state:'running'}:null,
  soundBuffers:{button:webReady?{}:null},
  htmlSounds:{
   playButton(){calls.push('html-button');return fallbackWorks},
   play(type){calls.push('html-'+type);return fallbackWorks}
  },
  unlockAudio(){calls.push('unlock');return Promise.resolve(true)},
  sound(type){calls.push('web-'+type);return webReady},
  sessionMix:{begin(){}},Date,Promise
 };
 vm.runInNewContext(section('function cp19DirectGestureFallback(type){','// Pointerdown plays the button sound'),context);
 return {context,calls,setWebReady(value){webReady=value;context.audioContext={state:'running'};context.soundBuffers.button={}}};
}
test('first cold press attempts HTML button synchronously, never queues another Web Audio echo',async()=>{
 const h=buttonHarness();
 assert.equal(h.context.buttonSound(),true);
 assert.equal(h.calls.filter(x=>x==='html-button').length,1);
 assert.equal(h.calls.filter(x=>x==='web-button').length,0);
 await Promise.resolve();await Promise.resolve();
 assert.equal(h.calls.filter(x=>x==='web-button').length,0,'no deferred duplicate cue');
 assert.equal(h.context.buttonCueEpoch,1);
});
test('warm second press uses Web Audio only, with no HTML duplicate',()=>{
 const h=buttonHarness({webReady:true});
 assert.equal(h.context.buttonSound(),true);
 assert.deepEqual(h.calls,['web-button']);
});
test('fallback unavailable allows click retry, and sound OFF/hidden/interrupted never attempt HTML',()=>{
 const h=buttonHarness({fallbackWorks:false});
 assert.equal(h.context.buttonSound(),false);
 assert.equal(h.calls.filter(x=>x==='html-button').length,1);
 h.context.soundEnabled=false;
 assert.equal(h.context.buttonSound(),false);
 assert.equal(h.context.cp19DirectGestureFallback('start'),false);
 h.context.soundEnabled=true;
 h.context.document.hidden=true;
 assert.equal(h.context.cp19DirectGestureFallback('start'),false);
 h.context.document.hidden=false;h.context.audioInterruption.interrupted=true;
 assert.equal(h.context.cp19DirectGestureFallback('start'),false);
 assert.equal(h.calls.filter(x=>x==='html-start').length,0);
});
function startHarness(prepare,{webReady=false,fallbackWorks=true,soundEnabled=true}={}){
 const calls=[],config={prepare,work:60,rest:30,rounds:3};
 const context={
  el:{settings:{open:false}},session:null,lastPhase:null,lastCuePhase:null,config,
  audioGestureSeen:false,soundEnabled,audioClockNeedsGesture:false,
  audioContext:{state:webReady?'running':'suspended'},
  soundBuffers:{start:webReady?{}:null},cp19Worklet:{ready:false},
  CP19:{transport:'web'},isPreview:true,
  cp19CanPlayStartCue:()=>webReady,
  cp19DirectGestureFallback(type){calls.push('html-'+type);return fallbackWorks},
  sound(type){calls.push('web-'+type);return webReady},
  stopActiveAudio(opts){calls.push(['stop',opts])},
  delayedStartGong:{invalidate(){calls.push('invalidate')},schedule(){calls.push('delayed')}},
  unlockAudio(){calls.push('unlock');return Promise.resolve(true)},
  readConfig(){return config},updateInputs(){},
  firstClackMeasured:false,cueLatencyLabel:null,showAudioRecovery(){},
  audioRecoveryEpoch:0,Date,phaseNow(){return {key:'work'}},
  keepForegroundMix(){return false},ensureScreenOn(){},
  save(){},draw(){},releaseScreenOn(){},
  webRetirement:{retire(){}},audioClockWatchdog:{resetEpoch(){}},
  elapsedNow(){return 0}
 };
 vm.runInNewContext(section('function startPause(){','function reset(){'),context);
 return {context,calls};
}
test('cold START with zero preparation plays one direct gong; no delayed replay',()=>{
 const h=startHarness(0);
 assert.equal(h.context.startPause(),true);
 assert.equal(h.context.session.status,'running');
 assert.equal(h.calls.filter(x=>x==='html-start').length,1);
 assert.equal(h.calls.filter(x=>x==='delayed').length,0);
 const stop=h.calls.find(x=>Array.isArray(x)&&x[0]==='stop');
 assert.equal(stop[1].preserveButton,true);
});
test('START uses existing delayed guard only when direct HTML fallback unavailable',()=>{
 const h=startHarness(0,{fallbackWorks:false});
 h.context.startPause();
 assert.equal(h.calls.filter(x=>x==='html-start').length,1);
 assert.equal(h.calls.filter(x=>x==='delayed').length,1);
});
test('short preparation plays direct clack when WAV cold; no extra click sound',()=>{
 const h=startHarness(3);
 h.context.startPause();
 assert.equal(h.calls.filter(x=>x==='html-single').length,1);
 assert.equal(h.calls.filter(x=>x==='delayed').length,0);
 const long=startHarness(10);long.context.startPause();
 assert.equal(long.calls.filter(x=>String(x).startsWith('html-')).length,0);
});
test('ready Web Audio START does not produce an HTML fallback',()=>{
 const h=startHarness(0,{webReady:true});h.context.startPause();
 assert.equal(h.calls.filter(x=>x==='web-start').length,1);
 assert.equal(h.calls.filter(x=>x==='html-start').length,0);
});
test('existing HTML audio players are preloaded and first play starts without a timer',async()=>{
 const samples=[];let loads=0,plays=0;
 const ctrl=createHtmlAudioController({
  makeAudio:path=>{const el={path,paused:true,currentTime:0,muted:false,load(){loads++},play(){plays++;this.paused=false;return Promise.resolve()},pause(){this.paused=true}};samples.push(el);return el},
  paths:{start:'start.wav',end:'end.wav',clack:'clack.wav',button:'button.wav'},
  isActive:()=>true
 });
 assert.ok(loads>=6);
 assert.equal(ctrl.playButton(),true);
 assert.equal(plays,1);
 assert.equal(ctrl.playButton(),true);
 assert.equal(plays,2);
 await Promise.resolve();
 ctrl.stopAll();
});
test('scope protects sound toggle, background state, original rhythm, and new offline cache',()=>{
 assert.match(app,/if\(!CP19\|\|!soundEnabled\|\|document\.hidden\|\|audioInterruption\.interrupted\|\|!htmlSounds\)return false/);
 assert.match(app,/if\(CP19\)\{\s*const accepted=cp19DirectGestureFallback\('button'\)/);
 assert.match(app,/const maxLateMs=CP19\?0:/);
 assert.match(app,/type==='ten-double'\?\[0,\.478\]/);
 assert.match(app,/round-timer-cp19f-settings-v1/);
 const meta=JSON.parse(read('preview-build.json'));
 assert.equal(meta.version,'v0.8.20.8-compact-wheels-cold-audio-priority-test');
 assert.equal(meta.production,false);
 assert.equal(meta.cp19f_cold_first_tap.physical_device_qa,'NOT_RUN');
 assert.match(read('sw.js'),/round-timer-shell-v0\.8\.20\.8-test-settings-sync/);
 assert.match(read('index.html'),/src="\.\/app\.mjs\?v=08208"/);
});
