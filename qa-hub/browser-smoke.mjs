/* APP-001 Round Timer browser QA HUB / PREPARED ONLY, NEVER AUTO RUN.
 * SHA-pinned static TEST assets only. No real device, no audio-quality claims.
 * Temporary localhost browser storage only. Never connect to FINAL or telemetry.
 */
import {createHash,randomUUID} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {dirname,extname,join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const DIR=dirname(fileURLToPath(import.meta.url)),ROOT=resolve(DIR,'..'),RUN=join(DIR,'.run');
const SOURCE_COMMIT='04c84099db737cd90c8f447a8bba188b38f02441';
const PINNED={
  "index.html": "10c863d34cdd80a0f323cd23324928b646f214b5",
  "styles.css": "23f749a22331116642d63e14d55fd72bf0d2ef33",
  "app.mjs": "a088313722ef7824371972532adac3510e3ba6ec",
  "engine.mjs": "9884c4bd39afe1c9048b9187c60cfaab305a0360",
  "sw.js": "98d69c742770b144adfa5c92458206bfb9f5376f",
  "manifest.webmanifest": "5d43919233e3958a5573a14eaed7b7c8188e5c39",
  "privacy.html": "3bf1927794bb004857293bf37b67d811e1d1bc3a",
  "preview-build.json": "450c2814b80e912045651f29ecaafcd58fd8041a",
  "cp18-audio-window.mjs": "c5a5f8cbaf4dea21bf9fdeb246f091b623e79a5e",
  "cp19-audio-modes.mjs": "fde41dd001f36bc4ad8fe55314daa0e26f6cf8e6",
  "cp19-keepalive.mjs": "6d38123c9c8e23325bc217b7606c60f4d7dae0e4",
  "cp19-audio-worklet.mjs": "017238679cffc3e7793b1c3ffc21bfe4420a8044",
  "cp19-worklet-host.mjs": "29b67ba1c0662c9ccf8a5bd137024d0367175b55",
  "audio-clock-watchdog.mjs": "1a7214f27a9cab3a35a3ae41a34c9f98ae14b1ff",
  "audio-guard.mjs": "f0e85d75dd4417c059564e811bccffaa87e61c32",
  "html-audio.mjs": "30fe2b8f9586febd8f356220fb3bb630d945b762",
  "web-audio-retire.mjs": "bd7910ea63d9965e7e86f6c2a1969d5fb64f2790",
  "audio-duck.mjs": "a609866c782fd430b2551866f4323933474d7043",
  "diagnostics/sender.mjs": "55781943acbda1deb5b8f41cb3b1fe4d3ee77106",
  "diagnostics/schema.mjs": "a322940c32cdfef77542c330436dfab35ec5e454",
  "icons/apple-touch-icon.png": "c485dbea42eb86098b7df32aabe7e069ea0b092e",
  "icons/icon-192.png": "a43b3b1130d323f906287b6d184abe2b0ab6ef83",
  "icons/icon-512.png": "2a4e4d676f3daf3ade4e6b8eccadec3474d87bc3",
  "sounds/button.mp3": "9102a586fe9265230f85791f4e29e36a084bc988",
  "sounds/cp19-wav/button.wav": "886bbf0546240b0014eee2f491a573ae0f47da62",
  "sounds/cp19-wav/studio-gong-end.wav": "2146976c688a1f854e997168a2da7f7ac65dd6fa",
  "sounds/cp19-wav/studio-gong-start.wav": "d237875b2b05392e9252cfc40decbc64baee7b19",
  "sounds/cp19-wav/woodclack-double.wav": "995f6f1b21de6bd63f9b4723737291b2fa6a95f9",
  "sounds/cp19-wav/woodclack-single.wav": "4302e2f4d9c17862ee27d2549be32b79b505f06f",
  "sounds/gong-end.mp3": "bca6856763afacbd42ba477ec020a8cc6d5361c5",
  "sounds/gong-start.mp3": "13c472e6c6ac0b524626d18700cc91721d770fd0",
  "sounds/studio-gong-end.mp3": "1f8eb5ec0475cf071db449336610c9bb65b4e269",
  "sounds/studio-gong-start.mp3": "8897aa877ae39a8554d82ac7306a0bef3a0fc859",
  "sounds/woodclack-double.mp3": "235a7d8f6fae38d528ca30985eb24a40090afde8",
  "sounds/woodclack-single.mp3": "5b0bec7e12c60c9f6206a5cac8040d09316d9c16",
  "sounds/woodclack.mp3": "ded82a2336f9094c89321214c7828b5c810630fb"
};
const ALLOW=new Set(Object.keys(PINNED));
const HOST='127.0.0.1',PORT=8769,ORIGIN='http://127.0.0.1:8769';
const MODES=[
  [
    "wav-web",
    "WAV + Web Audio"
  ],
  [
    "mp3-worklet",
    "MP3 + AudioWorklet"
  ],
  [
    "wav-worklet",
    "WAV + AudioWorklet"
  ],
  [
    "mp3-prime",
    "MP3 + Web Audio + first-gesture prime"
  ],
  [
    "mp3-keepalive",
    "MP3 + Web Audio + prime + keep-alive"
  ]
];
const CACHE='round-timer-shell-v0.8.19.4-test-cp19-five';
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.json':'application/json','.webmanifest':'application/manifest+json',
 '.png':'image/png','.mp3':'audio/mpeg','.wav':'audio/wav'};
