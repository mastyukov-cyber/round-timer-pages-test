import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fitCP19Clock} from '../cp19-clock-fit.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('LANDSCAPE remaining countdown grows about 10% for freed vertical space without clipping',()=>{
 const width=897,height=260,rawWidth=300;
 const current=fitCP19Clock({width,height,rawWidth,portrait:false});
 const oldFont=Math.max(10,Math.min(620,width*.987/(rawWidth/100*3.03),height*.965/2.34));
 const oldHeight=oldFont*2.34;
 assert.ok(current.drawnHeight>=oldHeight*1.08,{oldHeight,actual:current.drawnHeight});
 assert.ok(current.drawnWidth<=width*.987+.01);
 assert.ok(current.drawnHeight<=height*.965+.01);
 assert.equal(current.scaleX,2.87);
 assert.equal(current.scaleY,2.46);
});

test('short landscape never clips and portrait remains unchanged',()=>{
 for(const [w,h] of [[844,200],[780,175],[932,260]]){
  const c=fitCP19Clock({width:w,height:h,rawWidth:300,portrait:false});
  assert.ok(c.drawnWidth<=w*.987+.01);
  assert.ok(c.drawnHeight<=h*.965+.01);
 }
 const p=fitCP19Clock({width:416,height:440,rawWidth:300,portrait:true});
 assert.equal(p.scaleX,1.79);
 assert.equal(p.scaleY,5.20);
});

test('final CSS size overrides favor countdown over round fraction; retain 3D wheel layers',()=>{
 const css=read('styles.css'),app=read('app.mjs');
 const anchor=css.indexOf('CP19-F v0.8.20.10:');
 assert.ok(anchor>=0);
 const last=css.slice(anchor);
 assert.match(last,/\.cp19f-ux \.round-word\{font-size:1em;\}/);
 assert.match(last,/\.cp19f-ux \.round-count\{font-size:3\.75em;\}/);
 assert.match(last,/\.cp19f-ux \.round-count\{font-size:3\.35em;\}/);
 assert.match(app,/shortLandscape\?\.032:\.034/);
 assert.match(app,/shortLandscape\?3\.35:3\.75/);
 assert.match(css,/CP19-F v0\.8\.20\.9 skeuomorphic/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel::before\{[\s\S]*?pointer-events:none/);
 assert.match(css,/\.cp19f-ux \.cp19f-inline-wheel::after\{[\s\S]*?pointer-events:none/);
});

test('four wheel housings get ~5% smaller, keep centered selection and red edge markers',()=>{
 const css=read('styles.css'),picker=read('cp19-wheel-picker.mjs');
 const last=css.slice(css.indexOf('CP19-F v0.8.20.10:'));
 assert.match(last,/\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:44px;width:94%;margin-inline:auto;\}/);
 assert.match(last,/\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:34px;\}/);
 assert.match(last,/\.cp19f-ux \.cp19f-inline-wheel\{--wheel-row:25px;\}/);
 assert.match(last,/\.cp19f-ux \.cp19f-inline-limit\{\s*z-index:5;color:#e12b3f;opacity:1/);
 assert.match(picker,/minMarker\.textContent='—'/);
 assert.match(picker,/maxMarker\.textContent='—'/);
 assert.match(picker,/minMarker\.hidden=entry\.index!==0/);
 assert.match(picker,/maxMarker\.hidden=entry\.index!==select\.options\.length-1/);
 assert.match(css,/display:flex;align-items:center;justify-content:center;width:100%;height:var\(--wheel-row\)/);
});

test('pilot keeps current TEST version and does not synthesize fake user taps',()=>{
 const app=read('app.mjs');
 const manifest=JSON.parse(read('preview-build.json'));
 assert.equal(manifest.version,'v0.8.20.9-skeuomorphic-wheels-landscape-first-tap-test');
 assert.equal(manifest.production,false);
 assert.match(app,/CP19F_UX\?'0\.8\.20\.9':'0\.8\.19\.4'/);
 assert.match(app,/const accepted=cp19DirectGestureFallback\('button'\)/);
 assert.match(app,/document\.addEventListener\('pointerdown',cp19Gesture,\{capture:true\}\)/);
 assert.doesNotMatch(app,/\.dispatchEvent\(new (?:MouseEvent|PointerEvent)/);
});
