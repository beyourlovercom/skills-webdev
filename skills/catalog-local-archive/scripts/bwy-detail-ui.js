/* First real sample only: display immutable genuine JSON-LD values in SSR skeleton slots.
   Does not call original WooCommerce/Next APIs; no live forms, payment or tracking. */
(() => {
 const ready=()=>{
  const d=window.__bwyDetailSource;
  if(!d||!d.name||!d.sku)return;
  const make=(tag,cls,txt)=>{
   const e=document.createElement(tag);e.className=cls;
   if(txt!==undefined&&txt!==null)e.textContent=String(txt);return e;
  };
  const price=typeof d.price==='number' && Number.isFinite(d.price) && d.price>0
   ?new Intl.NumberFormat('en-GB',{style:'currency',currency:d.currency||'EUR',maximumFractionDigits:0}).format(d.price):null;
  const meta=[
    d.year ? String(d.year):null,
    d.axle||null,
    d.transmission||null,
    'SKU '+d.sku
  ].filter(Boolean).join('  ·  ');
  const header=document.querySelector('#pdpHeader');
  if(header){
    const sk=header.querySelector('.blinkAnimation');
    if(sk){
      const body=make('div','bwy-pdp-title');
      const title=make('h1','bwy-pdp-h1',d.name);
      body.append(title,make('p','bwy-pdp-subheading',meta));
      sk.replaceWith(body);
    }
  }
  const utility=document.querySelector('[class*=Vehicles_PDPUtilities]');
  if(utility){
   const sk=utility.querySelector(':scope > .blinkAnimation');
   if(sk && price){
    const box=make('div','bwy-pdp-price');
    box.append(make('span','bwy-price-label','Price'),make('strong','bwy-price-value',price));
    sk.replaceWith(box);
   }
  }
  const features=document.querySelector('[class*=PDPFeatures_featuresWrapper]');
  if(features){
   const facts=[
    ['Brand',d.brand],['Year',d.year],['Axle configuration',d.axle],
    ['Transmission',d.transmission],['Stock number',d.sku]
   ].filter(x=>x[1]!==null&&x[1]!==undefined&&x[1]!=='');
   if(facts.length){
    const list=make('dl','bwy-facts');
    for(const [key,value] of facts){
     list.append(make('dt','bwy-facts-key',key),make('dd','bwy-facts-value',value));
    }
    features.replaceChildren(list);features.style.height='auto';
    const section=features.closest('[class*=PDPFeatures_PDPFeatures]');
    if(section){
      const heading=section.querySelector('h2');
      if(heading&&!heading.textContent.trim())heading.textContent='Vehicle specifications';
    }
   }
  }

  // Remaining source placeholders represent live data that is absent from the
  // immutable HTML snapshot. Never fabricate an inspection or transport quote.
  const dynamicUnavailable=[
   ['Vehicle inspection','The live inspection report is not included in this local first-page preview.'],
   ['How to buy','The original purchase workflow is not connected to this offline copy.'],
   ['Transport & export','Live shipping rates are not available in this local copy.'],
   ['More vehicles','Additional products will only be restored after the first-page visual approval.']
  ];
  const pending=[...document.querySelectorAll('.blinkAnimation')].filter(e=>e.getBoundingClientRect().height>0);
  let idx=0;
  for(const element of pending){
    if(idx>=dynamicUnavailable.length)break;
    const [heading,note]=dynamicUnavailable[idx++];
    const section=make('section','bwy-offline-section');
    section.append(make('h3','bwy-offline-heading',heading),make('p','bwy-offline-note',note));
    section.setAttribute('data-bwy-pending-live-module',heading);
    element.replaceWith(section);
  }
  // Basic local-only photo navigation (no video player, remote fetch or stock API).
  document.querySelectorAll('.imageGalleryWrapperV1').forEach(gallery=>{
    const strip=gallery.querySelector('.slidesWrapper');
    if(!strip)return;
    const slides=[...strip.children].filter(x=>x.classList.contains('galleryImage'));
    if(slides.length<2)return;
    let index=0;
    function show(){
      slides.forEach((slide,i)=>{slide.classList.toggle('bwy-gallery-visible',i===index);});
      gallery.dataset.bwyGalleryIndex=String(index);
      gallery.dataset.bwyGalleryCount=String(slides.length);
      gallery.classList.add('bwy-gallery-ready');
    }
    const left=gallery.querySelector('.arrowLeftContainer');
    const right=gallery.querySelector('.arrowRightContainer');
    function move(delta){index=(index+delta+slides.length)%slides.length;show();}
    for(const [button,delta] of [[left,-1],[right,1]]){
      if(!button)continue;
      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();move(delta);},true);
      button.setAttribute('role','button');
      button.setAttribute('tabindex','0');
      button.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();move(delta);}});
    }
    show();
  });
  document.documentElement.dataset.bwyDetailUiReady='true';
  document.documentElement.dataset.bwyDetailSku=String(d.sku);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();