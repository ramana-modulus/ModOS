/**
 * Estimation (BOQ costing) domain models — faithful to the prototype's `EST_*`
 * stores and the `calcRow` costing math. Estimation is the module where a BD
 * lead in the "costing" stage is priced line-by-line into a quotable total.
 */

/** Global costing config rates (prototype `OVERHEADS_PCT` … `GST_PCT`).
 * Percentages are stored exactly as the prototype: OH/Markup/Transport/Wastage
 * as fractions (0.10 = 10%), GST as a whole number (18 = 18%). */
export interface EstConfig {
  overheadsPct: number;
  markupPct: number;
  transportPct: number;
  wastagePct: number;
  gstPct: number;
}

/** A line-item grouping (mirrors `LIB_CATEGORIES`). */
export interface EstCategory {
  id: string;
  label: string;
  discipline: string;
}

/** A costing version — only the active one is editable in the prototype. */
export interface EstVersion {
  v: string;
  label: string;
  date: string;
  by: string;
  note: string;
  active: boolean;
}

/** One costing-sheet line. `transport`/`wastage` are per-item overrides; when
 * null they fall back to `base × TRANSPORT_PCT` / `base × WASTAGE_PCT`. */
export interface EstItem {
  sno: string;
  cat: string;
  subcat: string;
  code: string;
  desc: string;
  unit: string;
  qty: number;
  material: number | null;
  machinery: number | null;
  manpower: number | null;
  transport: number | null;
  wastage: number | null;
  gst: number;
  remarks: string;
  link?: string;
}

/** A single-trade row in the approval workflow. */
export interface EstTrade {
  id: string;
  name: string;
  assignee: string;
  status: "pending" | "in_progress" | "submitted" | "unassigned";
  submittedOn: string | null;
  sections: string[];
}

/** Sub-project approval workflow (Maker → Checker → Approver → BD). */
export interface EstSubProjectWf {
  status: string;
  trades: EstTrade[];
  checker: string;
  checkerStatus: string;
  checkerNote: string | null;
  approver: string;
  approverStatus: string;
  approverNote: string | null;
  quoteGenerated: boolean;
}

/** A sub-project (e.g. "Porta Cabin A ×59") — owns its own item snapshot. */
export interface EstSubProject {
  id: string;
  name: string;
  spec: string;
  units: number;
  consignee: string;
  deliveryDays: number;
  status: "costing" | "submitted" | "approved";
  items: EstItem[];
  wf: EstSubProjectWf;
}

/** An RFI (Request For Information) raised from Estimation to Contracts. */
export interface EstRfi {
  id: string;
  tenderId: string;
  raisedBy: string;
  raisedOn: string;
  question: string;
  answer: string;
  answeredBy: string;
  answeredOn: string;
  status: "open" | "answered" | "closed";
}

/** A BD lead in the costing queue (the Estimation "project"). */
export interface EstLead {
  id: string;
  ref: string;
  co: string;
  client: string;
  tech: string[];
  desc: string;
  area: number;
  dl: string | null;
  docs: string[];
  /** Project-level workflow status; drives whether the Summary tab unlocks. */
  wfStatus: string;
}

/* ─────────────────────────── Computed row shape ─────────────────────────── */

/** The per-line costing breakdown produced by `calcRow`. */
export interface EstRowCalc {
  mat: number;
  mach: number;
  man: number;
  tr: number;
  wa: number;
  prime: number;
  oh: number;
  mu: number;
  rateExcl: number;
  rateIncl: number;
  amtExcl: number;
  amtIncl: number;
}
