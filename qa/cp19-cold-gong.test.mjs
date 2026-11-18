import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cp19CanPlayStartCue} from '../cp19-audio-modes.mjs';
const app=readFileSync(new URL('../app.mjs',import.meta.url),'utf8');
test('CP19 worklet cannot consume a gong until audio worklet is ready',()=>{
 assert.equal(cp19CanPlayStartCue({contextState:'running',bufferReady:true,transport:'worklet',workletReady:false}),false);
 assert.equal(cp19CanPlayStartCue({contextState:'running',bufferReady:true,transport:'worklet',workletReady:true}),true);
 assert.equal(cp19CanPlayStartCue({contextState:'suspended',bufferReady:true,transport:'worklet',workletReady:true}),false);
 assert.equal(cp19CanPlayStartCue({contextState:'running',bufferReady:false,transport:'worklet',workletReady:true}),false);
 assert.equal(cp19CanPlayStartCue({contextState:'running',bufferReady:true,transport:'web',workletReady:false}),true);
});
test('CP19 first gong gates worklet readiness while late gong remains limited to 150ms',()=>{
 assert.match(app,/CP19\?cp19CanPlayStartCue\(/);
 assert.match(app,/else delayedStartGong\.schedule\(ready,/);
 assert.match(app,/elapsedNow\(\)<=\(CP19\?150:3000\)/);
});
test('CP19 preload retries when ANY approved audio sample is absent',()=>{
 assert.match(app,/Object\.keys\(SOUND_PATHS\)\.some\(name=>!soundBuffers\[name\]\).*soundsLoading=null/);
 assert.match(app,/cp19Status\('загрузка звуков не завершена'\)/);
});
