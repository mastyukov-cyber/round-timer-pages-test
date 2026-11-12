import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHtmlAudioController} from '../html-audio.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

function mock(){
 const files=[],delays=[];
 const makeAudio=path=>{
  const player={path,paused:true,muted:false,plays:0,seeks:0,_time:0,
   load(){},pause(){this.paused=true;},
   get currentTime(){return this._time;},
   set currentTime(t){this.seeks++;this._time=t;},
   play(){this.plays++;this.paused=false;return Promise.resolve();}
  };
  files.push(player);return player;
 };
 const controller=createHtmlAudioController({
  makeAudio,paths:{start:'gong-start',end:'gong-end',clack:'single',double:'double',button:'button'},
  isActive:()=>true,
  schedule:(fn,ms)=>{const task={fn,ms};delays.push(task);return task;},
  unschedule:()=>{}
 });
 return {controller,files,delays};
}
test('RC15 HTML clack starts without needless seeking on a silent media element',()=>{
 const {controller,files}=mock();
 controller.play('single');
 const clack=files.find(x=>x.path==='single');
 assert.equal(clack.plays,1);
 assert.equal(clack.seeks,0,'do not seek 0->0 before starting audio on iPhone');
});
test('RC15 ten-second double consists of two approved single hits 115ms apart',()=>{
 const {controller,files,delays}=mock();
 controller.play('ten-double');
 const singles=files.filter(x=>x.path==='single');
 assert.equal(singles.length,2);
 assert.equal(singles[0].plays,1);
 assert.equal(singles[1].plays,0);
 assert.equal(delays.length,1);
 assert.equal(delays[0].ms,115);
 delays[0].fn();
 assert.equal(singles[1].plays,1);
 const app=source('app.mjs');
 assert(app.includes("type==='ten-double'?[0,.115]"),'WebAudio double must use same 115ms interval');
});
test('RC15 repeated buttons alternate two ready players instead of interrupting the first',()=>{
 const {controller,files}=mock();
 controller.playButton();controller.playButton();
 const buttons=files.filter(x=>x.path==='button');
 assert.equal(buttons.length,2);
 assert.equal(buttons[0].plays,1);
 assert.equal(buttons[1].plays,1);
 assert.equal(buttons[0].seeks,0);
 assert.equal(buttons[1].seeks,0);
});
test('RC15 visual timer is unshifted while HTML cue requests advance by 250ms',()=>{
 const app=source('app.mjs');
 assert(app.includes('computePhase(config,elapsedNow()+250)'));
 assert(app.includes('crossedCountdown(lastCuePhase||lastPhase,cuePhase)'));
 assert(app.includes("const phase=session?phaseNow():computePhase({...config,prepare:0},0);"));
});
test('RC16 shows 4.5x number, moves round closer, slightly wider but less tall portrait timer',()=>{
 const html=source('index.html'),css=source('styles.css'),app=source('app.mjs'),sw=source('sw.js');
 assert(html.includes('id="roundCount">1/3'));
 assert(css.includes('.round-count {font-size:4.5em'));
 assert(css.includes('transform:translateY(clamp(10px,2vh,20px))'));
 assert(css.includes('transform:scale(1.38,4.05)'));
 assert(css.includes('transform:scale(1.79,1.79)'));
 assert(app.includes('if(total>max)base*=max/total'));
 assert(sw.includes('round-timer-shell-v0.8.12-rc16'));
 const build=JSON.parse(source('preview-build.json'));
 assert.equal(build.version,'v0.8.12-rc16');
 assert.equal(build.production,false);
});
