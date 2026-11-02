// Self-authored fictitious test fixtures; NOT BAS World inventory.
globalThis.CATALOG_VEHICLES = Object.freeze([
  {id:"DEMO-001",type:"Truck",brand:"Atlas",model:"HX 520",title:"Atlas HX 520 6X4 Tipper",year:2021,mileageKm:124000,axle:"6X4",emission:"Euro 6",transmission:"Automatic",price:62500,currency:"USD",condition:"Used",image:"assets/vehicle.svg",description:"Fictitious 6X4 tipper for local archive acceptance tests."},
  {id:"DEMO-002",type:"Tractorhead",brand:"Nord",model:"Transit 410",title:"Nord Transit 410 4X2 Tractor Unit",year:2019,mileageKm:386000,axle:"4X2",emission:"Euro 5",transmission:"Automatic",price:28900,currency:"USD",condition:"Used",image:"assets/vehicle.svg",description:"Fictitious tractor unit to verify type and keyword filters."},
  {id:"DEMO-003",type:"Truck",brand:"Atlas",model:"Fleet 280",title:"Atlas Fleet 280 4X2 Box Truck",year:2023,mileageKm:42000,axle:"4X2",emission:"Euro 6",transmission:"Manual",price:45000,currency:"USD",condition:"Used",image:"assets/vehicle.svg",description:"Fictitious box truck for brand-and-year filtering."},
  {id:"DEMO-004",type:"Truck",brand:"Ridge",model:"Haul 460",title:"Ridge Haul 460 6X4 Flatbed",year:2017,mileageKm:550000,axle:"6X4",emission:"Euro 4",transmission:"Manual",price:23500,currency:"USD",condition:"Used",image:"assets/vehicle.svg",description:"Fictitious flatbed; lowest price in demo catalog."}
]);
