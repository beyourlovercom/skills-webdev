/* Local-only listing first-page mobile UI. No source APIs, no inventory mutation. */
(() => {
 const ready=()=>{
  const sidebar=document.querySelector('[class*=Stock_filtersDesktop]');
  const trigger=document.querySelector('[class*=QuickFilterBar_allFiltersButton]');
  if(!sidebar||!trigger)return;
  const close=document.createElement('button');
  close.type='button';close.className='bwy-filter-close';close.textContent='Close filters';
  close.setAttribute('aria-label','Close filters');
  sidebar.prepend(close);
  let open=false;
  function setOpen(next){
   open=Boolean(next);
   document.body.classList.toggle('bwy-local-filters-open',open);
   trigger.setAttribute('aria-expanded',String(open));
   sidebar.setAttribute('aria-hidden',String(!open && matchMedia('(max-width:767px)').matches));
   document.body.style.overflow=open&&matchMedia('(max-width:767px)').matches?'hidden':'';
   if(open)close.focus();
  }
  trigger.addEventListener('click',e=>{
   if(matchMedia('(max-width:767px)').matches){e.preventDefault();e.stopPropagation();setOpen(!open);}
  },true);
  close.addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)setOpen(false);});
  window.addEventListener('resize',()=>{if(window.innerWidth>767&&open)setOpen(false);});
  trigger.setAttribute('aria-expanded','false');
  document.documentElement.dataset.bwyListingUiReady='true';
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();