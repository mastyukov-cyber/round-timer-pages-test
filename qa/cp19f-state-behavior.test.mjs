import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const src=readFileSync(new URL('../app.mjs',import.meta.url),'utf8');
function extract(start,end){const a=src.indexOf(start),b=src.indexOf(end,a);assert.ok(a>=0&&b>a);return src.slice(a,b);}
test('idle configuration saves and restores across new app context',()=>{
 const code=extract('function restoreSavedSettings(){','function restore(){');
 const storage=new Map();
 const context={SETTINGS_KEY:'round-timer-cp19f-settings-v1',STORAGE_KEY:'timer-active-session-cp19-wav-keepalive-v1',
  config:{rounds:3,work:60,rest:30,prepare:3},session:null,
  localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},
  normalizeConfig:c=>({...c})};
 vm.runInNewContext(code,context);
 context.save();assert.equal(JSON.parse(storage.get(context.SETTINGS_KEY)).rounds,3);
 context.config={rounds:5,work:90,rest:45,prepare:0};context.save();
 context.config={rounds:1,work:60,rest:0,prepare:0};context.restoreSavedSettings();
 assert.equal(context.config.rounds,5);
 assert.equal(context.config.work,90);
 assert.equal(storage.has(context.STORAGE_KEY),false);
});
test('sound toggle is silent when OFF, one WAV sample when ready, one HTML fallback when cold',()=>{
 const code=extract('function renderSoundToggle(){','let config=normalizeConfig');
 const listeners={}; const stored=new Map();const events=[];
 const toggle={textContent:'',dataset:{},setAttribute(n,v){events.push('aria:'+n+'='+v);},addEventListener(n,fn){listeners[n]=fn;}};
 const state={el:{soundToggle:toggle,soundControl:{hidden:true}},CP19F_UX:true,soundEnabled:true,
  SOUND_KEY:'round-timer-cp19f-sound-toggle-v1',localStorage:{setItem:(k,v)=>stored.set(k,v)},
  buttonCueEpoch:0,delayedStartGong:{invalidate(){events.push('invalidate')}},
  stopActiveAudio(){events.push('stop')},cp19KeepAlive:{stop(){events.push('keepalive_stop')}},
  cp19Gesture(){events.push('prime')},buttonSound(){events.push('button')},
  audioMode:'web',soundBuffers:{button:null},htmlSounds:{playButton(){events.push('html-button');return true;}}};
 vm.runInNewContext(code,vm.createContext(state));
 assert.equal(toggle.textContent,'ВКЛ');
 listeners.click();assert.equal(state.soundEnabled,false);assert.equal(toggle.textContent,'ВЫКЛ');
 assert.equal(events.includes('html-button'),false);
 assert.equal(events.includes('button'),false);
 listeners.click();assert.equal(state.soundEnabled,true);assert.equal(toggle.textContent,'ВКЛ');
 assert.equal(events.filter(x=>x==='html-button').length,1);
 assert.equal(events.filter(x=>x==='button').length,0);
 state.soundBuffers.button={};
 listeners.click();listeners.click();
 assert.equal(events.filter(x=>x==='button').length,1);
 assert.equal(events.filter(x=>x==='html-button').length,1);
 assert.equal(stored.get(state.SOUND_KEY),'on');
});
