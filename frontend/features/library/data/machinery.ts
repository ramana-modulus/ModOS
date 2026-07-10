import type { LibMachinery } from "@/features/library/types";

export const LIB_MACHINERY: LibMachinery[] = [
  // MC-10xx | Earthwork & Excavation
  {code:'MC-1001',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Hydraulic Excavator / JCB Backhoe Loader',uom:'Day',rate:10000,fuelIncl:'Yes',opIncl:'Yes',cap:'Bucket 0.22–0.42 cum',comments:'Includes fuel & operator; DSR item #20; hard rock extra'},
  {code:'MC-1002',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Hydraulic Excavator – 1 cum Bucket',uom:'hr',rate:900,fuelIncl:'Yes',opIncl:'Yes',cap:'1 cum bucket; heavy-duty',comments:'Per hour rate; fuel & operator included'},
  {code:'MC-1003',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Dozer – 80 HP',uom:'hr',rate:1700,fuelIncl:'Yes',opIncl:'Yes',cap:'80 HP; clearing, grading',comments:'Per hour; fuel & operator included; DSR item #49'},
  {code:'MC-1004',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Bobcat / Skid Steer Loader',uom:'Day',rate:6000,fuelIncl:'Yes',opIncl:'Yes',cap:'Compact loader; bucket',comments:'Tight-space excavation, levelling; DSR item #18'},
  {code:'MC-1005',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Motor Grader – 3.35m Blade',uom:'hr',rate:2700,fuelIncl:'Yes',opIncl:'Yes',cap:'3.35m blade; road finishing',comments:'Per hour; DSR item #50'},
  {code:'MC-1006',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Front End Loader – 1 cum Bucket',uom:'Day',rate:6700,fuelIncl:'Yes',opIncl:'Yes',cap:'1 cum bucket; loading',comments:'Includes POL; DSR item #14 / #52'},
  {code:'MC-1007',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Tractor with Ripper Attachment',uom:'Day',rate:1350,fuelIncl:'Yes',opIncl:'Yes',cap:'Standard farm tractor',comments:'Light ripping, sub-soil loosening; DSR item #38'},
  {code:'MC-1008',group:'MC-10xx',groupLabel:'Earthwork & Excavation',machine:'Tractor with Trolley',uom:'Day',rate:1350,fuelIncl:'Yes',opIncl:'Yes',cap:'Tractor + 3–5 MT trolley',comments:'Intra-site material shifting; DSR item #39'},
  // MC-20xx | Compaction & Levelling
  {code:'MC-2001',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Vibratory Roller – 8 to 10 Tonne',uom:'hr',rate:700,fuelIncl:'Yes',opIncl:'Yes',cap:'8–10 T; subgrade, granular',comments:'DSR item #54; per hour rate'},
  {code:'MC-2002',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Smooth Wheeled Roller – 8 to 10 Tonne',uom:'hr',rate:350,fuelIncl:'Yes',opIncl:'Yes',cap:'8–10 T; bituminous surface',comments:'DSR item #55'},
  {code:'MC-2003',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Tandem Road Roller',uom:'hr',rate:1350,fuelIncl:'Yes',opIncl:'Yes',cap:'Tandem; asphalt finishing',comments:'DSR item #56'},
  {code:'MC-2004',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Diesel Road Roller – 8 to 10 Tonne',uom:'Day',rate:3350,fuelIncl:'Yes',opIncl:'Yes',cap:'8–10 T road roller',comments:'DSR item #3'},
  {code:'MC-2005',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Vibrating Plate Compactor',uom:'Day',rate:800,fuelIncl:'No',opIncl:'No',cap:'Hand-operated; 60–100 kg',comments:'Confined areas, trench backfill'},
  {code:'MC-2006',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Rammer / Jumping Jack Compactor',uom:'Day',rate:600,fuelIncl:'No',opIncl:'No',cap:'Petrol/diesel; ~60 kg',comments:'Trench, column pit compaction'},
  {code:'MC-2007',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Power Trowel (Helicopter Finisher)',uom:'Day',rate:1000,fuelIncl:'No',opIncl:'No',cap:'24–48 inch blades',comments:'Floor flatness; operator extra'},
  {code:'MC-2008',group:'MC-20xx',groupLabel:'Compaction & Levelling',machine:'Concrete Joint Cutting Machine',uom:'Day',rate:700,fuelIncl:'No',opIncl:'No',cap:'2–3 blades; 3–5 mm cut',comments:'Expansion & contraction joints; DSR item #47'},
  // MC-30xx | Lifting & Cranes
  {code:'MC-3001',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Mobile Crane – 9 to 10 Tonne (Light)',uom:'Day',rate:3900,fuelIncl:'Yes',opIncl:'Yes',cap:'Lift cap 9–10 T; boom',comments:'DSR item #25; rigging & rigger extra'},
  {code:'MC-3002',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Mobile Crane – 20 Tonne',uom:'Day',rate:7850,fuelIncl:'Yes',opIncl:'Yes',cap:'Lift cap 20 T',comments:'DSR item #28; certified operator required'},
  {code:'MC-3003',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Mobile Crane – 40 Tonne',uom:'Day',rate:8950,fuelIncl:'Yes',opIncl:'Yes',cap:'Lift cap 40 T; outrigger',comments:'DSR item #44'},
  {code:'MC-3004',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Mobile Crane – 50 Tonne',uom:'Day',rate:9500,fuelIncl:'Yes',opIncl:'Yes',cap:'Lift cap 50 T',comments:'DSR item #72'},
  {code:'MC-3005',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Mobile Crane – 80 Tonne',uom:'Day',rate:16000,fuelIncl:'Yes',opIncl:'Yes',cap:'Lift cap 80 T; heavy',comments:'Heavy structural lifts'},
  {code:'MC-3006',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Tower Crane – 6 T at 45m',uom:'Month',rate:180000,fuelIncl:'Yes',opIncl:'Yes',cap:'6 T at 45m radius',comments:'Erection/dismantling extra; DSR item #26'},
  {code:'MC-3007',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Hydra Crane – 12 Tonne',uom:'Day',rate:3500,fuelIncl:'Yes',opIncl:'Yes',cap:'12 T; telescopic',comments:'Steel erection, precast placement'},
  {code:'MC-3008',group:'MC-30xx',groupLabel:'Lifting & Cranes',machine:'Chain Pulley Block – 3 Tonne',uom:'Day',rate:150,fuelIncl:'No',opIncl:'No',cap:'3 T; manual',comments:'Small lifts, equipment shifting'},
  // MC-40xx | Concrete Works
  {code:'MC-4001',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Concrete Mixer – 1 Bag (0.2 cum)',uom:'Day',rate:800,fuelIncl:'No',opIncl:'No',cap:'0.2 cum; diesel/electric',comments:'Site-batched PCC/RCC; DSR item #8'},
  {code:'MC-4002',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Concrete Mixer – 10/7 (0.28 cum)',uom:'Day',rate:1200,fuelIncl:'No',opIncl:'No',cap:'0.28 cum; diesel',comments:'Medium-volume site concrete; DSR item #9'},
  {code:'MC-4003',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Transit Mixer / RMC Truck – 6 cum',uom:'Trip',rate:2500,fuelIncl:'Yes',opIncl:'Yes',cap:'6 cum drum',comments:'RMC delivery; agitation included; DSR item #10'},
  {code:'MC-4004',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Concrete Pump – Boom (30 m³/hr)',uom:'Day',rate:12000,fuelIncl:'Yes',opIncl:'Yes',cap:'30 m³/hr; 28m boom',comments:'High-rise/long-distance pour; DSR item #11'},
  {code:'MC-4005',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Line Pump – Trailer Mounted',uom:'Day',rate:7000,fuelIncl:'Yes',opIncl:'Yes',cap:'20–25 m³/hr',comments:'Slabs, columns; pipe run extra; DSR item #12'},
  {code:'MC-4006',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Needle Vibrator – 60mm',uom:'Day',rate:300,fuelIncl:'No',opIncl:'No',cap:'60mm dia; electric',comments:'Compaction; DSR item #13'},
  {code:'MC-4007',group:'MC-40xx',groupLabel:'Concrete Works',machine:'Screed Vibrator / Roller Screed',uom:'Day',rate:600,fuelIncl:'No',opIncl:'No',cap:'3–6m span',comments:'Slab surface levelling'},
  // MC-50xx | Welding & Fabrication
  {code:'MC-5001',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'Arc Welding Set – 400A (SMAW)',uom:'Day',rate:500,fuelIncl:'No',opIncl:'No',cap:'400A; electrode welding',comments:'Structural weld; consumables extra'},
  {code:'MC-5002',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'MIG / MAG Welding Machine – 350A',uom:'Day',rate:700,fuelIncl:'No',opIncl:'No',cap:'350A; wire feed',comments:'Semi-auto; wire & gas extra'},
  {code:'MC-5003',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'TIG Welding Machine',uom:'Day',rate:800,fuelIncl:'No',opIncl:'No',cap:'200A; precision weld',comments:'Stainless, aluminium; gas extra'},
  {code:'MC-5004',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'Gas Cutting Set (Oxy-Acetylene)',uom:'Day',rate:400,fuelIncl:'No',opIncl:'No',cap:'Oxy-acetylene torch',comments:'Plate/section cutting; gas cylinders extra'},
  {code:'MC-5005',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'Angle Grinder – 9 inch',uom:'Day',rate:250,fuelIncl:'No',opIncl:'No',cap:'2200W; 230mm disc',comments:'Grinding, cutting; discs extra'},
  {code:'MC-5006',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'Drill Machine – Magnetic / Rotary',uom:'Day',rate:400,fuelIncl:'No',opIncl:'No',cap:'32mm dia; HSS bit',comments:'Column/plate holes; bits extra'},
  {code:'MC-5007',group:'MC-50xx',groupLabel:'Welding & Fabrication',machine:'Shot Blasting Machine',uom:'Day',rate:3500,fuelIncl:'Yes',opIncl:'Yes',cap:'Portable; SA 2.5 finish',comments:'Surface prep; grit & operator extra'},
  // MC-60xx | Roofing & Cladding
  {code:'MC-6001',group:'MC-60xx',groupLabel:'Roofing & Cladding',machine:'Screw-Fixing / Self-Drilling Machine',uom:'Day',rate:350,fuelIncl:'No',opIncl:'No',cap:'Electric; hex drive',comments:'Profiled sheet & purlin fixing; bits extra'},
  {code:'MC-6002',group:'MC-60xx',groupLabel:'Roofing & Cladding',machine:'Seam-Locking Machine (Standing Seam)',uom:'Day',rate:1800,fuelIncl:'No',opIncl:'No',cap:'Electric; auto seam',comments:'Standing seam roof; operator extra'},
  {code:'MC-6003',group:'MC-60xx',groupLabel:'Roofing & Cladding',machine:'Sheet Metal Folder / Brake Press',uom:'Day',rate:2500,fuelIncl:'No',opIncl:'No',cap:'2.5m bed; 1mm–6mm',comments:'Ridge cap, flashing, box gutter'},
  {code:'MC-6004',group:'MC-60xx',groupLabel:'Roofing & Cladding',machine:'Scissor Lift – 10m (Electric)',uom:'Day',rate:3500,fuelIncl:'No',opIncl:'No',cap:'10m; 250 kg platform',comments:'Roof/cladding fixing at height; DSR item #30'},
  {code:'MC-6005',group:'MC-60xx',groupLabel:'Roofing & Cladding',machine:'Boom Lift / Aerial Work Platform – 15m',uom:'Day',rate:6500,fuelIncl:'Yes',opIncl:'Yes',cap:'15m; 200 kg boom',comments:'Elevated fixing; operator extra where noted'},
];
