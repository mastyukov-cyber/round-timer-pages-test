import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createDiagnosticSender} from '../diagnostics/sender.mjs';

const file=(name)=>readFileSync(new URL('../'+name,import.meta.url));
const text=(name)=>file(name).toString('utf8');

test('Original approved UI and engine files have identical bytes', () => {
  const approved={
    'index.html':'4636aba0879a151d30cc64c98b91d9d3cc137e79bd2fb10e518619874d7a6f15',
    'styles.css':'5ac2df0416beab144424a91d638266acf800b2ea5808076b91374799f3009a0a',
    'engine.mjs':'1f99d689ad8894bc89ab591b4447e1336dc2b5faf97781ad4e40abd0058416c8',
    'sounds/gong-start.mp3':'b440d5440f2d104d15ac3e0553366e7bf0db13014599d14e5e8b94b3744a4333',
    'sounds/gong-end.mp3':'13c66a498dfae6921fe77343550f29b06c4470e04e5c7373629f0639096e43d7',
    'sounds/woodclack.mp3':'7bbc5e40111dbb7d61d50a7984cccc25bdc55c37ab1c056d5b18c6ae7147aa71'
  };
  for(const [path,expected] of Object.entries(approved)){
    assert.equal(createHash('sha256').update(file(path)).digest('hex'),expected,path);
  }
});
test('PWA service worker caches diagnostics for offline use',()=>{
  const sw=text('sw.js');
  assert(sw.includes('round-timer-shell-v0.8.4-test'));
  assert(sw.includes('./diagnostics/schema.mjs'));
  assert(sw.includes('./diagnostics/sender.mjs'));
});
test('Test UI contains no added controls and errors are the only events',()=>{
  const app=text('app.mjs');
  assert(app.includes('attachBrowserErrorCapture('));
  assert(app.includes('event:\'audio_failure\''));
  assert(!app.includes('session_start'));
  assert(!app.includes('workout_start'));
  assert(!app.includes('workout_complete'));
});
test('PII and workout events cannot leave the diagnostic sender',async()=>{
  const sent=[];
  const s=createDiagnosticSender({
    endpoint:'https://round-timer-error-receiver.mastyukov.workers.dev/v1/error',
    transport:async (url,options)=>{sent.push({url,...options});}
  });
  assert.equal(await s.report({event:'workout_start',version:'0.8.4'}),false);
  assert.equal(await s.report({event:'app_error',code:'UNHANDLED_ERROR',component:'ui',version:'0.8.4',name:'Private',ip:'192.0.2.1',stack:'Private'}),true);
  assert.equal(sent.length,1);
  assert.deepEqual(JSON.parse(sent[0].body),{event:'app_error',code:'UNHANDLED_ERROR',component:'ui',version:'0.8.4'});
  assert.equal(sent[0].credentials,'omit');
  assert(!sent[0].body.includes('Private'));
});
test('Failed network remains a silent nonblocking attempt',async()=>{
  const s=createDiagnosticSender({endpoint:'https://log.example.test/',transport:async()=>{throw Error('No network');}});
  assert.equal(await s.report({event:'app_error',code:'UNKNOWN',component:'ui',version:'0.8.4'}),false);
});
