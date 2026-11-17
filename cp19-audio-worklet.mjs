/**
 * CP19 AudioWorklet TEST experiment.
 * Plays already-decoded PCM. No recording, telemetry, external networking,
 * SharedArrayBuffer, or continuous synthetic sound generator.
 */
class CP19Sampler extends AudioWorkletProcessor {
 constructor(){
  super();
  this.bank=new Map();
  this.voices=[];
  this.port.onmessage=event=>{
   const msg=event?.data||{};
   if(msg.type==='load-bank'){
    this.voices.length=0;
    this.bank.clear();
    for(const item of msg.items||[]){
     if(!item||typeof item.name!=='string'||!Array.isArray(item.channels)||!item.channels.length)continue;
     const channels=item.channels.filter(ch=>ch instanceof Float32Array);
     if(!channels.length||channels.some(c=>!c.length))continue;
     this.bank.set(item.name,{channels,length:Math.min(...channels.map(c=>c.length))});
    }
    this.port.postMessage({type:'ready',count:this.bank.size});
   }else if(msg.type==='play'){
    const data=this.bank.get(msg.name);
    if(!data)return;
    const category=msg.category==='button'?'button':'cue';
    const volume=Number.isFinite(msg.volume)?Math.max(0,Math.min(1,msg.volume)):1;
    for(const offset of Array.isArray(msg.offsets)?msg.offsets:[0]){
     if(!Number.isFinite(offset)||offset<0||offset>10)continue;
     this.voices.push({data,volume,category,start:currentFrame+Math.round(offset*sampleRate)});
    }
   }else if(msg.type==='stop'){
    this.voices.length=0;
   }
  };
 }
 process(inputs,outputs){
  const channels=outputs[0];
  if(!channels||!channels.length)return true;
  const block=channels[0].length;
  for(const voice of this.voices){
   const {data,start,volume,category}=voice;
   const attack=Math.max(1,Math.round(.004*sampleRate));
   const release=Math.max(1,Math.round(.012*sampleRate));
   for(let i=0;i<block;i++){
    const pos=currentFrame+i-start;
    if(pos<0||pos>=data.length)continue;
    let level=volume;
    if(category==='button'){
     const a=Math.min(1,pos/attack), r=Math.min(1,(data.length-1-pos)/release);
     level=0.015+(volume-0.015)*Math.max(0,Math.min(a,r));
    }
    for(let c=0;c<channels.length;c++){
     const input=data.channels[Math.min(c,data.channels.length-1)];
     channels[c][i]+=input[pos]*level;
    }
   }
  }
  const until=currentFrame+block;
  this.voices=this.voices.filter(voice=>until<voice.start+voice.data.length);
  for(const channel of channels){
   for(let i=0;i<channel.length;i++){
    if(channel[i]>1)channel[i]=1;
    else if(channel[i]<-1)channel[i]=-1;
   }
  }
  return true;
 }
}
registerProcessor('cp19-sampler',CP19Sampler);
