document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.nav-toggle'),nav=document.querySelector('.mainnav');
 if(toggle&&nav)toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open?'true':'false')});
 const filters=document.getElementById('vehicle-filters');
 if(filters){
  const cards=[...document.querySelectorAll('.catalog-item[data-vehicle]')],count=document.getElementById('vehicle-count');
  const apply=()=>{
   const keyword=String(filters.querySelector('[name="q"]').value||'').toLowerCase();
   const brand=filters.querySelector('[name="brand"]').value;
   const type=filters.querySelector('[name="type"]').value;
   const year=Number(filters.querySelector('[name="year"]').value||0);
   let n=0;
   for(const c of cards){
    const ok=(!keyword||c.textContent.toLowerCase().includes(keyword))&&(!brand||c.dataset.brand===brand)&&(!type||c.dataset.type===type)&&(!year||Number(c.dataset.year)>=year);
    c.hidden=!ok;if(ok)n++;
   }
   if(count)count.textContent=String(n);
  };
  for(const el of filters.querySelectorAll('input,select'))el.addEventListener('input',apply);
  filters.querySelector('[type="reset"]')?.addEventListener('click',()=>requestAnimationFrame(apply));
  apply();
 }
});