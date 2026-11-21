/** CP19-F TEST large wheel. Native select values remain authoritative for timer data.
 * This changes visual selection only; no audio or timer model is modified.
 */
export const wheelIndex=(offset,row,count)=>Math.max(0,Math.min(count-1,Math.round(Math.max(0,offset)/row)));
export function createCP19WheelPicker({form,ids,feedback}={}){
 const doc=form?.ownerDocument;
 if(!doc)return {refresh(){}};
 const overlay=doc.createElement('div');
 overlay.className='cp19f-wheel-overlay';overlay.hidden=true;
 overlay.innerHTML=`<div class="cp19f-wheel-backdrop"></div>
 <section class="cp19f-wheel-sheet" role="dialog" aria-modal="true" aria-label="Выбор параметра тренировки">
  <div class="cp19f-wheel-head"><h2 id="cp19fWheelTitle">Выбор времени</h2><button class="cp19f-wheel-cancel" type="button">ОТМЕНА</button></div>
  <div class="cp19f-wheel-window"><div class="cp19f-wheel-center" aria-hidden="true"></div><div class="cp19f-wheel-scroll" role="listbox" tabindex="0" aria-label="Прокрутите для выбора"></div></div>
  <button class="cp19f-wheel-done" type="button">✓ ВЫБРАТЬ</button>
 </section>`;
 doc.body.append(overlay);
 const scroll=overlay.querySelector('.cp19f-wheel-scroll');
 const header=overlay.querySelector('#cp19fWheelTitle');
 const sheet=overlay.querySelector('.cp19f-wheel-sheet');
 let current=null,currentButton=null,index=0,rowHeight=64,raf=0,ignoreScroll=false;
 const entries=[];
 const itemValue=(select)=>select.options[select.selectedIndex]?.textContent||'—';
 function highlight(){
  scroll.querySelectorAll('.cp19f-wheel-option').forEach((el,i)=>{
   const active=i===index;el.classList.toggle('is-current',active);
   el.setAttribute('aria-selected',active?'true':'false');
  });
 }
 function selectIndex(next,{scrollTo=false,feedbackTick=true}={}){
  if(!current)return;
  const n=wheelIndex(next*rowHeight,rowHeight,current.options.length);
  if(n!==index){index=n;if(feedbackTick)feedback?.picker?.();}
  highlight();
  if(scrollTo){ignoreScroll=true;scroll.scrollTop=index*rowHeight;
   doc.defaultView?.requestAnimationFrame?.(()=>{ignoreScroll=false;});}
 }
 function dismiss(){
  if(overlay.hidden)return;
  overlay.hidden=true;
  if(currentButton?.isConnected)currentButton.focus({preventScroll:true});
  current=null;currentButton=null;
 }
 function confirm(){
  if(!current)return;
  const select=current,value=current.options[index]?.value;
  if(value!==undefined&&select.value!==value){
   select.value=value;
   select.dispatchEvent(new Event('input',{bubbles:true}));
   select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  feedback?.tap?.();
  refresh();dismiss();
 }
 function open(select,button,title){
  if(select.disabled)return;
  current=select;currentButton=button;
  header.textContent=title;
  index=Math.max(0,select.selectedIndex);
  scroll.replaceChildren();
  const frag=doc.createDocumentFragment();
  for(let i=0;i<select.options.length;i++){
   const option=doc.createElement('button');option.type='button';option.className='cp19f-wheel-option';
   option.textContent=select.options[i].textContent;option.setAttribute('role','option');option.dataset.index=String(i);
   option.addEventListener('click',()=>selectIndex(i,{scrollTo:true}));frag.append(option);
  }
  scroll.append(frag);
  overlay.hidden=false;
  rowHeight=parseFloat(doc.defaultView.getComputedStyle(scroll).getPropertyValue('--wheel-row'))||64;
  scroll.scrollTop=index*rowHeight;
  highlight();
  doc.defaultView.requestAnimationFrame(()=>{scroll.scrollTop=index*rowHeight;scroll.focus({preventScroll:true});});
 }
 for(const id of ids||[]){
  const select=form.querySelector('#'+id);if(!select)continue;
  const label=select.closest('label');if(!label)continue;
  const title=label.childNodes[0]?.textContent?.trim()||'Выбор';
  const button=doc.createElement('button');button.type='button';button.className='cp19f-wheel-trigger';
  button.setAttribute('aria-label',`${title}: откройте большое колесо выбора`);
  select.hidden=true;
  select.insertAdjacentElement('afterend',button);
  button.addEventListener('click',()=>open(select,button,title));
  entries.push({select,button});
 }
 scroll.addEventListener('scroll',()=>{
  if(!current||ignoreScroll||raf)return;
  raf=doc.defaultView.requestAnimationFrame(()=>{raf=0;selectIndex(wheelIndex(scroll.scrollTop,rowHeight,current.options.length));});
 },{passive:true});
 scroll.addEventListener('keydown',ev=>{
  if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){
   ev.preventDefault();selectIndex(index+(ev.key==='ArrowDown'?1:-1),{scrollTo:true});
  }else if(ev.key==='Enter'){ev.preventDefault();confirm();}
 });
 overlay.querySelector('.cp19f-wheel-cancel').addEventListener('click',dismiss);
 overlay.querySelector('.cp19f-wheel-backdrop').addEventListener('click',dismiss);
 overlay.querySelector('.cp19f-wheel-done').addEventListener('click',confirm);
 doc.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!overlay.hidden){ev.preventDefault();dismiss();}});
 function refresh(){for(const {select,button} of entries){button.textContent=itemValue(select)+' ▾';button.disabled=select.disabled;}}
 refresh();return {refresh,get open(){return !overlay.hidden}};
}
