import type { BillConfig } from "@/features/billing/types";

/** BILL_CONFIG — ported verbatim from modos_v436.html (line 26174). */
export const BILL_CONFIG: BillConfig = {
  retentionPct: 5, // % held until DLP end
  gstPct: 18, // construction services GST
  tdsContractorPct: 2, // TDS 194C on contractor payments
  handoverMilestonePct: 15, // % of contract billed on handover (FAC)
  agingBuckets: [
    { min: 0, max: 30, label: "0–30 days", color: "#3B6D11" },
    { min: 31, max: 60, label: "31–60 days", color: "#854F0B" },
    { min: 61, max: 90, label: "61–90 days", color: "#A32D2D" },
    { min: 91, max: 9999, label: ">90 days", color: "#5C2E91" },
  ],
};

export const MEAS_APPROVER = "Vignesh (Site Manager)";
export const MEAS_ENGINEER = "Suresh (Billing Engg.)";

/** Reference "today" for ageing math (prototype pins this to 23 May 2026). */
export const BILL_TODAY = "23 May 2026";

/** EST_CATEGORIES subset used to resolve a line's Planning category (billMeasCat). */
export const EST_CATEGORIES: { id: string; label: string }[] = [
  { id: "SS", label: "Superstructure" },
  { id: "FW", label: "Foundation / Substructure" },
  { id: "WS", label: "Wall System / Cladding" },
  { id: "WC", label: "Wall System / Cladding" },
  { id: "RF", label: "Roof" },
  { id: "RC", label: "Roof" },
  { id: "FN", label: "Fenestrations" },
  { id: "FL", label: "Finishes & Flooring" },
  { id: "FC", label: "False Ceiling" },
  { id: "FU", label: "Furniture & FF&E" },
  { id: "RD", label: "Roadworks & External Dev." },
  { id: "LN", label: "Landscaping & Signage" },
  { id: "EL", label: "Electrical" },
  { id: "AC", label: "Air Conditioning / HVAC" },
  { id: "PL", label: "Plumbing & Sanitary" },
  { id: "FF", label: "Fire Fighting & Safety" },
];

/** LINE_QTY_BASIS — per_unit vs lot basis (drives per-cabin qty derivation). */
export const LINE_QTY_BASIS: Record<string, "per_unit" | "lot"> = {
  "SS-1001": "lot",
  "SS-1004": "lot",
  "SS-2001": "lot",
  "EL-1001": "lot",
  "EL-2001": "lot",
  "PL-1001": "lot",
  "FN-4001": "per_unit",
  "FN-4002": "per_unit",
  "WC-1001": "per_unit",
  "WC-1002": "per_unit",
  "RC-1001": "per_unit",
  "PL-5001": "per_unit",
};
