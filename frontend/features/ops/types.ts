/**
 * Operations (site execution) domain models — faithful to the prototype's
 * `OPS_*` stores (renderOps and its sub-renderers). One project/sub-project is
 * scoped at a time; `"{proj}.{sub}"` is the store key throughout.
 */

/* ─────────────────────────── Projects & scope ─────────────────────────── */

export interface OpsSubProject {
  id: string;
  name: string;
  units: number;
  spec: string;
}

export interface OpsProject {
  id: string;
  code: string;
  name: string;
  client: string;
  type: string;
  duration: number;
  subProjects?: OpsSubProject[];
}

/* ─────────────────────────── Indents ─────────────────────────── */

export interface IndentType {
  id: number;
  name: string;
  cat: string;
  routesTo: string | null;
  indentor: string;
  approver: string;
  escalation: string;
  docs: string;
  sla: string;
  priority: string;
}

export interface IndentCat {
  label: string;
  color: string;
  bg: string;
}

export type IndentStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "escalated"
  | "completed";

export type SlaState = "within" | "warn" | "breached";

export interface Indent {
  id: string;
  typeId: number;
  cat: string;
  raisedAt: string;
  raisedBy: string;
  forCode: string | null;
  subject: string;
  priority: string;
  status: IndentStatus;
  approver: string;
  slaDeadline: string;
  slaState: SlaState;
  docs: string[];
  approvedAt?: string;
  approvedBy?: string;
  machineCode?: string;
  machineName?: string;
  hireQty?: number;
  hireUom?: string;
  estRate?: number;
  neededBy?: string;
  routedTo?: string | null;
}

/* ─────────────────────────── Scope tracking ─────────────────────────── */

export type ScType = "lineitem" | "manpower" | "self" | null;

/** Line metadata seed (BOQ line + its planned total + execution mode). */
export interface ScopeItem {
  code: string;
  name: string;
  cat: string;
  uom: string;
  /** Authoritative sub-project total quantity (the progress denominator). */
  plannedTotal: number;
  /** Calculated Engineering-BOM total (for the executed-vs-BOM variance strip). */
  bomTotal: number;
  scType: ScType;
  matNature?: "freeissue" | "boughtout" | null;
}

export interface ScopeLogEntry {
  date: string;
  qty: number | null;
  by: string;
  src?: string;
}

export interface ScopeCheckpoint {
  date: string;
  cum?: number;
  milestoneIdx?: number;
  dpr: string;
}

export interface ScopeRecord {
  cumQty: number;
  log: ScopeLogEntry[];
  checkpoints: ScopeCheckpoint[];
}

/* ─────────────────────────── DPR / DLR ─────────────────────────── */

export interface DprDelta {
  code: string;
  qty?: number;
  uom?: string;
  type?: "pct" | "milestone";
  name?: string;
  fromMs?: string;
  toMs?: string;
  fromPct?: number;
  toPct?: number;
  fromQty?: number;
  toQty?: number;
  cabin?: number | "all";
  cabins?: number[];
}

export interface DprManpower {
  skill: string;
  count: number;
  forCode: string | null;
}

export interface DprViewpoint {
  name: string;
  photos: string[];
  date: string;
  previous?: string[];
}

export interface Dpr {
  id: string;
  date: string;
  status: string;
  by: string;
  deltas: DprDelta[];
  log: string[];
  manpower: DprManpower[];
  blockers: string[];
  tomorrow: string[];
  viewpoints: DprViewpoint[];
  reportedPct: number;
  expectedEnd: string;
  cabin?: number | "all";
  units?: number;
}

export interface DlrEntry {
  skill: string;
  count: number;
  hours: number;
  forCode: string | null;
  rate: number | null;
  note?: string;
}

export interface Dlr {
  id: string;
  date: string;
  mode: "detailed" | "aggregated";
  by: string;
  entries: DlrEntry[];
}

/* ─────────────────────────── Site log ─────────────────────────── */

export interface SiteLogChain {
  at: string;
  note: string;
  by: string;
}

export type SiteLogKind = "event" | "hindrance";

export interface SiteLogEntry {
  id: string;
  date: string;
  kind: SiteLogKind;
  cat: string;
  text: string;
  by: string;
  status: string;
  routedTo?: string;
  routedOn?: string;
  forCode?: string;
  refId?: string;
  resolvedOn?: string;
  chain?: SiteLogChain[];
}

/* ─────────────────────────── QC requests ─────────────────────────── */

export type QcStatus = "requested" | "scheduled" | "inspected" | "closed";

export interface QcRequest {
  id: string;
  code: string;
  week: string;
  requestedOn: string;
  by: string;
  status: QcStatus;
  note: string;
  inspRef?: string;
  closedNote?: string;
  qty?: number;
  cabins?: number[];
  cabinQty?: Record<number, number>;
}

/* ─────────────────────────── Store ─────────────────────────── */

export type IssueReason = "utilised" | "wasted" | "damaged" | "returned";

export interface StoreIssue {
  id: string;
  date: string;
  matCode: string;
  qty: number;
  uom: string;
  toCode: string | null;
  reason: IssueReason;
  by: string;
  note: string;
}

/** GRN receipt (ported from the shared procurement spine, P1.SP1 subset). */
export interface GrnReceipt {
  grnId: string;
  poNumber: string;
  vendor: string;
  date: string;
  qtyReceived: number;
  orderedQty: number;
  uom: string;
  condition: "good" | "damaged";
  receivedBy: string;
  batchNos: string[];
  rejectedQty: number;
  note: string;
}

/** Vendor invoice (3-way match), ported from the procurement spine. */
export interface VendorBill {
  invId: string;
  code: string;
  vendor: string;
  invDate: string;
  invQty: number;
  invRate: number;
  invValue: number;
  gstPct: number;
  gst: number;
  tdsPct: number;
  tds: number;
  netPayable: number;
  status: string;
  matchPO: string;
  matchGRN: string;
  forwardedToFinance: string | null;
  paidOn: string | null;
  payRef: string | null;
  note: string;
}

/* ─────────────────────────── Handover ─────────────────────────── */

export type SnagStatus = "open" | "rectified" | "verified";

export interface Snag {
  id: string;
  area: string;
  lineCode: string;
  desc: string;
  severity: "minor" | "major" | "critical";
  raisedBy: string;
  raisedAt: string;
  status: SnagStatus;
  fixedBy: string | null;
  fixedAt: string | null;
  evidence: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
}

export interface Handover {
  facStatus: "not_started" | "snag_walk" | "snag_closure" | "fac_pending" | "fac_signed";
  progressPct?: number;
  snagList: Snag[];
  asBuilts: string[];
  dlpStart: string | null;
  dlpEnd: string | null;
  dlpIssues: string[];
  projectedCompletion?: string;
  note: string;
}
