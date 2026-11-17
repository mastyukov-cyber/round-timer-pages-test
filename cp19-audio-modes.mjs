/**
 * CP19 audio matrix. This file is pure and does not touch audio/session state.
 * A query parameter must match one exact allow-listed label.
 */
export const CP19_VARIANTS = Object.freeze({
 'wav-web': Object.freeze({label:'WAV + Web Audio',codec:'wav',transport:'web',prime:false}),
 'mp3-worklet': Object.freeze({label:'MP3 + AudioWorklet',codec:'mp3',transport:'worklet',prime:false}),
 'wav-worklet': Object.freeze({label:'WAV + AudioWorklet',codec:'wav',transport:'worklet',prime:false}),
 'mp3-prime': Object.freeze({label:'MP3 + Web Audio + gesture prime',codec:'mp3',transport:'web',prime:true})
});
export function cp19ModeFromSearch(search='') {
 const value=new URLSearchParams(String(search||'')).get('cp19');
 return Object.prototype.hasOwnProperty.call(CP19_VARIANTS,value)?value:null;
}
export function cp19AudioConfig(mode) {
 return mode===null?null:(CP19_VARIANTS[mode]||null);
}
export function cp19SoundPaths(codec) {
 const suffix=codec==='wav'?'.wav':'.mp3';
 const prefix=codec==='wav'?'./sounds/cp19-wav/':'./sounds/';
 return {
  start:prefix+'studio-gong-start'+suffix,
  end:prefix+'studio-gong-end'+suffix,
  clack:prefix+'woodclack-single'+suffix,
  double:prefix+'woodclack-double'+suffix,
  button:prefix+'button'+suffix
 };
}
/**
 * Invoke synchronously INSIDE a real trusted user gesture for the prime pilot.
 * It must not block on decode/fetch; WebKit may still suspend actual output.
 * Never call with a detached or closed context.
 */
export function cp19PrimeSilence(context) {
 if(!context||context.state==='closed')return false;
 try {
  if(context.state!=='running')void Promise.resolve(context.resume()).catch(()=>{});
  const buffer=context.createBuffer(1,1,context.sampleRate);
  const source=context.createBufferSource();
  source.buffer=buffer;
  source.connect(context.destination);
  source.start(0);
  source.onended=()=>{try{source.disconnect()}catch(_){}};
  return true;
 }catch(_){return false}
}
