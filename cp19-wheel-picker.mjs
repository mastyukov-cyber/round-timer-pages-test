/** CP19-F inline scroll wheels. The existing native <select> remains the only data source. */
export const wheelIndex=(offset,row,count)=>Math.max(0,Math.min(count-1,Math.round(Math.max(0,offset)/row)));
export function wheelLabel(select,option){
 if(!option)return '—';
 if(select.id==='roundsInput'||option.value==='infinity')return option.textContent;
 const secs=Number(option.value);
 if(!Number.isFinite(secs))return option.textContent;
 return `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
}
export function createCP19WheelPicker({form,ids,feedback}={}){
 const doc=form?.ownerDocument;
 if(!doc)return {refresh(){}};
 const view=doc.defaultView;
 const entries=[];
 for(const id of ids||[]){
  const select=form.querySelector('#'+id);if(!select)continue;
  const label=select.closest('label');if(!label)continue;
  const wheel=doc.createElement('div');wheel.className='cp19f-inline-wheel';
  const center=doc.createElement('div');center.className='cp19f-inline-center';center.setAttribute('aria-hidden','true');
  const scroll=doc.createElement('div');scroll.className='cp19f-inline-scroll';
  scroll.setAttribute('role','listbox');scroll.setAttribute('tabindex','0');
  scroll.setAttribute('aria-label',(label.childNodes[0]?.textContent?.trim()||'Выбор')+' — прокрутка значений');
  const fragment=doc.createDocumentFragment();
  for(let i=0;i<select.options.length;i++){
   const row=doc.createElement('button');row.type='button';row.className='cp19f-inline-option';
   row.setAttribute('role','option');row.dataset.index=String(i);
   row.textContent=wheelLabel(select,select.options[i]);
   row.addEventListener('click',()=>choose(i,true));
   fragment.append(row);
  }
  scroll.append(fragment);wheel.append(center,scroll);
  select.hidden=true;select.insertAdjacentElement('afterend',wheel);
  const entry={select,wheel,scroll,index:Math.max(0,select.selectedIndex),lastSynced:NaN,busy:false,raf:0,settleTimer:null,touching:false};
  entries.push(entry);
  function beginInlineInteraction(){
   if(select.disabled)return;
   wheel.classList.add('is-engaged');
   if(entry.settleTimer!==null){view?.clearTimeout?.(entry.settleTimer);entry.settleTimer=null;}
  }
  function scheduleInlineCollapse(delay=380){
   if(entry.settleTimer!==null)view?.clearTimeout?.(entry.settleTimer);
   entry.settleTimer=view?.setTimeout?.(()=>{
    entry.settleTimer=null;
    if(entry.touching){scheduleInlineCollapse(delay);return;}
    wheel.classList.remove('is-engaged');
   },delay)??null;
  }
  wheel.addEventListener('pointerdown',()=>{
   if(select.disabled)return;
   entry.touching=true;
   beginInlineInteraction();
  },{passive:true});
  for(const name of ['pointerup','pointercancel']){
   wheel.addEventListener(name,()=>{
    entry.touching=false;
    scheduleInlineCollapse();
   },{passive:true});
  }
  scroll.addEventListener('scrollend',()=>{
   if(!entry.touching)scheduleInlineCollapse(180);
  },{passive:true});
  function rowHeight(){return parseFloat(view?.getComputedStyle(scroll).getPropertyValue('--wheel-row'))||52;}
  function highlight(){scroll.querySelectorAll('.cp19f-inline-option').forEach((row,i)=>{
   const chosen=i===entry.index;row.classList.toggle('is-current',chosen);row.setAttribute('aria-selected',String(chosen));
  });}
  function choose(i,scrollTo=false){
   if(select.disabled)return;
   const n=Math.max(0,Math.min(select.options.length-1,i));
   const changed=n!==entry.index;entry.index=n;entry.lastSynced=n;
   if(changed){
    select.value=select.options[n].value;
    select.dispatchEvent(new Event('input',{bubbles:true}));
    select.dispatchEvent(new Event('change',{bubbles:true}));
    feedback?.picker?.();
   }
   highlight();
   if(scrollTo){entry.busy=true;scroll.scrollTop=n*rowHeight();view?.requestAnimationFrame?.(()=>{entry.busy=false;});}
  }
  scroll.addEventListener('scroll',()=>{
   if(entry.busy||entry.raf)return;
   beginInlineInteraction();
   scheduleInlineCollapse(450);
   entry.raf=view?.requestAnimationFrame?.(()=>{
    entry.raf=0;choose(wheelIndex(scroll.scrollTop,rowHeight(),select.options.length));
   })||0;
  },{passive:true});
  scroll.addEventListener('keydown',e=>{
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();beginInlineInteraction();choose(entry.index+(e.key==='ArrowDown'?1:-1),true);scheduleInlineCollapse();
   }
   if(e.key==='Home'){e.preventDefault();beginInlineInteraction();choose(0,true);scheduleInlineCollapse();}
   if(e.key==='End'){e.preventDefault();beginInlineInteraction();choose(select.options.length-1,true);scheduleInlineCollapse();}
  });
  highlight();
 }
 function refresh(){
  for(const entry of entries){
   const {select,wheel,scroll}=entry;wheel.classList.toggle('is-disabled',select.disabled);
   if(select.disabled){
    if(entry.settleTimer!==null)view?.clearTimeout?.(entry.settleTimer);
    entry.settleTimer=null;entry.touching=false;wheel.classList.remove('is-engaged');
   }
   scroll.setAttribute('aria-disabled',String(select.disabled));
   const idx=Math.max(0,select.selectedIndex);
   if(scroll.clientHeight===0){entry.lastSynced=NaN;continue;}
   if(idx!==entry.lastSynced){entry.lastSynced=idx;entry.index=idx;
    const h=parseFloat(view?.getComputedStyle(scroll).getPropertyValue('--wheel-row'))||52;
    // Initial/restored positioning must not trigger the interaction zoom.
    entry.busy=true;
    scroll.scrollTop=idx*h;
    view?.requestAnimationFrame?.(()=>{entry.busy=false;});
    scroll.querySelectorAll('.cp19f-inline-option').forEach((row,i)=>{
     row.classList.toggle('is-current',i===idx);row.setAttribute('aria-selected',String(i===idx));
    });
   }
  }
 }
 refresh();return {refresh};
}
