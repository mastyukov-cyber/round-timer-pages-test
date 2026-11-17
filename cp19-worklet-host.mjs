/**
 * CP19 worklet host: bridges decoded AudioBuffer samples to the actual
 * AudioWorkletProcessor. No PCM recording or external services.
 * Audio output still obeys iOS Safari's user-activation requirements.
 */
export function createCP19WorkletHost({
 moduleURL='./cp19-audio-worklet.mjs',
 timeoutMs=2500,
 makeNode=(ctx,name,options)=>new AudioWorkletNode(ctx,name,options)
}={}){
 let context=null, node=null, ready=false, pending=null, generation=0;
 const reset=()=>{
  generation++;
  ready=false;pending=null;
  if(node){
   try{node.port.postMessage({type:'stop'})}catch(_){}
   try{node.disconnect()}catch(_){}
  }
  node=null;context=null;
 };
 async function prepare(ctx,buffers){
  if(!ctx||!ctx.audioWorklet?.addModule)return false;
  if(ctx===context&&ready)return true;
  if(ctx===context&&pending)return pending;
  reset();
  context=ctx;
  const token=generation;
  pending=(async()=>{
   try{
    await ctx.audioWorklet.addModule(moduleURL);
    if(token!==generation)return false;
    const worker=makeNode(ctx,'cp19-sampler',{
     numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2]
    });
    if(token!==generation){try{worker.disconnect()}catch(_){}return false}
    node=worker;
    const items=[],transfers=[];
    for(const [name,buffer] of Object.entries(buffers||{})){
     if(!buffer||!Number.isInteger(buffer.numberOfChannels)||!buffer.length)continue;
     const channels=[];
     for(let c=0;c<buffer.numberOfChannels;c++){
      const copy=new Float32Array(buffer.getChannelData(c));
      channels.push(copy);transfers.push(copy.buffer);
     }
     items.push({name,channels});
    }
    if(!items.length)return false;
    const ok=await new Promise(resolve=>{
     let settled=false;
     const finish=result=>{
      if(settled)return;
      settled=true;clearTimeout(timer);
      worker.port.onmessage=null;
      resolve(result);
     };
     const timer=setTimeout(()=>finish(false),timeoutMs);
     worker.port.onmessage=e=>finish(e.data?.type==='ready'&&e.data?.count===items.length);
     try{
      worker.connect(ctx.destination);
      worker.port.postMessage({type:'load-bank',items},transfers);
     }catch(_){finish(false)}
    });
    if(token!==generation||ctx!==context)return false;
    ready=ok;
    return ok;
   }catch(_){return false}
  })();
  return pending;
 }
 function play({name,offsets=[0],volume=1,category='cue'}={}){
  if(!ready||!node||!context||context.state!=='running')return false;
  if(typeof name!=='string'||!Array.isArray(offsets))return false;
  try{
   node.port.postMessage({type:'play',name,offsets,volume,category});
   return true;
  }catch(_){return false}
 }
 function stopAll(){
  if(!node)return;
  try{node.port.postMessage({type:'stop'})}catch(_){}
 }
 return Object.freeze({prepare,play,stopAll,reset,get ready(){return ready;}});
}
