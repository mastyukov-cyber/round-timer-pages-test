import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHtmlAudioController} from '../html-audio.mjs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('RC18 exactly 140ms between two 10-second clacks on both engines',()=>{
 const app=src('app.mjs'),timers=[],hits=[];
 assert(app.includes("type==='ten-double'?[0,.140]"));
 const player=createHtmlAudioController({
  makeAudio:name=>({paused:true,currentTime:0,load(){},pause(){this.paused=true;},play(){hits.push(name);this.paused=false;return Promise.resolve();}}),
  paths:{start:'start',end:'end',clack:'approved-single',double:'approved-double',button:'button'},
  isActive:()=>true,
  schedule:(fn,ms)=>{const t={fn,ms};timers.push(t);return t;},
  unschedule:()=>{}
 });
 player.play('ten-double');
 assert.deepEqual(hits,['approved-single']);
 assert.equal(timers.length,1);
 assert.equal(timers[0].ms,140);
 timers[0].fn();
 assert.deepEqual(hits,['approved-single','approved-single']);
});

test('RC18 round word aligns with lower edge of 1/3, slash remains centered',()=>{
 const css=src('styles.css'),html=src('index.html');
 assert(css.includes('.round-line {display:flex;justify-content:center;align-items:flex-end;'));
 assert(css.includes('.round-word {font-size:1em;line-height:1;white-space:nowrap;padding-bottom:.055em;}'));
 assert(css.includes('.round-count {font-size:4.5em;'));
 assert(css.includes('.round-slash {display:block;flex:none;'));
 assert(html.includes('id="roundCurrent">1'));
 assert(html.includes('id="roundTotal">3'));
});

test('RC18 landscape reserves more height for countdown without overflow',()=>{
 const css=src('styles.css'),app=src('app.mjs');
 assert(app.includes('window.innerHeight*.037'),'landscape round header becomes compact');
 assert(app.includes('portrait?1.045:.985'),'landscape width uses safe <100% fill');
 assert(app.includes('portrait?1.01:.985'),'landscape height uses safe <100% fill');
 assert(css.includes('.scoreboard {gap:0;}'));
 assert(css.includes('.clock-frame {flex:1 1 auto;min-height:0;}'));
 assert(css.includes('.round-count {line-height:.94;}'));
 assert(css.includes('translateY(clamp(1px,.7vh,4px))'));
 const landscapeHeight=393,ratio=4.5;
 const oldHeight=landscapeHeight*.052*ratio,newHeight=landscapeHeight*.037*ratio*.94;
 assert(oldHeight-newHeight>25,'gain >25px for clock at representative iPhone landscape height');
 // The fitting algorithm constrains the transformed clock to both axes.
 for(const [frameWidth,frameHeight,measuredRaw] of [[840,175,318],[680,130,318],[1020,240,318]]){
  const scaleX=2.23,scaleY=1.79;
  const size=Math.min(frameWidth*.965/(measuredRaw/100)/scaleX,frameHeight*.985/scaleY,620);
  assert(size*(measuredRaw/100)*scaleX<=frameWidth*.965+1e-6);
  assert(size*scaleY<=frameHeight*.985+1e-6);
 }
});
test('RC18 portrait visual timer, WebAudio and buttons remain as in RC17',()=>{
 const app=src('app.mjs'),css=src('styles.css');
 assert(app.includes('isPreview?1.51:1.2'));
 assert(app.includes('isPreview?4.05:4.3164'));
 assert(app.includes('isPreview?2.23:1.587'));
 assert(app.includes('portrait?1.045:.985'));
 assert(app.includes('portrait?1.01:.985'));
 assert(app.includes("let audioMode='web'"));
 assert(app.includes("volume:kind==='button'?.72:kind==='clack'?.96:.9"));
 assert(css.includes('transform:scale(1.51,4.05)'));
});
test('RC18 metadata, visible label and new offline cache consistent; TEST only',()=>{
 const b=JSON.parse(src('preview-build.json')),html=src('index.html'),sw=src('sw.js');
 assert.equal(b.version,'v0.8.15-rc19');
 assert.equal(b.production,false);
 assert.equal(b.source_commit,'7e80423fdfbf3d64068c8abcee0d413956980960');
 assert.equal((html.match(/v0\.8\.14-rc18/g)||[]).length,2);
 assert(sw.includes("const CACHE_NAME = 'round-timer-shell-v0.8.15-rc19'"));
});
