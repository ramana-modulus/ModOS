import type { ScopeItem, ScopeRecord } from "@/features/ops/types";

/**
 * `OPS_SCOPE_ITEMS` — the BOQ lines in execution for a scope, with their line
 * metadata + authoritative sub-project **planned total** (the progress
 * denominator) and execution mode. In the prototype these fields are resolved
 * live from Estimation/Engineering (`getPlanningSourceItems`) and the agreed
 * subcontract WO totals (`opsLineTotal`); ported here as a self-contained seed
 * so the Operations module renders faithfully without the other departments.
 */
export const OPS_SCOPE_ITEMS: Record<string, ScopeItem[]> = {
  "P1.SP1": [
    { code: "SS-1001", name: "MS Hot Rolled Tubular Steel (RHS/SHS/CHS)", cat: "Superstructure", uom: "kg", plannedTotal: 36000, bomTotal: 38400, scType: "manpower" },
    { code: "SS-1004", name: "MS Welded Built-up I/H/Channel Sections", cat: "Superstructure", uom: "kg", plannedTotal: 380, bomTotal: 380, scType: "manpower" },
    { code: "SS-2001", name: "HDG Hot Rolled Tubular Steel", cat: "Superstructure", uom: "kg", plannedTotal: 25, bomTotal: 25, scType: "self" },
    { code: "FN-4001", name: "WBC Door Shutter (35mm flush)", cat: "Fenestrations", uom: "sqm", plannedTotal: 123.9, bomTotal: 123.9, scType: "lineitem" },
    { code: "WC-1001", name: "PIR Insulated Wall Panel 40mm", cat: "Wall System", uom: "sqm", plannedTotal: 1959.39, bomTotal: 1959.39, scType: "manpower" },
    { code: "EL-1001", name: "Primary Light Point", cat: "Electrical", uom: "nos", plannedTotal: 80, bomTotal: 80, scType: "lineitem" },
    { code: "PL-1001", name: "CPVC Pipe 15mm", cat: "Plumbing", uom: "m", plannedTotal: 240, bomTotal: 120, scType: "lineitem" },
  ],
  "P1.SP2": [],
};

/**
 * `OPS_SCOPE` — THE single source of execution progress: cumulative installed
 * qty per BOQ line, with a dated progress `log` and DPR `checkpoints`. Ported
 * verbatim from the prototype's `OPS_SCOPE` (all seed lines are quantity-tracked
 * site work; there are no milestone/bought-out lines in P1.SP1).
 */
export const OPS_SCOPE: Record<string, Record<string, ScopeRecord>> = {
  "P1.SP1": {
    "SS-1001": {
      cumQty: 12600,
      log: [
        { date: "23 May 2026", qty: 1800, by: "Vignesh (Site Mgr)" },
        { date: "22 May 2026", qty: 2400, by: "Vignesh (Site Mgr)" },
        { date: "21 May 2026", qty: 2200, by: "Vignesh (Site Mgr)" },
        { date: "20 May 2026", qty: 2000, by: "Manoj (Asst. Site Engg.)" },
        { date: "18 May 2026", qty: 1800, by: "Vignesh (Site Mgr)" },
        { date: "17 May 2026", qty: 2400, by: "Vignesh (Site Mgr)" },
      ],
      checkpoints: [
        { date: "17 May 2026", cum: 2400, dpr: "DPR-047" },
        { date: "18 May 2026", cum: 4200, dpr: "DPR-048" },
        { date: "20 May 2026", cum: 8400, dpr: "DPR-050" },
        { date: "22 May 2026", cum: 10800, dpr: "DPR-052" },
        { date: "23 May 2026", cum: 12600, dpr: "DPR-053" },
      ],
    },
    "SS-1004": {
      cumQty: 200,
      log: [
        { date: "22 May 2026", qty: 80, by: "Vignesh (Site Mgr)" },
        { date: "20 May 2026", qty: 120, by: "Manoj (Asst. Site Engg.)" },
      ],
      checkpoints: [
        { date: "20 May 2026", cum: 120, dpr: "DPR-050" },
        { date: "22 May 2026", cum: 200, dpr: "DPR-052" },
      ],
    },
    "SS-2001": {
      cumQty: 24.61,
      log: [{ date: "12 May 2026", qty: 24.61, by: "Vignesh (Site Mgr)" }],
      checkpoints: [{ date: "12 May 2026", cum: 24.61, dpr: "DPR-042" }],
    },
    "FN-4001": { cumQty: 0, log: [], checkpoints: [] },
    "WC-1001": {
      cumQty: 1200,
      log: [
        { date: "22 May 2026", qty: 500, by: "Vignesh (Site Mgr)" },
        { date: "21 May 2026", qty: 400, by: "Vignesh (Site Mgr)" },
        { date: "19 May 2026", qty: 300, by: "Manoj (Asst. Site Engg.)" },
      ],
      checkpoints: [
        { date: "19 May 2026", cum: 300, dpr: "DPR-049" },
        { date: "21 May 2026", cum: 700, dpr: "DPR-051" },
        { date: "22 May 2026", cum: 1200, dpr: "DPR-052" },
      ],
    },
    "EL-1001": {
      cumQty: 72,
      log: [
        { date: "22 May 2026", qty: 8, by: "Site Engineer (Tharun)", src: "subcon" },
        { date: "19 May 2026", qty: 24, by: "Site Engineer (Tharun)", src: "subcon" },
        { date: "12 May 2026", qty: 40, by: "Site Engineer (Tharun)", src: "subcon" },
      ],
      checkpoints: [],
    },
    "PL-1001": {
      cumQty: 130,
      log: [
        { date: "23 May 2026", qty: 30, by: "Site Engineer (Tharun)", src: "subcon" },
        { date: "19 May 2026", qty: 100, by: "Site Engineer (Tharun)", src: "subcon" },
      ],
      checkpoints: [],
    },
  },
};
