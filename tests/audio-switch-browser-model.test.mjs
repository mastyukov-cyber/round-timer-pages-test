import test from 'node:test';
import assert from 'node:assert/strict';

// RC17 installed-PWA model: the owner chose Web Audio permanently and
// deprecated all user-facing audio QA selectors. No real user data.
test('RC17 ignores an old HTML selection, hides audio settings and restores the iPhone viewport',async()=>{
 const names=['window','document','navigator','location','localStorage','fetch','getComputedStyle',
              'requestAnimationFrame','setInterval','ResizeObserver'];
 const old=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const oldNow=Date.now;
 let now=1800000000000,heartbeat=null,audioContextCreates=0,layoutRefreshes=0;
 const handlers=new Map(),viewportHandlers=new Map();
 const add=(n,fn)=>{const arr=handlers.get(n)||[];arr.push(fn);handlers.set(n,arr);};
 class Element {
   constructor(name){
     this.name=name;this.id=name;this.value='';this.disabled=false;this.open=false;
     this.textContent='';this.children=[];this.events=new Map();this.style={};
     this.attributes={};this.parentElement={clientWidth:380,clientHeight:150};
     this.clientWidth=380;this.clientHeight=140;this.classList={toggle(){}};
   }
   addEventListener(n,fn){this.events.set(n,fn);}
   append(child){this.children.push(child);}
   insertBefore(child){this.children.push(child);}
   setAttribute(n,v){this.attributes[n]=v;}
   fire(n){this.events.get(n)?.({preventDefault(){}});}
   getContext(){return {font:'',measureText:t=>({width:t.length*65})};}
 }
 const ids=['workInput','restInput','roundsInput','prepareInput','clock','roundLabel',
   'roundCount','roundCurrent','roundTotal','phaseLabel','progressBar','startPauseButton',
   'resetButton','settings','closeSettingsButton','settingsForm'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
 class HTMLAudio {
   constructor(src){this.src=src;this.paused=true;this.muted=false;this.currentTime=0;}
   load(){}
   play(){this.paused=false;return Promise.resolve();}
   pause(){this.paused=true;}
 }
 class WebAudio {
   constructor(){audioContextCreates++;}
   state='running';currentTime=0;destination={};
   resume(){return Promise.resolve();}
   decodeAudioData(){return Promise.resolve({duration:.2});}
   createGain(){return {gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}},connect(){return this;}};}
   createBufferSource(){return {connect(){return this;},start(){},stop(){},disconnect(){}};}
 }
 const store=new Map([['round-timer-preview-transport-rc13-v1','html'],['round-timer-preview-music-mix-v1','off']]);
 const win={innerWidth:380,innerHeight:810,Audio:HTMLAudio,AudioContext:WebAudio,
   matchMedia:()=>({matches:true}),addEventListener:add,
   visualViewport:{height:710,addEventListener:(n,fn)=>viewportHandlers.set(n,fn)}};
 const doc={hidden:false,body:{className:'',classList:{toggle(){}}},documentElement:{},
   getElementById:id=>nodes[id],createElement:name=>new Element(name),addEventListener:add};
 const set=(k,v)=>Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:v});
 try{
   Date.now=()=>now;
   set('window',win);set('document',doc);
   set('location',{origin:'https://mastyukov-cyber.github.io',pathname:'/round-timer-pages-test/'});
   set('navigator',{audioSession:{type:'auto'},serviceWorker:undefined});
   set('localStorage',{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),
     removeItem:k=>store.delete(k)});
   set('fetch',()=>new Promise(()=>{}));
   set('getComputedStyle',()=>({fontFamily:'sans-serif',fontSize:'16px'}));
   set('requestAnimationFrame',fn=>{layoutRefreshes++;fn();});
   set('setInterval',fn=>{heartbeat=fn;return 1;});
   set('ResizeObserver',undefined);
   await import('../app.mjs?rc17-first-open');
   assert.equal(nodes.settingsForm.children.length,0,'no audio or diagnostic fields added to settings');
   assert.equal(nodes.roundCurrent.textContent,'1');
   assert.equal(nodes.roundTotal.textContent,'3');
   assert.equal(nodes.roundCount.attributes['aria-label'],'Раунд 1/3');
   nodes.startPauseButton.fire('click');
   assert.equal(nodes.startPauseButton.textContent,'Ⅱ ПАУЗА');
   assert(audioContextCreates>0,'Web Audio used even with stored legacy HTML preference');
   assert.equal(store.get('round-timer-preview-transport-rc13-v1'),'html','leave old storage untouched');
   nodes.settings.open=true;nodes.settings.fire('toggle');
   assert.equal(nodes.startPauseButton.disabled,true);
   nodes.startPauseButton.fire('click');
   assert.equal(nodes.startPauseButton.textContent,'Ⅱ ПАУЗА','modal remains pointer-locked');
   nodes.settings.open=false;nodes.settings.fire('toggle');
   now+=2500;heartbeat();
   assert.equal(nodes.clock.textContent,'00:58');
   const before=layoutRefreshes;
   viewportHandlers.get('resize')();
   for(const handler of handlers.get('pageshow')||[])handler();
   assert(layoutRefreshes>before,'viewport recomputed on iOS reopen');
   assert.equal(nodes.startPauseButton.textContent,'Ⅱ ПАУЗА');
   now+=9000;
   await import('../app.mjs?rc17-second-open');
   assert.equal(nodes.clock.textContent,'00:49','clock restored from original elapsed wall time');
   assert.equal(nodes.settingsForm.children.length,0);
   nodes.resetButton.fire('click');
   assert.equal(nodes.clock.textContent,'01:00');
 }finally{
   Date.now=oldNow;
   for(const [k,descriptor] of old){
     if(descriptor)Object.defineProperty(globalThis,k,descriptor);
     else delete globalThis[k];
   }
 }
});
