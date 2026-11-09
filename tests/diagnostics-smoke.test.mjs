import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createDelayedStartGuard,createActiveSoundController,createAudioInterruptionGuard} from '../audio-guard.mjs';
import {productionDiagnosticEndpoint} from '../diagnostics/sender.mjs';

const content=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const settled=()=>new Promise(resolve=>setImmediate(resolve));

test('preview identity and correct offline shell',()=>{
  const build=JSON.parse(content('preview-build.json'));
  assert.equal(build.version,'v0.8.6-mix-rc6');
  assert.equal(build.production,false);
  assert.match(content('index.html'),/round-timer-preview-build/);
  const sw=content('sw.js');
  assert(sw.includes('round-timer-shell-v0.8.6-mix-rc6'));
  for(const path of ['audio-guard.mjs','html-audio.mjs','audio-duck.mjs','app.mjs','engine.mjs','privacy.html','sounds/gong-start.mp3']){
    assert(sw.includes('./'+path),path);
  }
});

test('preview cannot send diagnostic events to production Cloudflare',()=>{
  const host='https://mastyukov-cyber.github.io';
  const endpoint='https://round-timer-error-receiver.mastyukov.workers.dev/v1/error';
  assert.equal(productionDiagnosticEndpoint({origin:host,pathname:'/round-timer-pages-test/'},endpoint),'');
  assert.equal(productionDiagnosticEndpoint({origin:'http://localhost:3000',pathname:'/'},endpoint),'');
});

test('PAUSE cancels delayed sound decode',async()=>{
  let resolveLoading;
  const loading=new Promise(resolve=>{resolveLoading=resolve;});
  let plays=0;
  const guard=createDelayedStartGuard({canPlay:()=>true,play:()=>{plays++;}});
  guard.schedule(loading);
  guard.invalidate();
  resolveLoading();
  await settled();
  assert.equal(plays,0);
});

test('PAUSE and Home immediately retire an already playing gong',()=>{
  const sources=[];
  const context={currentTime:2,destination:{},
    createBufferSource(){const s={connect(){},disconnect(){},start(t){this.startAt=t;},stop(t){this.stopAt=t;},onended:null};sources.push(s);return s;},
    createGain(){const gain={value:1,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}};return {gain,connect(){},disconnect(){}};}
  };
  const audio=createActiveSoundController();
  audio.play({context,buffer:{},volume:.9});
  audio.stopAll({fadeMs:16});
  assert.equal(sources.length,1);
  assert.ok(sources[0].stopAt>=2 && sources[0].stopAt<=2.05);
  audio.stopAll({fadeMs:0}); // Repeated visibility/pagehide is harmless.
  audio.play({context,buffer:{}});
  audio.stopAll({fadeMs:8});
  assert.ok(sources[1].stopAt<=2.05);
});

test('audio assets and engine unchanged from approved timer',()=>{
  const expected={
    'engine.mjs':'1f99d689ad8894bc89ab591b4447e1336dc2b5faf97781ad4e40abd0058416c8',
    'sounds/gong-start.mp3':'b440d5440f2d104d15ac3e0553366e7bf0db13014599d14e5e8b94b3744a4333',
    'sounds/gong-end.mp3':'13c66a498dfae6921fe77343550f29b06c4470e04e5c7373629f0639096e43d7',
    'sounds/woodclack.mp3':'7bbc5e40111dbb7d61d50a7984cccc25bdc55c37ab1c056d5b18c6ae7147aa71'
  };
  for(const [path,hash] of Object.entries(expected)){
    assert.equal(createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),hash,path);
  }
});

test('blur interrupts gong before delayed visibilitychange, pagehide forces stop',()=>{
  const mk=()=>{
    const handlers=new Map();
    return {hidden:false,
      addEventListener(k,f){const s=handlers.get(k)||new Set();s.add(f);handlers.set(k,s);},
      removeEventListener(k,f){handlers.get(k)?.delete(f);},
      dispatch(k){for(const f of handlers.get(k)||[])f();}
    };
  };
  const win=mk(),doc=mk(),events=[];
  const guard=createAudioInterruptionGuard({windowTarget:win,documentTarget:doc,stop:reason=>events.push(reason)});
  win.dispatch('blur');
  assert.equal(guard.interrupted,true);
  doc.hidden=true;doc.dispatch('visibilitychange');
  assert.deepEqual(events,['blur']);
  win.dispatch('pagehide');
  assert.deepEqual(events,['blur','pagehide']);
  doc.hidden=false;doc.dispatch('visibilitychange');
  assert.equal(guard.interrupted,false);
  guard.dispose();
});

test('music coexistence remains preview-only',()=>{
  assert(content('app.mjs').includes('PREVIEW_MUSIC_KEY'));
  assert(content('app.mjs').includes('МУЗЫКА ПРИ СИГНАЛАХ'));
  assert(content('app.mjs').includes('isPreview'));
  assert(content('audio-duck.mjs').includes("session.type='transient'"));
  assert(!content('audio-duck.mjs').includes("session.type='transient-solo'"));
  assert.equal(JSON.parse(content('preview-build.json')).production,false);
});

test('preview version is shown only inside training settings, lower-left',()=>{
  const html=content('index.html');
  const css=content('styles.css');
  const version=JSON.parse(content('preview-build.json')).version;
  assert(html.includes('<meta name="round-timer-preview-build" content="'+version+'">'));
  const start=html.indexOf('<details id="settings"');
  const end=html.indexOf('</details>',start);
  const inside=html.slice(start,end);
  assert(start>=0 && end>start);
  assert(inside.includes('<small class="preview-version"'));
  assert(inside.includes(version));
  assert(!html.slice(0,start).includes('preview-version'));
  assert(css.includes('.preview-version {grid-column:1/-1;justify-self:start'));
  assert(!html.includes('type="checkbox"'));
  assert(content('sw.js').includes('round-timer-shell-'+version));
});

test('version label update does not modify audio/engine and preserves preview privacy',()=>{
  const files=['audio-guard.mjs','app.mjs','engine.mjs'];
  for(const p of files) assert(content(p).length>100,p);
  assert(!content('app.mjs').includes('audioSession.type'));
  assert.equal(JSON.parse(content('preview-build.json')).production,false);
});

test('RC6 HTML setting is preview-only, default HTML, production unchanged',()=>{
  const app=content('app.mjs'),sw=content('sw.js');
  assert(app.includes("globalThis.location?.origin==='https://mastyukov-cyber.github.io'"));
  assert(app.includes("audioMode='html'"));
  assert(app.includes("ЗВУК ТАЙМЕРА · ТЕСТ"));
  assert(sw.includes('./html-audio.mjs'));
  assert.equal(JSON.parse(content('preview-build.json')).production,false);
});

test('RC6 labels reflect the device result and maintain session restoration',()=>{
 const app=content('app.mjs');
 const duck=content('audio-duck.mjs');
 assert(app.includes('ВКЛ · музыка играет вместе'));
 assert(app.includes('ВЫКЛ · музыка может прерваться'));
 assert(app.includes('sessionMix.stop()'));
 assert(duck.includes('function stop()'));
 assert(content('sw.js').includes('./audio-duck.mjs'));
});
