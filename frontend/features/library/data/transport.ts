import type { LibTransport } from "@/features/library/types";

export const LIB_TRANSPORT: LibTransport[] = [
  // TR-10xx | Heavy Trucks (Long Haul)
  {code:'TR-1001',group:'TR-10xx',groupLabel:'Heavy Trucks (Long Haul)',desc:'40 ft Trailer / Truck',qtyType:'KM',rate:null,dims:'40×8×7 ft',vol:'51 cum',payload:'25–30 MT',comments:'Structural panels, long steel, prefab wall/roof modules'},
  {code:'TR-1002',group:'TR-10xx',groupLabel:'Heavy Trucks (Long Haul)',desc:'32 ft Truck (14-Wheeler)',qtyType:'KM',rate:null,dims:'32×8×7 ft',vol:'41 cum',payload:'20–25 MT',comments:'Bulk materials, prefab components, heavy cargo'},
  {code:'TR-1003',group:'TR-10xx',groupLabel:'Heavy Trucks (Long Haul)',desc:'20 ft Truck (10-Wheeler)',qtyType:'KM',rate:null,dims:'20×7×6 ft',vol:'24 cum',payload:'15–18 MT',comments:'General construction materials, cement bags, bricks'},
  {code:'TR-1004',group:'TR-10xx',groupLabel:'Heavy Trucks (Long Haul)',desc:'Flatbed / Low-bed Trailer',qtyType:'KM',rate:null,dims:'40×8×Open',vol:'—',payload:'30–40 MT',comments:'Heavy machinery, OD loads, PEB columns & rafters'},
  {code:'TR-1005',group:'TR-10xx',groupLabel:'Heavy Trucks (Long Haul)',desc:'Tata LPT 2518 / SFC Truck',qtyType:'KM',rate:null,dims:'20×7×5 ft',vol:'20 cum',payload:'10–14 MT',comments:'Cement, bricks, steel bars, bagged materials'},
  {code:'TR-1006',group:'TR-10xx',groupLabel:'Heavy Trucks (Long Haul)',desc:'Tipper / Dumper Truck',qtyType:'KM',rate:null,dims:'14×7×4 ft',vol:'11 cum',payload:'8–12 MT',comments:'Sand, gravel, earth, demolition debris (loose/bulk)'},
  // TR-20xx | Medium Trucks (Intermediate)
  {code:'TR-2001',group:'TR-20xx',groupLabel:'Medium Trucks (Intermediate)',desc:'Eicher / Mahindra Furio Truck',qtyType:'KM',rate:null,dims:'17×7×5 ft',vol:'17 cum',payload:'7–10 MT',comments:'Tiles, pipes, bagged materials, mixed cargo'},
  {code:'TR-2002',group:'TR-20xx',groupLabel:'Medium Trucks (Intermediate)',desc:'Tata 407 (14 ft)',qtyType:'KM',rate:null,dims:'14×6×5 ft',vol:'12 cum',payload:'3–4 MT',comments:'Hardware, fittings, small material runs'},
  {code:'TR-2003',group:'TR-20xx',groupLabel:'Medium Trucks (Intermediate)',desc:'Mahindra Supro / Jeeto',qtyType:'KM',rate:null,dims:'9×5×4 ft',vol:'5 cum',payload:'1.5–2 MT',comments:'Tools, small fittings, site supplies'},
  // TR-30xx | Light Vehicles (Last-Mile)
  {code:'TR-3001',group:'TR-30xx',groupLabel:'Light Vehicles (Last-Mile)',desc:'Tata Ace (Chhota Hathi)',qtyType:'KM',rate:null,dims:'7×5×3.5 ft',vol:'3.5 cum',payload:'0.75–1 MT',comments:'Last-mile delivery, site consumables, small tools'},
  {code:'TR-3002',group:'TR-30xx',groupLabel:'Light Vehicles (Last-Mile)',desc:'Bolero Pickup',qtyType:'KM',rate:null,dims:'8×5×2 ft',vol:'2.5 cum',payload:'1–1.25 MT',comments:'Tools, equipment, small material runs'},
  {code:'TR-3003',group:'TR-30xx',groupLabel:'Light Vehicles (Last-Mile)',desc:'Ashok Leyland Dost',qtyType:'KM',rate:null,dims:'9×5×4 ft',vol:'5 cum',payload:'1.25–1.5 MT',comments:'Mixed construction materials, hardware'},
  {code:'TR-3004',group:'TR-30xx',groupLabel:'Light Vehicles (Last-Mile)',desc:'Tata Intra / Yodha',qtyType:'KM',rate:null,dims:'9×5×4 ft',vol:'5 cum',payload:'1–1.5 MT',comments:'Hardware, plumbing, electrical materials'},
  {code:'TR-3005',group:'TR-30xx',groupLabel:'Light Vehicles (Last-Mile)',desc:'Three-Wheeler Tempo',qtyType:'KM',rate:null,dims:'6×4×3 ft',vol:'2 cum',payload:'0.5–0.75 MT',comments:'Narrow access, urban sites, small loads'},
  // TR-40xx | Specialized Vehicles
  {code:'TR-4001',group:'TR-40xx',groupLabel:'Specialized Vehicles',desc:'Transit Mixer (RMC Truck)',qtyType:'KM',rate:null,dims:'Drum 6–7 cum',vol:'6.5 cum',payload:'—',comments:'Ready-mix concrete; drum capacity per load'},
  {code:'TR-4002',group:'TR-40xx',groupLabel:'Specialized Vehicles',desc:'Crane Truck / Hydra Crane',qtyType:'KM',rate:null,dims:'Reach 12–14m',vol:'—',payload:'5–14 T',comments:'Steel erection, heavy lifts, precast placement'},
  {code:'TR-4003',group:'TR-40xx',groupLabel:'Specialized Vehicles',desc:'Water Tanker',qtyType:'KM',rate:null,dims:'5,000–10,000 L',vol:'—',payload:'—',comments:'Site water, curing, dust suppression'},
];
