import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('APP-001 0.8.20.16: visual overlay is isolated from clock and sound',()=>{
 const css=read('preview-graphite-polish-082016.css');
 assert.doesNotMatch(css,/\\.clock(?:-frame)?\\s*\\{|--wheel-row\\s*:|audioContext|Audio\\(|localStorage|\\.play\\(/);
 for(const token of ['label:nth-of-type(3)','label:nth-of-type(4)','margin-bottom:0',
  '.controls .main-button','.controls .secondary-button','border-radius:16px',
  'border-radius:10px','data-sound="off"','scale(1.24)','scale(1.13)','max-height:350px'])
  assert.ok(css.includes(token),token);
 assert.ok(!css.includes('data-sound="on"'));
});
test('APP-001 0.8.20.16: old TEST has no unapproved visual overlay',()=>{
 assert.ok(!read('index.html').includes('preview-graphite-polish-082016.css'));
 assert.ok(read('index.html').includes('app-graphite-main-082015.mjs?v=082015'));
 assert.ok(read('sw.js').includes('round-timer-shell-v0.8.20.15-main-graphite-ambient'));
});
