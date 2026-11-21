import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cp18WindowFromSearch,deferredButtonCueAllowed} from '../cp18-audio-window.mjs';
import {createHtmlAudioController} from '../html-audio.mjs';

const src=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('CP18 links select only 0 or 30ms, baseline remains unchanged',()=>{
 assert.equal(cp18WindowFromSearch('?cp18=0'),0);
 assert.equal(cp18WindowFromSearch('?cp18=30'),30);
 for(const invalid of ['', '?cp18=180', '?cp18=-1', '?cp18=1000', '?cp18=foo']){
  assert.equal(cp18WindowFromSearch(invalid),null);
 }
 assert.equal(cp18WindowFromSearch('?utm_source=test&cp18=0'),0);
});
test('0ms never queues a late WebAudio button echo; 30ms window is strict',()=>{
 for(const age of [0,1,15,29,30,31,180,2000]){
  assert.equal(deferredButtonCueAllowed(age,0),false);
  assert.equal(deferredButtonCueAllowed(age,30),age<=30);
 }
 for(const age of [-1,NaN,Infinity]){
  assert.equal(deferredButtonCueAllowed(age,30),false);
 }
 assert.equal(deferredButtonCueAllowed(180,180),true,'normal TEST root remains 180ms');
});
test('CP18 branch uses original MP3 directly on gesture before late promise',async()=>{
 const srcApp=src('app.mjs');
 assert(srcApp.includes("if(sound('button'))return true;"));
 assert(srcApp.includes("if(!CP19&&CP18_BUTTON_WINDOW_MS!==null&&htmlSounds?.playButton())"));
 assert(srcApp.includes('deferredButtonCueAllowed(age,maxLateMs)'));
 assert(srcApp.includes('CP18_BUTTON_WINDOW_MS===null?180:CP18_BUTTON_WINDOW_MS'));
 assert(srcApp.includes("CP18_BUTTON_WINDOW_MS===null?'timer-active-session-v1'"));
 assert(srcApp.includes('timer-active-session-cp19-${CP19_MODE}-v1'));
 assert(srcApp.includes('if(label)label.textContent='));
 const played=[];
 const makeAudio=path=>({
  paused:true,currentTime:0,preload:'none',load(){},
  pause(){this.paused=true;},
  play(){this.paused=false;played.push(path);return Promise.resolve();}
 });
 const transport=createHtmlAudioController({
  makeAudio,paths:{start:'s',end:'e',clack:'c',button:'button.mp3'},isActive:()=>true
 });
 assert.equal(transport.playButton(),true);
 assert.deepEqual(played,['button.mp3']);
 assert.equal(transport.playButton(),true);
 assert.deepEqual(played,['button.mp3','button.mp3']);
});
test('offline TEST updates to unique CP18 cache and preloads policy without touching audio files',()=>{
 const sw=src('sw.js');
 assert(sw.includes("round-timer-shell-v0.8.19.9-test-cp19f-ui-wheels"));
 assert(sw.includes("'./cp18-audio-window.mjs'"));
 assert(sw.includes("const local = await cache.match(event.request)"));
 assert(sw.includes("const root = await cache.match('./')"));
 assert(src('app.mjs').includes("type==='ten-double'?[0,.478]"));
 assert(src('app.mjs').includes("volume:kind==='button'?.1944:kind==='clack'?.96:.9"));
});
