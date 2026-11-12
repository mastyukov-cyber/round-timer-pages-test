import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const raw=(name)=>readFileSync(new URL('../'+name,import.meta.url));
const txt=(name)=>raw(name).toString('utf8');
test('RC12 candidate is TEST-only from audited PR19 and visible to iPhone',()=>{
 const m=JSON.parse(txt('preview-build.json'));
 assert.equal(m.version,'v0.8.12-rc16');
 assert.equal(m.production,false);
 assert.equal(m.source_pr,null,'RC15 is authored only in isolated TEST repository');
 assert.equal(m.base_source_pr,21);
 assert.equal(m.base_source_commit,'43fb3611e3ddf66c5f8ac59b2512eb75b3200528');
 assert(txt('index.html').includes('ТЕСТОВАЯ ВЕРСИЯ · '+m.version));
 assert(txt('sw.js').includes('round-timer-shell-'+m.version));
});
test('RC12 audible studio MP3s are byte-identical to approved checksum manifest',()=>{
 const manifest=JSON.parse(txt('studio-audio-manifest.json'));
 assert.equal(manifest.files.length,5);
 for(const f of manifest.files){
   assert.equal(raw('sounds/'+f.name).length,f.bytes,f.name);
   assert.equal(createHash('sha256').update(raw('sounds/'+f.name)).digest('hex'),f.sha256,f.name);
 }
});
test('RC12 UI and sound priorities are isolated and preserve music mode',()=>{
 const app=txt('app.mjs'),css=txt('styles.css');
 assert(!app.includes('HTML_WORK_CUE_LEAD_MS=700'));
 assert(app.includes('round-timer-preview-transport-rc13-v1'));
 assert(app.includes('startupCuePlayed=config.prepare<=5'));
 assert(app.includes('bindFastPress(el.start,()=>startPause()'));
 assert(app.includes('PREVIEW_MUSIC_KEY'));
 assert(app.includes('const SOUND_PATHS=isPreview?'));
 assert(css.includes('transform:scale(1.38,4.05)'));
 assert(css.includes('transform:scale(1.79,1.79)'));
 assert(css.includes('--accent:#a7ff55'));
 assert(css.includes('--accent:#ff4255'));
});
