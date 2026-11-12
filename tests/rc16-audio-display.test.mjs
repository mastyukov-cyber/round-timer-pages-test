import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createActiveSoundController} from '../audio-guard.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const near=(a,b)=>Math.abs(a-b)<0.00001;

function harness(){
 const sources=[],gains=[];
 const context={
   currentTime:7,destination:{},
   createBufferSource(){
     const s={buffer:null,onended:null,starts:[],stops:[],
       connect(){},disconnect(){},start(t){this.starts.push(t);},stop(t){this.stops.push(t);}};
     sources.push(s);return s;
   },
   createGain(){
     const schedule=[];
     const gain={value:1,
       setValueAtTime(value,time){schedule.push({kind:'set',value,time});this.value=value;},
       linearRampToValueAtTime(value,time){schedule.push({kind:'ramp',value,time});this.value=value;},
       cancelScheduledValues(){}};
     gains.push({gain,schedule});
     return {gain,connect(){},disconnect(){}};
   }
 };
 return {context,sources,gains};
}
test('RC16 WebAudio button only gets quieter smooth 4ms attack and 12ms tail',()=>{
 const {context,sources,gains}=harness();
 createActiveSoundController().play({context,buffer:{duration:.30},category:'button',volume:.72});
 const at=sources[0].starts[0],v=gains[0].schedule;
 assert(near(at,7.008));
 assert.equal(v.length,4);
 assert.equal(v[0].kind,'set');
 assert(near(v[0].value,.015)&&near(v[0].time,at));
 assert.equal(v[1].kind,'ramp');
 assert(near(v[1].value,.72)&&near(v[1].time,at+.004));
 assert(near(v[2].time,at+.30-.012));
 assert(near(v[3].time,at+.30)&&near(v[3].value,.015));
});
test('RC16 gongs and clacks keep original unshaped WebAudio timing and gain',()=>{
 const {context,sources,gains}=harness(),c=createActiveSoundController();
 c.play({context,buffer:{duration:2},category:'cue',volume:.90});
 c.play({context,buffer:{duration:.16},offset:.115,category:'cue',volume:.96});
 assert.equal(gains[0].schedule.length,0);
 assert.equal(gains[1].schedule.length,0);
 assert.equal(gains[0].gain.value,.9);
 assert.equal(gains[1].gain.value,.96);
 assert(near(sources[0].starts[0],7.008));
 assert(near(sources[1].starts[0],7.123));
 const app=source('app.mjs');
 assert(app.includes("volume:kind==='button'?.72:kind==='clack'?.96:.9"));
 assert(app.includes("type==='ten-double'?[0,.130]"));
});
test('RC16 counter is 1.5× RC15 and moved down in both orientations',()=>{
 const app=source('app.mjs'),css=source('styles.css'),index=source('index.html');
 assert(app.includes('ctx.font=`900 ${base*4.5}px ${st.fontFamily}`'));
 assert(app.includes('if(total>max)base*=max/total'));
 assert(css.includes('.round-count {font-size:4.5em'));
 assert(css.includes('translateY(clamp(20px,3.2vh,34px))'));
 assert(css.includes('translateY(clamp(11px,2.6vh,22px))'));
 assert(index.includes('id="roundCount" role="text"'));
});
test('RC16 larger countdown is responsive and original timer model unchanged',()=>{
 const app=source('app.mjs'),css=source('styles.css');
 assert(app.includes('isPreview?1.38:1.2'));
 assert(app.includes('isPreview?4.05:4.3164'));
 assert(app.includes('isPreview?1.79:1.587'));
 assert(app.includes('isPreview?1.045:.98'));
 assert(app.includes('isPreview?1.01:.95'));
 assert(css.includes('transform:scale(1.38,4.05)'));
 assert(css.includes('transform:scale(1.79,1.79)'));
 assert(app.includes('Math.min(byWidth,byHeight,620)'));
});
test('RC16 TEST identity is consistent and never production',()=>{
 const build=JSON.parse(source('preview-build.json')),html=source('index.html'),sw=source('sw.js');
 assert.equal(build.version,'v0.8.13-rc17');
 assert.equal(build.production,false);
 assert.equal(build.source_commit,'649144d04336ff0be54cde180e1c90dee2801b9b');
 assert(html.includes('ТЕСТОВАЯ ВЕРСИЯ · v0.8.13-rc17'));
 assert(sw.includes('round-timer-shell-v0.8.13-rc17'));
});
