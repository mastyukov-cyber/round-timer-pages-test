import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {CP19_MODES,cp19Mode,cp19Paths,cp19PrimeAudio} from '../cp19-audio-modes.mjs';
import {createCP19KeepAlive} from '../cp19-keepalive.mjs';
import {createCP19WorkletHost} from '../cp19-worklet-host.mjs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('six exact CP19 modes; CP18 URLs still CP18',()=>{
 assert.deepEqual(Object.keys(CP19_MODES),['wav-web','mp3-worklet','wav-worklet','mp3-prime','mp3-keepalive','wav-keepalive']);
 for(const k of Object.keys(CP19_MODES))assert.equal(cp19Mode('?cp19='+k),k);
 for(const invalid of ['','?cp19=invalid','?cp18=0','?cp18=30','?cp19='])assert.equal(cp19Mode(invalid),null);
 assert.equal(cp19Mode('?cp18=0&cp19=mp3-prime'),'mp3-prime');
});
test('WAV and MP3 modes point to different real files with same original sound identities',()=>{
 const mp3=cp19Paths('mp3'),wav=cp19Paths('wav');
 for(const name of ['button','start','end','clack','double']){
  assert.match(mp3[name],/\.mp3$/);assert.match(wav[name],/\.wav$/);
  assert.equal(existsSync(new URL('../'+mp3[name].replace('./',''),import.meta.url)),true);
  assert.equal(existsSync(new URL('../'+wav[name].replace('./',''),import.meta.url)),true);
 }
});
test('all 5 original MP3 SHA256 preserved; 5 real PCM16 mono 48k WAV verified',()=>{
 const m=JSON.parse(read('cp19-wav-manifest.json'));
 assert.equal(m.files.length,5);
 for(const f of m.files){
  const mp3=readFileSync(new URL('../sounds/'+f.original,import.meta.url));
  const wav=readFileSync(new URL('../sounds/cp19-wav/'+f.wav,import.meta.url));
  assert.equal(createHash('sha256').update(mp3).digest('hex'),f.mp3_sha256);
  assert.equal(createHash('sha256').update(wav).digest('hex'),f.wav_sha256);
  assert.equal(wav.toString('ascii',0,4),'RIFF');
  assert.equal(wav.toString('ascii',8,12),'WAVE');
  assert.equal(wav.readUInt16LE(20),1); // PCM
  assert.equal(wav.readUInt16LE(22),1);
  assert.equal(wav.readUInt32LE(24),48000);
  assert.equal(wav.readUInt16LE(34),16);
 }
});
test('sync prime runs in current gesture and does not await resume or fetch',()=>{
 let resumes=0,starts=0;
 const ctx={state:'suspended',sampleRate:48000,destination:{},resume(){resumes++;return Promise.resolve()},
  createBuffer(n,len,rate){assert.equal(len,1);return {}},
  createBufferSource(){return {connect(){},start(){starts++}}}
 };
 assert.equal(cp19PrimeAudio(ctx),true);
 assert.equal(resumes,1);assert.equal(starts,1);
 assert.equal(cp19PrimeAudio(null),false);
});
test('keepalive only for opted-in pilot, and stops/disconnects',()=>{
 const keep=createCP19KeepAlive();let starts=0,stops=0,discs=0;
 const ctx={state:'running',sampleRate:48000,destination:{},
  createBuffer(n,len){assert.equal(len,24000);return {getChannelData(){return new Float32Array(len)}}},
  createBufferSource(){return {loop:false,connect(){},start(){starts++},stop(){stops++},disconnect(){discs++}}},
  createGain(){return {gain:{value:0},connect(){},disconnect(){discs++}}}
 };
 assert.equal(keep.active,false);assert.equal(keep.start(ctx),true);assert.equal(keep.start(ctx),true);
 assert.equal(starts,1);keep.stop();assert.equal(stops,1);assert.equal(keep.active,false);assert.equal(discs,2);
});
test('worklet host transfers PCM and requires explicit readiness; stops and resets',async()=>{
 let node,connected=false,disconnected=false;const messages=[];
 const host=createCP19WorkletHost({makeNode:()=>{
  node={port:{postMessage(m){messages.push(m);if(m.type==='load')queueMicrotask(()=>this.onmessage({data:{type:'ready',count:5}}))}},
   connect(){connected=true},disconnect(){disconnected=true}};return node;
 }});
 const ctx={state:'running',destination:{},audioWorklet:{async addModule(uri){assert.match(uri,/cp19-audio-worklet/)} }};
 const buffers=Object.fromEntries(['start','end','clack','double','button'].map(name=>[name,{length:32,numberOfChannels:1,getChannelData(){return new Float32Array([.5,.2,-.1])}}]));
 assert.equal(host.play({name:'button'}),false);
 assert.equal(await host.prepare(ctx,buffers),true);assert.equal(host.ready,true);assert.equal(connected,true);
 assert.equal(host.play({name:'clack',offsets:[0,.478],volume:.96}),true);
 assert.deepEqual(messages.at(-1).offsets,[0,.478]);
 host.stopAll();assert.equal(messages.at(-1).type,'stop');
 host.reset();assert.equal(host.ready,false);assert.equal(disconnected,true);
});
test('processor actually renders PCM 2 channels and delayed wood clack',()=>{
 let ctor;
 const sandbox={AudioWorkletProcessor:class{constructor(){this.port={postMessage(){},onmessage:null}}},
  registerProcessor(name,klass){assert.equal(name,'cp19-sampler');ctor=klass},
  Float32Array,Map,Math,Array,Number,sampleRate:48000,currentFrame:0};
 const context=vm.createContext(sandbox);
 vm.runInContext(read('cp19-audio-worklet.mjs'),context);
 const proc=new ctor();
 const impulse=Float32Array.from([.5,.25,0]);
 proc.port.onmessage({data:{type:'load',items:[{name:'clack',channels:[impulse]}]}});
 proc.port.onmessage({data:{type:'play',name:'clack',offsets:[0,.478],volume:1}});
 let out=[new Float32Array(128),new Float32Array(128)];proc.process([],[out]);
 assert.ok(Math.abs(out[0][0]-.5)<.0001);assert.ok(Math.abs(out[1][1]-.25)<.0001);
 assert.equal(proc.voices.length,1,'second clack remains scheduled');
 sandbox.currentFrame=22944;
 out=[new Float32Array(128),new Float32Array(128)];proc.process([],[out]);
 assert.ok(Math.abs(out[0][0]-.5)<.0001);
 assert.equal(proc.voices.length,0);
});
test('existing timer logic and exact 478ms interval remain; CP19 deferred gong limited',()=>{
 const s=read('app.mjs');
 assert.match(s,/CP19\?150:3000/);
 assert.match(s,/type==='ten-double'\?\[0,\.478\]/);
 assert.match(s,/cp19Worklet\.play\(/);
 assert.match(s,/cp19KeepAlive\.stop\(\)/);
 assert.match(s,/if\(CP19&&!CP19\.prime\)cp19Gesture\(\)/);
 assert.match(s,/const maxLateMs=CP19\?0:/);
 assert.match(s,/if\(!CP19&&CP18_BUTTON_WINDOW_MS!==null/);
});
test('offline app shell includes all CP19 and CP18 modules and five WAV files',()=>{
 const sw=read('sw.js');
 for(const m of ['cp18-audio-window.mjs','cp19-audio-modes.mjs','cp19-worklet-host.mjs','cp19-audio-worklet.mjs','cp19-keepalive.mjs',
  ...['button','studio-gong-start','studio-gong-end','woodclack-single','woodclack-double'].map(x=>'sounds/cp19-wav/'+x+'.wav')]){
  assert.ok(sw.includes(m),'missing '+m);
 }
 assert.match(sw,/round-timer-shell-v0\.8\.20\.3-test-symmetric-edges/);
});
