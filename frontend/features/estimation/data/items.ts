import type { EstItem } from "@/features/estimation/types";

/**
 * The base costing-sheet line items for a PEB warehouse (Oragadam) — ported
 * verbatim from the prototype's `EST_ITEMS`. Every sub-project gets its own
 * `structuredClone` of this template (the prototype deep-copies `EST_ITEMS`
 * into a frozen `EST_ITEMS_TEMPLATE`). Codes match `LIB_ITEMS` exactly so a BOM
 * drilldown could resolve; rates are project-specific.
 */
export const EST_ITEMS_TEMPLATE: EstItem[] = [
  // SUPERSTRUCTURE — SS
  { sno: "1", cat: "SS", subcat: "MS Primary Steel (Mild Steel - IS 2062)", code: "SS-1001", desc: "MS - Hot Rolled - Tubular RHS/SHS/CHS", unit: "kg", qty: 36000, material: 88, machinery: 17, manpower: 15, transport: null, wastage: null, gst: 18, remarks: "Budg: 3 kg/sqm × 12,000 sqm" },
  { sno: "1.1", cat: "SS", subcat: "MS Primary Steel (Mild Steel - IS 2062)", code: "SS-1004", desc: "MS - Welded Built-up - Open universal I/H/Channel/Angle", unit: "kg", qty: 350.33, material: 90, machinery: 20, manpower: 18, transport: null, wastage: null, gst: 18, remarks: "" },
  { sno: "1.2", cat: "SS", subcat: "HDG Primary Steel (Hot-Dip Galvanized)", code: "SS-2001", desc: "HDG - Hot Rolled - Tubular RHS/SHS/CHS", unit: "kg", qty: 24.61, material: 115, machinery: 17, manpower: 15, transport: null, wastage: null, gst: 18, remarks: "" },
  // FENESTRATIONS — FN
  { sno: "2", cat: "FN", subcat: "WBC / Composite Doors", code: "FN-4001", desc: "WBC door shutter (35mm flush) — incl. hardware", unit: "sqm", qty: 2.1, material: 2334.4, machinery: 0, manpower: 102, transport: null, wastage: null, gst: 18, remarks: "1000×2100mm leaf · shutter flat/sqm + hinges/lock/handle fitted by us" },
  { sno: "2.1", cat: "FN", subcat: "WBC / Composite Doors", code: "FN-4002", desc: "WBC door frame (75×40mm section)", unit: "m", qty: 5.2, material: 332.8, machinery: 0, manpower: 68, transport: null, wastage: null, gst: 18, remarks: "Frame perimeter for 1000×2100 opening · flat/m + fixing" },
  // WALL SYSTEM — WS
  { sno: "3", cat: "WS", subcat: "PUF / PIR Insulated Wall Panel", code: "WC-1001", desc: "PIR wall panel 40mm (two-skin colour-coated)", unit: "sqm", qty: 33.21, material: 2147.67, machinery: 41, manpower: 370, transport: null, wastage: null, gst: 18, remarks: "" },
  { sno: "3.1", cat: "WS", subcat: "PUF / PIR Insulated Wall Panel", code: "WC-1002", desc: "PIR wall panel 60mm", unit: "sqm", qty: 33.21, material: 2547.67, machinery: 49, manpower: 370, transport: null, wastage: null, gst: 18, remarks: "" },
  // ROOF — RF
  { sno: "4", cat: "RF", subcat: "GI / Aluzinc Profiled Metal Sheet", code: "RC-1001", desc: "GI/PPGI profiled sheet", unit: "sqm", qty: 10.23, material: 654, machinery: 32, manpower: 255, transport: null, wastage: null, gst: 18, remarks: "" },
  // ELECTRICAL — EL
  { sno: "5", cat: "EL", subcat: "Internal Electrification", code: "EL-1001", desc: "Primary Light point", unit: "nos", qty: 80, material: 397.15, machinery: 0, manpower: 660, transport: null, wastage: null, gst: 18, remarks: "" },
  { sno: "5.1", cat: "EL", subcat: "Circuit Breakers", code: "EL-2001", desc: "6A SP MCB", unit: "nos", qty: 20, material: 140, machinery: 0, manpower: 117, transport: null, wastage: null, gst: 18, remarks: "" },
  // PLUMBING — PL
  { sno: "6", cat: "PL", subcat: "Internal Water Supply Piping", code: "PL-1001", desc: "CPVC exposed on wall - 15mm", unit: "m", qty: 120, material: 77.82, machinery: 3.89, manpower: 50, transport: null, wastage: null, gst: 18, remarks: "" },
  { sno: "6.1", cat: "PL", subcat: "Plumbing Fixtures", code: "PL-5001", desc: "EWC (European Water Closet)", unit: "nos", qty: 2, material: 2982.65, machinery: 0, manpower: 2430, transport: null, wastage: null, gst: 18, remarks: "" },
];
