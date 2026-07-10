/** Item Library (costing library) domain models — faithful to the `LIB_*` stores. */

export interface LibCategory {
  id: string;
  label: string;
  discipline: string;
}

export type LibBomType = "material" | "machinery" | "manpower";

export interface LibBomComponent {
  type: LibBomType;
  bomCode: string;
  name: string;
  unit: string;
  qty: number;
  rate: number;
}

/** A BOQ line item — the universal building block, with a BOM breakdown. */
export interface LibItem {
  code: string;
  cat: string;
  group: string;
  groupLabel: string;
  name: string;
  uom: string;
  stdQty: number;
  matRate: number;
  machRate: number;
  manRate: number;
  transRate: number;
  wastePct: number;
  itemType: string;
  lastUpdated: string;
  updatedBy: string;
  bom: LibBomComponent[];
  note?: string;
}

/** A BOM material master row — `[CAT]-M-[3digit]`. */
export interface LibMaterial {
  sno: number;
  code: string;
  group: string;
  groupLabel: string;
  name: string;
  spec: string;
  matCat: string;
  uom: string;
  stdQty: string;
  boqCodes: string;
  rate: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface LibManpower {
  code: string;
  group: string;
  groupLabel: string;
  trade: string;
  skill: string;
  uom: string;
  rateN: number;
  rateS?: number;
  rateE?: number;
  rateW?: number;
  remarks: string;
}

export interface LibMachinery {
  code: string;
  group: string;
  groupLabel: string;
  machine: string;
  uom: string;
  rate: number;
  fuelIncl: string;
  opIncl: string;
  cap: string;
  comments: string;
}

export interface LibTransport {
  code: string;
  group: string;
  groupLabel: string;
  desc: string;
  qtyType: string;
  rate: number | null;
  dims: string;
  vol: string;
  payload: string;
  comments: string;
}

export interface LibHistoryEntry {
  date: string;
  by: string;
  source: string;
  oldRate: number;
  newRate: number;
  delta: number;
  note: string;
}

/** Total rate = (mat + mach + man + trans) × (1 + wastage%). */
export function calcTotalRate(item: Pick<LibItem, "matRate" | "machRate" | "manRate" | "transRate" | "wastePct">): number {
  const base = (item.matRate || 0) + (item.machRate || 0) + (item.manRate || 0) + (item.transRate || 0);
  return base + (base * (item.wastePct || 0)) / 100;
}