function stop(reason){throw new Error(reason)}
async function verify(){
 let total=0;
 for(const [rel,sha] of Object.entries(PINNED)){
  if(rel.startsWith('/')||rel.includes('..'))stop('INVALID_ASSET_PATH '+rel);
  const bytes=await readFile(join(ROOT,rel));
  if(bytes.length>1000000)stop('ASSET_SIZE_EXCEEDED '+rel);
  const gitsha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(gitsha!==sha)stop('SOURCE_SHA_MISMATCH '+rel);
  total+=bytes.length;
 }
 const sw=await readFile(join(ROOT,'sw.js'),'utf8');
 const modes=await readFile(join(ROOT,'cp19-audio-modes.mjs'),'utf8');
 const app=await readFile(join(ROOT,'app.mjs'),'utf8');
 const diagnostic=await readFile(join(ROOT,'diagnostics/sender.mjs'),'utf8');
 const meta=JSON.parse(await readFile(join(ROOT,'preview-build.json'),'utf8'));
 if(meta.version!=='v0.8.19.4-cp19-five-test'||meta.production!==false||
   meta.source_repository!=='mastyukov-cyber/round-timer-pages-test'||
   meta.cp19_variants?.length!==5)stop('TEST_METADATA_CHANGED');
 if(!sw.includes(CACHE)||!sw.includes("cache.addAll(SHELL)")||
    !sw.includes("if (url.origin !== self.location.origin) return"))
    stop('SERVICE_WORKER_SCOPE_CHANGED');
 const sourceShell=Array.from(sw.matchAll(/['"]\.\/([^'"]*)['"]/g),m=>m[1]);
 for(const rel of sourceShell)if(rel&&!ALLOW.has(rel))stop('UNPINNED_OFFLINE_SHELL '+rel);
 for(const [mode,label] of MODES)
  if(!modes.includes("'"+mode+"':")||!modes.includes("label:'"+label+"'"))
   stop('AUDIO_MODE_ALLOWLIST_CHANGED '+mode);
 if(!app.includes("const CP19_MODE=cp19Mode(")||
    !app.includes("bindFastPress(el.start,()=>startPause()")||
    !app.includes("bindFastPress(el.reset,()=>reset()"))
    stop('CONTROL_BINDINGS_CHANGED');
 if(!diagnostic.includes("locationLike?.origin==='https://mastyukov.github.io'"))
    stop('TEST_TELEMETRY_GUARD_CHANGED');
 return {sourceCommit:SOURCE_COMMIT,assets:Object.keys(PINNED).length,sourceBytes:total,
  existingNodeTests:'NOT_REPEATED',realIPhoneAudio:'NOT_RUN'};
}
function pathFor(reqUrl){
 let url;try{url=new URL(reqUrl,ORIGIN)}catch{return null}
 if(url.origin!==ORIGIN||url.hash)return null;
 let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return null}
 const rel=pathname==='/'?'index.html':pathname.slice(1);
 if(!ALLOW.has(rel))return null;
 if(url.search&&rel!=='index.html')return null;
 return rel;
}
async function serve(){
 const server=createServer(async(req,res)=>{
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if(req.socket.remoteAddress!==HOST||req.headers.host!==HOST+':'+PORT||
     !['GET','HEAD'].includes(req.method)){res.writeHead(403,headers);res.end();return}
  const rel=pathFor(req.url);
  if(!rel){res.writeHead(404,headers);res.end();return}
  try{
   const path=resolve(ROOT,rel);
   if(!path.startsWith(ROOT+sep))stop('FILE_ESCAPE');
   const bytes=await readFile(path);
   res.writeHead(200,{...headers,'Content-Type':MIME[extname(path)]||
      'application/octet-stream','Content-Length':String(bytes.length)});
   res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404,headers);res.end()}
 });
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(PORT,HOST,ok)});
 return server;
}
async function probeControls(browserName,browser,mode,label){
 const context=await browser.newContext({serviceWorkers:'allow'});
 const errors=[];
 try{
  const page=await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,240)));
  await page.goto(ORIGIN+'/?cp19='+mode,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(label=>document.querySelector('.preview-version')?.textContent?.includes(label),label);
  const marker=await page.locator('.preview-version').textContent();
  if(!marker.includes('0.8.19.4')||!marker.includes('TEST'))stop('CP19_TEST_LABEL_MISSING '+mode);
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('СТАРТ'));
  await page.locator('#startPauseButton').click();
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('ПАУЗА'));
  if(!await page.locator('#phaseLabel').textContent().then(s=>s.includes('РАБОТА')))
   stop('TIMER_DID_NOT_START '+mode);
  await page.locator('#startPauseButton').click();
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('ПРОДОЛЖИТЬ'));
  const paused=await page.locator('#clock').textContent();
  await page.locator('#startPauseButton').click();
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('ПАУЗА'));
  await page.locator('#resetButton').click();
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('СТАРТ'));
  if(await page.locator('#phaseLabel').textContent()!=='ГОТОВ К СТАРТУ')
   stop('TIMER_RESET_FAILED '+mode);
  if(errors.length)stop('UNHANDLED_BROWSER_ERRORS '+mode+': '+errors.join(';'));
  return {browser:browserName,mode,status:'PASS_SCOPED_UI_ONLY',
    checks:['mode-label','start','pause','resume','reset'],pausedClock:paused};
 }finally{await context.close()}
}
async function chromiumOffline(browser){
 const context=await browser.newContext({serviceWorkers:'allow'});
 const errors=[];
 try{
  const page=await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,240)));
  await page.goto(ORIGIN+'/?cp19=wav-web',{waitUntil:'load'});
  await page.evaluate(async()=>await navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller);
  const cache=await page.evaluate(async cacheName=>{
   const keys=await caches.keys();
   const c=await caches.open(cacheName);
   const html=await c.match(location.origin+'/index.html');
   const js=await c.match(location.origin+'/app.mjs');
   const sound=await c.match(location.origin+'/sounds/cp19-wav/button.wav');
   return {keys,html:!!html,js:!!js,sound:!!sound};
  },CACHE);
  if(!cache.keys.includes(CACHE)||!cache.html||!cache.js||!cache.sound)
    stop('CHROMIUM_OFFLINE_CACHE_INCOMPLETE');
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.preview-version')?.textContent?.includes('WAV + Web Audio'));
  await page.locator('#startPauseButton').click();
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('ПАУЗА'));
  await page.locator('#resetButton').click();
  await page.waitForFunction(()=>document.querySelector('#startPauseButton')?.textContent?.includes('СТАРТ'));
  if(errors.length)stop('OFFLINE_UNHANDLED_BROWSER_ERRORS '+errors.join(';'));
  return {browser:'Chromium',status:'PASS_SCOPED_OFFLINE_ONLY',
    checks:['service-worker-controlled','cache-shell-js-wav','offline-reload','offline-controls']};
 }finally{await context.close()}
}
async function qa(){
 const report={project:'APP-001 Round Timer',sourceCommit:SOURCE_COMMIT,
  status:'NOT_RUN',startedAt:new Date().toISOString(),results:[],
  webkitServiceWorkerOffline:'NOT_RUN_PLAYWRIGHT_LIMITATION',
  physicalIPhoneAudio:'NOT_RUN',audioLatency:'NOT_MEASURED',existingNodeSuite:'NOT_REPEATED'};
 let server=null;
 try{
  report.source=await verify();
  server=await serve();
  const {chromium,webkit}=await import('playwright');
  for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]){
   const browser=await engine.launch({headless:true});
   try{
    for(const [mode,label] of MODES)report.results.push(await probeControls(name,browser,mode,label));
    if(name==='Chromium')report.results.push(await chromiumOffline(browser));
   }finally{await browser.close()}
  }
  report.status='PASS_SCOPED';
 }catch(e){report.status='FAIL_STOP_FIRST';report.error=String(e?.message||e).slice(0,400);process.exitCode=1}
 finally{
  if(server)await new Promise(ok=>server.close(ok));
  report.finishedAt=new Date().toISOString();
  await mkdir(RUN,{recursive:true});
  const filename='qa-'+randomUUID()+'.json';
  await writeFile(join(RUN,filename),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({...report,reportFile:'qa-hub/.run/'+filename},null,2));
 }
}
const cmd=process.argv[2];
if(cmd==='verify')console.log(JSON.stringify({status:'PASS_STATIC_SOURCE_ONLY',...(await verify()),browser:'NOT_RUN'}));
else if(cmd==='qa')await qa();
else stop('USAGE verify | qa: explicit approval required');
