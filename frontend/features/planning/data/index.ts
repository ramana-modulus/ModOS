/**
 * Planning seed data — Oragadam Warehouse (P1), sub-project SP1 (Porta Cabin A).
 *
 * Ported verbatim from modos_v436.html. In the prototype the WBS is NOT a
 * hand-coded store: it is derived at load from the approved estimation BOQ
 * (`getPlanningSourceItems` → the 12 EST_ITEMS below) and a per-cabin activity
 * template (`tplBlocks`, reproduced in domain.ts) driven by the signed-off
 * kickoff decisions (SEED_KO below). We reproduce the *inputs* faithfully and
 * regenerate the blocks with the same pure logic, so WBS_ITEMS is identical to
 * what the prototype builds on first render.
 *
 * Sources in modos_v436.html:
 *   • EST_ITEMS (line 15384) — the 12 canonical P1.SP1 line items.
 *   • getItemValue (18534)   — unit prime = material+machinery+manpower.
 *   • SEED_KO (34099)        — signed-off P1.SP1 kickoff decisions.
 *   • WBS_ITEM_ATTRS (17932) — per-item billing overrides (else project default).
 *   • PLANNING_STATE (18259) — P1 plan state (draft, auto-populated).
 *   • PROJECTS (4320)        — P1 project record + sub-projects.
 */
import type {
  BillingMode,
  KickoffDecision,
  PlanState,
  ProjectMeta,
  SourceItem,
  SubProjectMeta,
} from "@/features/planning/types";

/** DEMO_TODAY (modos_v436.html:16517) — reference "now" for the schedule. */
export const DEMO_TODAY = "23 May 2026";

/** P1 project record (PROJECTS[0]). */
export const PROJECT: ProjectMeta = {
  id: "P1",
  code: "DCL/127",
  name: "Oragadam Warehouse",
  client: "Kesavan",
  value: "₹53.93 Cr",
  stage: "Execution",
  startDate: "01 Apr 2026",
  duration: 120,
  awarded: true,
};

export const SUB_PROJECTS: SubProjectMeta[] = [
  { id: "SP1", name: "Porta Cabin A", units: 59, spec: "19×14×9 ft" },
  { id: "SP2", name: "Porta Cabin B", units: 8, spec: "20×10×8.5 ft" },
];

/**
 * The 12 P1.SP1 source line items = `getPlanningSourceItems('P1','SP1')`, which
 * resolves to EST_SUBPROJECTS['L4'][0].items (a deep copy of EST_ITEMS). Ported
 * verbatim from EST_ITEMS (modos_v436.html:15384). `unitValue` = getItemValue =
 * material + machinery + manpower (per unit).
 */
export const SOURCE_ITEMS: SourceItem[] = [
  // SUPERSTRUCTURE — SS
  { code: "SS-1001", name: "MS - Hot Rolled - Tubular RHS/SHS/CHS", cat: "Superstructure", catId: "SS", uom: "kg", qtyPerUnit: 36000, unitValue: 88 + 17 + 15 },
  { code: "SS-1004", name: "MS - Welded Built-up - Open universal I/H/Channel/Angle", cat: "Superstructure", catId: "SS", uom: "kg", qtyPerUnit: 350.33, unitValue: 90 + 20 + 18 },
  { code: "SS-2001", name: "HDG - Hot Rolled - Tubular RHS/SHS/CHS", cat: "Superstructure", catId: "SS", uom: "kg", qtyPerUnit: 24.61, unitValue: 115 + 17 + 15 },
  // FENESTRATIONS — FN
  { code: "FN-4001", name: "WBC door shutter (35mm flush) — incl. hardware", cat: "Fenestrations", catId: "FN", uom: "sqm", qtyPerUnit: 2.1, unitValue: 2334.4 + 0 + 102 },
  { code: "FN-4002", name: "WBC door frame (75×40mm section)", cat: "Fenestrations", catId: "FN", uom: "m", qtyPerUnit: 5.2, unitValue: 332.8 + 0 + 68 },
  // WALL SYSTEM — WS
  { code: "WC-1001", name: "PIR wall panel 40mm (two-skin colour-coated)", cat: "Wall System / Cladding", catId: "WS", uom: "sqm", qtyPerUnit: 33.21, unitValue: 2147.67 + 41 + 370 },
  { code: "WC-1002", name: "PIR wall panel 60mm", cat: "Wall System / Cladding", catId: "WS", uom: "sqm", qtyPerUnit: 33.21, unitValue: 2547.67 + 49 + 370 },
  // ROOF — RF
  { code: "RC-1001", name: "GI/PPGI profiled sheet", cat: "Roof", catId: "RF", uom: "sqm", qtyPerUnit: 10.23, unitValue: 654 + 32 + 255 },
  // ELECTRICAL — EL
  { code: "EL-1001", name: "Primary Light point", cat: "Electrical", catId: "EL", uom: "nos", qtyPerUnit: 80, unitValue: 397.15 + 0 + 660 },
  { code: "EL-2001", name: "6A SP MCB", cat: "Electrical", catId: "EL", uom: "nos", qtyPerUnit: 20, unitValue: 140 + 0 + 117 },
  // PLUMBING — PL
  { code: "PL-1001", name: "CPVC exposed on wall - 15mm", cat: "Plumbing & Sanitary", catId: "PL", uom: "m", qtyPerUnit: 120, unitValue: 77.82 + 3.89 + 50 },
  { code: "PL-5001", name: "EWC (European Water Closet)", cat: "Plumbing & Sanitary", catId: "PL", uom: "nos", qtyPerUnit: 2, unitValue: 2982.65 + 0 + 2430 },
];

