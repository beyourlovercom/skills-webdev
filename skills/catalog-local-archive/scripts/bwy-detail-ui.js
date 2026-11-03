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
  document.documentElement.dataset.bwyDetailUiReady='true';
  document.documentElement.dataset.bwyDetailSku=String(d.sku);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();