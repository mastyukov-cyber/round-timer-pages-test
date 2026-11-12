import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHtmlAudioController} from '../html-audio.mjs';
const src=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('RC17 Web Audio selected permanently, no audio or latency fields in settings',()=>{
 const app=src('app.mjs');
 assert(app.includes('const AUDIO_QA_CONTROLS=false;'));
 assert(app.includes("let audioMode='web';"));
 assert(app.includes('if(AUDIO_QA_CONTROLS && isPreview)'));
 assert(app.includes('if(isPreview && AUDIO_QA_CONTROLS && htmlSounds)'));
 assert(app.includes('if(isPreview && AUDIO_QA_CONTROLS){'));
 assert(app.includes('const cueLatencyLabel=isPreview&&AUDIO_QA_CONTROLS?'));
 assert(app.includes('function buttonSound()'));
 assert(app.includes("volume:kind==='button'?.72:kind==='clack'?.96:.9"));
});
test('RC17 ten-second WebAudio and HTML Audio have identical 130ms interval',()=>{
 const app=src('app.mjs'),timers=[],sound=[];
 assert(app.includes("type==='ten-double'?[0,.130]"));
 const controller=createHtmlAudioController({
  makeAudio:name=>{const a={name,paused:true,currentTime:0,play(){sound.push(name);this.paused=false;return Promise.resolve();},pause(){this.paused=true;},load(){}};return a;},
  paths:{start:'start',end:'end',clack:'single',double:'double',button:'button'},
  isActive:()=>true,
  schedule:(fn,ms)=>{const task={fn,ms};timers.push(task);return task;},unschedule:()=>{}
 });
 controller.play('ten-double');
 assert.deepEqual(sound,['single']);
 assert.equal(timers.length,1);
 assert.equal(timers[0].ms,130);
 timers[0].fn();
 assert.deepEqual(sound,['single','single']);
});
test('RC17 diagonal round slash is geometrically centered, not a font glyph',()=>{
 const html=src('index.html'),css=src('styles.css'),app=src('app.mjs');
 assert(html.includes('id="roundCurrent">1</span>'));
 assert(html.includes('class="round-slash" aria-hidden="true"'));
 assert(html.includes('id="roundTotal">3</span>'));
 assert(css.includes('.round-slash {display:block;flex:none;'));
 assert(css.includes('align-items:center'));
 assert(css.includes('border-left:.055em solid currentColor'));
 assert(css.includes('height:.70em'));
 assert(app.includes('el.roundCurrent.textContent=String(phase.round)'));
 assert(app.includes('el.roundTotal.textContent='));
 assert(app.includes('ctx.measureText(fraction)'));
 assert(app.includes('if(total>max)base*=max/total'));
});
test('RC17 iOS resuming and full-height layout keeps settings button reachable',()=>{
 const css=src('styles.css'),app=src('app.mjs');
 assert(css.includes('@supports (height:100svh) {.app-shell {height:100svh;max-height:100svh;}}'));
 assert(css.includes('.bottom-actions {margin-bottom:clamp(5px,1vh,12px);'));
 assert(css.includes('.bottom-actions {width:100%;'));
 assert(app.includes("window.visualViewport?.addEventListener?.('resize'"));
 assert(app.includes("window.addEventListener('focus'"));
 assert(app.includes("window.addEventListener('pageshow'"));
 assert(app.includes("lastClockLayout='';\n  draw({notify:false}); // Never replay any skipped background gong/clacks."));
});
test('RC17 unique visible version and fresh offline cache; source TEST only',()=>{
 const html=src('index.html'),worker=src('sw.js'),meta=JSON.parse(src('preview-build.json'));
 assert.equal(meta.production,false);
 assert.equal(meta.version,'v0.8.13-rc17');
 assert.equal(meta.source_commit,'649144d04336ff0be54cde180e1c90dee2801b9b');
 assert.equal((html.match(/v0.8.13-rc17/g)||[]).length,2);
 assert(worker.includes("const CACHE_NAME = 'round-timer-shell-v0.8.13-rc17'"));
});
