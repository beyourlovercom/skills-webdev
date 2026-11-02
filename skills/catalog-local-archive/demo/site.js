// Self-contained browser renderer. All URLs are relative. No network APIs.
(function(){
  "use strict";
  const items=globalThis.CATALOG_VEHICLES||[];
  const queryEngine=globalThis.CATALOG_QUERY;
  const $=id=>document.getElementById(id);
  const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money=p=>new Intl.NumberFormat("en-US",{style:"currency",currency:p.currency,maximumFractionDigits:0}).format(p.price);
  const num=n=>new Intl.NumberFormat("en-US").format(n);
  function query(){
    return Object.fromEntries(["keyword","brand","type","axle","year","sort"].map(k=>[k,$(k)?.value||""]));
  }
  function itemCard(p){
    return '<div class="vehicle" data-product-id="'+escapeHTML(p.id)+'">'+
      '<img src="'+escapeHTML(p.image)+'" alt="Original fictitious vehicle illustration" loading="eager">'+
      '<article><div class="eyebrow">'+escapeHTML(p.type)+' · '+escapeHTML(p.id)+'</div>'+
      '<h3><a href="detail.html?id='+encodeURIComponent(p.id)+'">'+escapeHTML(p.title)+'</a></h3>'+
      '<div class="specs"><span>'+p.year+'</span><span>'+escapeHTML(p.axle)+'</span>'+
      '<span>'+num(p.mileageKm)+' km</span><span>'+escapeHTML(p.emission)+'</span></div>'+
      '<div class="price">'+money(p)+'</div>'+
      '<a class="button" href="detail.html?id='+encodeURIComponent(p.id)+'">Vehicle details</a></article></div>';
  }
  function listPage(){
    const params=new URLSearchParams(location.search);
    for(const key of ["keyword","brand","type","axle","year","sort"]) if(params.has(key) && $(key)) $(key).value=params.get(key);
    const render=()=>{
      const found=queryEngine.filterProducts(items,query());
      $("count").textContent=String(found.length);
      $("results").innerHTML=found.length?found.map(itemCard).join(""):'<p>No test vehicles match these filters.</p>';
    };
    ["keyword","brand","type","axle","year","sort"].forEach(k=>{
      const el=$(k);
      el.addEventListener(el.tagName==="INPUT"?"input":"change",render);
    });
    $("reset").addEventListener("click",()=>{["keyword","brand","type","axle","year","sort"].forEach(k=>$(k).value="");render();});
    render();
  }
  function detailPage(){
    const id=new URLSearchParams(location.search).get("id");
    const p=items.find(v=>v.id===id);
    if(!p){$("detail").textContent="This test vehicle does not exist.";return;}
    document.title=p.title+" | Offline Catalog Pilot";
    const fields=[["Brand",p.brand],["Model",p.model],["Condition",p.condition],["Year",p.year],["Mileage",num(p.mileageKm)+" km"],["Axle",p.axle],["Emissions",p.emission],["Transmission",p.transmission]];
    $("detail").innerHTML='<div class="detailgrid">'+
      '<div><img id="vehicle-img" src="'+escapeHTML(p.image)+'" alt="Original fictitious vehicle illustration"><p id="asset-state" class="sub">Image checking…</p></div>'+
      '<div><div class="eyebrow">'+escapeHTML(p.type)+' · '+escapeHTML(p.id)+'</div>'+
      '<h1>'+escapeHTML(p.title)+'</h1><p>'+escapeHTML(p.description)+'</p>'+
      '<div class="price">'+money(p)+'</div><dl>'+
      fields.map(f=>'<div><dt>'+escapeHTML(f[0])+'</dt><dd>'+escapeHTML(f[1])+'</dd></div>').join("")+
      '</dl><p><a class="button" href="index.html">Back to stock</a></p></div></div>';
    const img=$("vehicle-img"),status=$("asset-state");
    img.addEventListener("load",()=>status.textContent="Local image loaded ("+img.naturalWidth+" × "+img.naturalHeight+")");
    img.addEventListener("error",()=>status.textContent="FAIL: local image missing");
    if(img.complete)status.textContent=img.naturalWidth>0?"Local image loaded ("+img.naturalWidth+" × "+img.naturalHeight+")":"FAIL: local image missing";
  }
  document.addEventListener("DOMContentLoaded",()=>{$("results")?listPage():detailPage();});
})();
