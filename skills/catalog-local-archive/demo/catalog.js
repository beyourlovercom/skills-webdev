// Offline filtering engine, shared by static pages and Node acceptance tests.
(function(global) {
  function filterProducts(data, query) {
    const q=(query.keyword||"").trim().toLowerCase();
    const result=data.filter(p =>
      (!query.brand || p.brand===query.brand) &&
      (!query.type || p.type===query.type) &&
      (!query.axle || p.axle===query.axle) &&
      (!query.year || p.year>=Number(query.year)) &&
      (!q || [p.title,p.model,p.brand,p.id].join(" ").toLowerCase().includes(q))
    );
    if(query.sort==="price-low") result.sort((a,b)=>a.price-b.price);
    if(query.sort==="price-high") result.sort((a,b)=>b.price-a.price);
    if(query.sort==="year-new") result.sort((a,b)=>b.year-a.year);
    return result;
  }
  global.CATALOG_QUERY = {filterProducts};
})(globalThis);