/**
 * SEED_KO — pre-signed P1.SP1 kickoff decisions (modos_v436.html:34099).
 * Two execution modes: turnkey Line-item SC or Manpower SC. `matNature` records
 * how MH sources the material (engineered / bought-out / client free-issue).
 */
export const KICKOFF_DECISIONS: Record<string, KickoffDecision> = {
  "SS-1001": { scType: "manpower", matNature: "engineered" },
  "SS-1004": { scType: "manpower", matNature: "engineered" },
  "SS-2001": { scType: "manpower", matNature: "boughtout" },
  "FN-4001": { scType: "lineitem", matNature: null },
  "FN-4002": { scType: "lineitem", matNature: null },
  "WC-1001": { scType: "manpower", matNature: "boughtout" },
  "WC-1002": { scType: "manpower", matNature: "boughtout" },
  "RC-1001": { scType: "manpower", matNature: "boughtout" },
  "EL-1001": { scType: "lineitem", matNature: null },
  "EL-2001": { scType: "manpower", matNature: "boughtout" },
  "PL-1001": { scType: "lineitem", matNature: null },
  "PL-5001": { scType: "manpower", matNature: "freeissue" },
};

export const KICKOFF_SIGNOFF = {
  signedOff: true,
  signedBy: "Ramana, Rohith, Aarumugam (Heads)",
  signedOn: "18 May 2026",
};

/**
 * Per-item billing overrides (WBS_ITEM_ATTRS['P1'], modos_v436.html:17932).
 * `null` inherits the project default (BOQ). EPC = milestone RA billing.
 */
export const BILLING_OVERRIDES: Record<string, BillingMode | null> = {
  "SS-1001": null,
  "SS-1004": null,
  "SS-2001": null,
  "FN-4001": "epc",
  "FN-4002": "epc",
  "WC-1001": "epc",
  "WC-1002": null,
  "RC-1001": null,
  "EL-1001": "epc",
  "EL-2001": null,
  "PL-1001": "epc",
  "PL-5001": null,
};

/** Project default billing mode (PROJ_EXT.contract.billingMode → 'boq'). */
export const PROJECT_BILLING_DEFAULT: BillingMode = "boq";

/** PLANNING_STATE['P1'] (modos_v436.html:18259). */
export const PLAN_STATE: PlanState = {
  status: "draft",
  autoPopulated: true,
  autoPopulatedAt: "04 Apr 2026 · 09:15 AM",
  history: [
    {
      status: "draft",
      by: "Suhas Darsi (Planner)",
      at: "04 Apr 2026 · 09:15 AM",
      note: "Auto-populated WBS from approved BOQ (12 line items)",
    },
  ],
};

/** WBS approval role holders (modos_v436.html:17606). */
export const WBS_PLANNER = "Suhas Darsi";
export const WBS_COO = "Gobinath";
export const WBS_CEO = "Shreeram R";

/** Per-cabin activity template constant (tplBlocks CYCLE_START, 34174). */
export const CYCLE_START = 30;
