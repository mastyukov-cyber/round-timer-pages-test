import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHtmlAudioController} from '../html-audio.mjs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('RC19 two ten-second stick hits are exactly 140ms apart in WebAudio and HTML fallback',()=>{
 const app=src('app.mjs'),scheduled=[],played=[];
 assert(app.includes("type==='ten-double'?[0,.140]"));
 const ctrl=createHtmlAudioController({
  makeAudio:n=>({paused:true,currentTime:0,load(){},pause(){this.paused=true;},play(){played.push(n);this.paused=false;return Promise.resolve();}}),
  paths:{start:'start',end:'end',clack:'wood-single',double:'wood-double',button:'button'},
  isActive:()=>true,
  schedule:(fn,ms)=>{const task={fn,ms};scheduled.push(task);return task;},unschedule:()=>{}
 });
 ctrl.play('ten-double');
 assert.equal(scheduled.length,1);
 assert.equal(scheduled[0].ms,140);
 assert.deepEqual(played,['wood-single']);
 scheduled[0].fn();
 assert.deepEqual(played,['wood-single','wood-single']);
});

test('RC19 word РАУНД gets deliberate optical lift while 1/3 and slash remain aligned',()=>{
 const css=src('styles.css'),html=src('index.html');
 assert(css.includes('.round-line {display:flex;justify-content:center;align-items:flex-end;'));
 assert(css.includes('padding-bottom:0;transform:translateY(-.44em)'));
 assert(css.includes('.round-count {font-size:4.5em'));
 assert(css.includes('.round-slash {display:block;flex:none;'));
 assert(html.includes('id="roundCurrent">1</span>'));
 assert(html.includes('id="roundTotal">3</span>'));
});

test('RC19 clock grows in both orientations but is bounded by available width and height',()=>{
 const css=src('styles.css'),app=src('app.mjs');
 assert(app.includes('isPreview?1.51:1.2'));
 assert(app.includes('isPreview?2.23:1.587'));
 assert(app.includes('isPreview?.965:.98'));
 assert(css.includes('transform:scale(1.51,4.05)'));
 assert(css.includes('transform:scale(2.23,1.79)'));
 const old=[{x:1.38,y:4.05},{x:1.79,y:1.79}];
 const current=[{x:1.51,y:4.05},{x:2.23,y:1.79}];
 const sampleFrames=[{w:390,h:140},{w:850,h:150}];
 for(let i=0;i<2;i++){
  const {w,h}=sampleFrames[i],metrics=3.18;
  const calc=c=>Math.min((w*.965)/(metrics*c.x),h*.985/c.y,620);
  const widthOld=calc(old[i])*metrics*old[i].x;
  const widthNew=calc(current[i])*metrics*current[i].x;
  assert(widthNew>=widthOld-1e-7,'clock never shrinks in pixels');
  assert(widthNew <=w*.965+1e-7,'clock must not clip into lateral margins');
  assert(calc(current[i])*current[i].y<=h*.985+1e-7,'clock must not clip vertically');
 }
 assert(app.includes('Math.min(byWidth,byHeight,620)'));
});

test('RC19 stays TEST-only with new offline cache, unchanged timer engine and Web Audio',()=>{
 const b=JSON.parse(src('preview-build.json')),html=src('index.html'),sw=src('sw.js'),app=src('app.mjs');
 assert.equal(b.version,'v0.8.15-rc19');
 assert.equal(b.production,false);
 assert.equal(b.source_commit,'7e80423fdfbf3d64068c8abcee0d413956980960');
 assert.equal((html.match(/v0\\.8\\.15-rc19/g)||[]).length,2);
 assert(sw.includes("const CACHE_NAME = 'round-timer-shell-v0.8.15-rc19'"));
 assert(app.includes("let audioMode='web'"));
 assert(app.includes("volume:kind==='button'?.72:kind==='clack'?.96:.9"));
});
