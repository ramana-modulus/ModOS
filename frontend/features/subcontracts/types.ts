/**
 * Subcontracts domain models — the "Procurement-for-works" twin.
 * Faithful to the prototype's `SC_*` stores (modos_v436.html).
 *
 * Lifecycle (works, not goods): Work Packages → Enquiries → Comparative/L1
 * → Work Orders → Measurement (RA) → SC Bills → Subcontractors.
 */

/** `scType` — how a package is executed (make-vs-buy kickoff decision). */
export type ScType = "manpower" | "lineitem" | "machinery";
/** How MH sources the material behind a labour package. */
export type ScMatNature = "engineered" | "boughtout" | "freeissue" | null;

export type ScSubbieKind = "labour" | "composite" | "machinery" | "turnkey";
export type ScSubbieStatus = "active" | "onboarding" | "blacklisted";
export type ScComplianceState = "valid" | "lapsed" | "pending";

export type ScWorkOrderStatus = "released" | "pending_approval";
export type ScInviteStatus = "responded" | "pending" | "declined" | "no_response";
export type ScBillStatus =
  | "matched"
  | "forwarded_to_finance"
  | "paid"
  | "discrepancy"
  | "query"
  | "awaiting";
export type ScMatch = "match" | "mismatch";

/* ─────────────────────────── Raw stores ─────────────────────────── */

export interface ScDoc {
  name: string;
  type: string;
  uploaded: string;
  by: string;
  size: string;
  status: string;
}

export interface ScCompliance {
  pf: ScComplianceState;
  esi: ScComplianceState;
  licence: ScComplianceState;
  gstRCM: boolean;
}

export interface ScSubbie {
  code: string;
  name: string;
  kind: ScSubbieKind;
  trades: string[];
  state: string;
  rating: number | null;
  jobs: number;
  status: ScSubbieStatus;
  onboardedOn: string;
  compliance: ScCompliance;
  note?: string;
  newVendor?: boolean;
}

export interface ScEnquiryQuote {
  subbie: string;
  rate: number;
  leadDays: number;
  selected: boolean;
  payTerms?: string;
  note?: string;
}

export interface ScWorkOrder {
  woNo: string;
  subbie: string;
  scType: ScType;
  rate: number;
  qty: number;
  value: number;
  retentionPct: number;
  status: ScWorkOrderStatus;
  raisedOn: string;
  approvedBy: string;
  materialIssued: boolean;
  note: string;
  extensionTo?: string;
}

export interface ScExecEntry {
  date: string;
  qty: number;
  by: string;
}

export interface ScMeasurement {
  ra: number;
  periodTo: string;
  qtyThis: number;
  cumQty: number;
  certBy: string;
}

export interface ScBillLine {
  code: string;
  certQty: number;
  qty: number;
  rate: number;
  woRate: number;
  amount: number;
  matchWO: ScMatch;
  matchRA: ScMatch;
}

export interface ScBill {
  billId: string;
  billDate: string;
  subbie: string;
  raNo: number;
  periodTo: string;
  lines: ScBillLine[];
  gross: number;
  retentionPct: number;
  gstPct: number;
  tdsPct: number;
  matchWO: ScMatch;
  matchRA: ScMatch;
  status: ScBillStatus;
  forwardedOn: string | null;
  payRef: string | null;
  note: string;
}

export interface ScApprovalTier {
  max: number;
  role: string;
  who: string;
}

export interface ScWoAmendment {
  amdId: string;
  date: string;
  by: string;
  type: string;
  before: Record<string, string | number>;
  after: Record<string, string | number>;
  reason: string;
  approvedBy: string;
  approvedOn: string;
}

/** A subcontract work package (kickoff consumption view). */
export interface ScPackage {
  code: string;
  name: string;
  cat: string;
  catId: string;
  uom: string;
  scType: ScType;
  matNature: ScMatNature;
  basisRate: number;
  totalQty: number;
  budgetValue: number;
}

/* ─────────────────────────── Derived enquiry envelope ─────────────────────────── */

export interface ScInvitedSubbie {
  code: string;
  name: string;
  invitedAt: string;
  status: ScInviteStatus;
  respondedAt?: string;
  reason?: string;
}

export interface ScRfq {
  enqId: string;
  mode: "enquiry";
  floatedBy: string;
  floatedAt: string;
  deadline: string;
  invitedSubbies: ScInvitedSubbie[];
  closedAt: string | null;
  closedReason: string | null;
  notes: string;
}

/* ─────────────────────────── Project scope ─────────────────────────── */

export interface ScSubProject {
  id: string;
  name: string;
  units: number;
  spec?: string;
}

export interface ScProject {
  id: string;
  code: string;
  name: string;
  client: string;
  type: string;
  subProjects: ScSubProject[];
}

/** Bill money math (gross → retention → taxable → +GST −TDS → net). */
export interface ScBillCalc {
  retention: number;
  taxable: number;
  gst: number;
  tds: number;
  net: number;
}

export type ScLifecycleStage =
  | "none"
  | "floated"
  | "compare"
  | "l1"
  | "wo_pending"
  | "released"
  | "measuring"
  | "bill";
