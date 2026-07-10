/**
 * Procurement domain models — faithful TypeScript port of the prototype's
 * `[DATA-PROC*]` stores. Everything downstream of the BOM is keyed by
 * `"{projectId}.{subProjectId}.{bomCode}"` (see `ProcKey`).
 */

/* ─────────────────────────── Keys ─────────────────────────── */

/** `"P1.SP1.SS-M-101"` — project.subProject.bomCode. */
export type ProcKey = string;
/** `"P1.SP1"` — project.subProject scope. */
export type ScopeKey = string;

/* ─────────────────────────── Projects ─────────────────────────── */

export interface SubProject {
  id: string;
  name: string;
  units: number;
  spec: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  type: string;
  stage: "Execution" | "Recce" | string;
  value: string;
  steelApplicable: boolean;
  startDate: string | null;
  duration: number;
  awarded: boolean;
  subProjects?: SubProject[];
}

/* ─────────────────────────── Engineering BOM (source) ─────────────────────────── */

export type EngStatus =
  | "approved"
  | "submitted"
  | "in_approval"
  | "in_progress"
  | "rework"
  | "pending";

export type MaterialSource = "auto" | "library";

export interface BomComponent {
  code: string;
  name: string;
  engQty: number;
  uom: string;
  rate: number;
  source?: MaterialSource;
  needsResource?: boolean;
  rfcOrigin?: string;
}

export interface EngBomLine {
  code: string;
  name: string;
  cat: string;
  boqQty: number;
  engQty: number;
  uom: string;
  budgRate: number;
  engStatus: EngStatus;
  released?: boolean;
  expanded?: boolean;
  components: BomComponent[];
}

/** Aggregated material demand for a sub-project (output of `aggregateBOM`). */
export interface AggregatedBomItem {
  code: string;
  name: string;
  uom: string;
  rate: number;
  totalQty: number;
  cat: string;
  sourceBOQs: string[];
  sources: { boq: string; qty: number; basis: string }[];
  basis: string;
  units: number;
}

/* ─────────────────────────── Vendors ─────────────────────────── */

export type VendorStatus = "active" | "probation" | "onboarding";
export type VendorCategory = "preferred" | "standard" | "probation";
export type MsmeStatus = "msme" | "not_msme" | "verifying";

export interface Vendor {
  code: string;
  name: string;
  state: string;
  primary: string;
  rating: number | null;
  status: VendorStatus;
  onboardedOn: string;
  handles: string[];
  category: VendorCategory;
  gstNumber: string;
  panVerified: boolean;
  msmeStatus: MsmeStatus;
  msmeCert?: string;
  complianceExpiry: string | null;
  paymentTermsDays: number;
  contact: { phone: string; email: string };
  newVendor?: boolean;
  note?: string;
  probationNote?: string;
}

/** Derived vendor scorecard (output of `getVendorPerformance`). */
export interface VendorPerformance {
  poCount: number;
  totalSpend: number;
  onTimePct: number | null;
  qualityAvg: string | null;
  rateStability: string | number | null;
  paymentCompliance: string;
  last90Spend: number;
}

/* ─────────────────────────── Rate contracts ─────────────────────────── */

export type RateContractStatus = "active" | "expired";

export interface RateContract {
  id: string;
  vendorCode: string;
  vendorName: string;
  materialCode: string;
  materialName: string;
  rate: number;
  uom: string;
  validFrom: string;
  validUntil: string;
  volumeCommitMin: number;
  volumeCommitMax: number;
  consumedYtd: number;
  paymentTerms: string;
  freightTerms: string;
  priceProtection?: string;
  status: RateContractStatus;
  signedBy: string;
  signedOn: string;
  docFile: string;
  notes: string;
}

/* ─────────────────────────── RFQs ─────────────────────────── */

export type RfqMode = "rfq" | "rate_contract";
export type InvitedVendorStatus = "responded" | "declined" | "invited" | "pending";

export interface InvitedVendor {
  vCode: string;
  name: string;
  invitedAt: string;
  status: InvitedVendorStatus;
  quoteId?: string;
  respondedAt?: string;
  reason?: string;
}

export interface Rfq {
  rfqId: string;
  mode: RfqMode;
  rcId?: string;
  lot?: number;
  floatedBy: string;
  floatedAt: string;
  deadline: string;
  qty: number;
  uom: string;
  invitedVendors: InvitedVendor[];
  closedAt: string | null;
  closedReason: string | null;
  notes: string;
}

/* ─────────────────────────── Quotes ─────────────────────────── */

export interface Quote {
  id: string;
  vCode: string;
  vendor: string;
  name?: string;
  rate: number;
  qty: number;
  leadTime: number;
  payTerms?: string;
  file: string;
  date: string;
  l: number;
  selected: boolean;
  note: string;
}

/* ─────────────────────────── Purchase orders ─────────────────────────── */

export type PoStatus =
  | "draft"
  | "approved"
  | "sent_to_zoho"
  | "partial_delivery"
  | "delivered";

export interface PurchaseOrder {
  poNumber: string;
  vCode: string;
  vendor: string;
  qty: number;
  uom: string;
  rate: number;
  value: number;
  status: PoStatus;
  poDate: string;
  expDelivery: string;
  zohoRef: string | null;
  deliveredQty: number;
  note: string;
}

export interface PoAmendment {
  amdId: string;
  date: string;
  by: string;
  type: string;
  before: Record<string, string | number>;
  after: Record<string, string | number>;
  reason: string;
  requiresReApproval: boolean;
  approvedBy: string;
  approvedOn: string;
}

/* ─────────────────────────── GRN ─────────────────────────── */

export interface Grn {
  grnId: string;
  poNumber: string;
  date: string;
  qtyReceived: number;
  condition: string;
  receivedBy: string;
  batchNos: string[];
  rejectedQty: number;
  note: string;
}

/* ─────────────────────────── Invoices / bills ─────────────────────────── */

export type InvoiceStatus =
  | "pending"
  | "received"
  | "match_pending"
  | "matched"
  | "discrepancy"
  | "forwarded_to_finance"
  | "paid";

export type MatchResult = "match" | "rate_mismatch" | "no_grn" | "qty_mismatch";

export interface Invoice {
  invId: string;
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
  status: InvoiceStatus;
  matchPO: MatchResult;
  matchGRN: MatchResult;
  rejectedQty?: number;
  acceptedQty?: number;
  forwardedToFinance: string | null;
  paidOn: string | null;
  payRef: string | null;
  note: string;
}

/* ─────────────────────────── Workflow ─────────────────────────── */

export type ApprovalStatus = "pending" | "in_progress" | "approved";
export type PoWorkflowStatus = "pending" | "sent";
export type VendorAckStatus = "pending" | "partial" | "acknowledged";

export interface WorkflowState {
  csStatus: ApprovalStatus;
  leadStatus: ApprovalStatus;
  approverStatus: ApprovalStatus;
  poStatus: PoWorkflowStatus;
  vendorAckStatus: VendorAckStatus;
  csDate?: string;
  leadDate?: string;
  approverDate?: string;
  poDate?: string;
  ackDate?: string;
}

/* ─────────────────────────── Documents / team ─────────────────────────── */

export interface ProcDoc {
  name: string;
  type: string;
  uploaded: string;
  by: string;
  size: string;
  status: string;
}

export interface Approver {
  name: string;
  role: string;
  thresholdLabel: string;
  min: number;
  max: number;
}

export interface ProcTeam {
  buyer: { name: string; role: string };
  lead: { name: string; role: string };
  approvers: { manager: Approver; coo: Approver; ceo: Approver };
}

/* ─────────────────────────── Derived / view models ─────────────────────────── */

/** Lifecycle stage of a BOM line, derived across the PROC_* stores. */
export type BomLineStatus =
  | "rfq_needed"
  | "quotes_open"
  | "l1_selected"
  | "po_raised"
  | "delivered";

export type LeadTimeBucket = "fast" | "medium" | "slow" | "unknown";

/** Split-sourcing summary for a BOM line (how much of the demand is spoken for). */
export interface Sourcing {
  sourced: number;
  total: number;
  remaining: number;
  lotCount: number;
  fully: boolean;
  none: boolean;
}

/** On-site need-by date derived from the WBS schedule (null when unscheduled). */
export interface RequiredBy {
  date: string;
  boq: string;
  label: string;
}

/** A BOM row enriched with its lifecycle position — the BOM tab's view model. */
export interface BomRow extends AggregatedBomItem {
  key: ProcKey;
  status: BomLineStatus;
  rfq: Rfq | null;
  quoteCount: number;
  l1: Quote | null;
  po: PurchaseOrder | null;
  grns: Grn[];
  receivedQty: number;
  activeRC: RateContract | null;
  leadBucket: LeadTimeBucket;
  committedValue: number;
  sourcing: Sourcing;
  requiredBy: RequiredBy | null;
}

/** Category band shown above each group of BOM rows. */
export interface CategoryGroup {
  cat: string;
  count: number;
  sourcedCount: number;
  committed: number;
}

/** Procurement KPI summary for a sub-project (feeds the 7-cell metric strip). */
export interface ProcurementSummary {
  totalItems: number;
  withQuotes: number;
  l1Selected: number;
  posRaised: number;
  committedValue: number;
  posFullGRN: number;
  posPartialGRN: number;
  apPending: number;
  apForwardedValue: number;
  rcCovered: number;
  rateConfirmed: number;
  maxRateVar: number;
  totalRateImpact: number;
  leadBuckets: Record<LeadTimeBucket, number>;
}

/* ─────────────────────────── BOM release history ─────────────────────────── */

export interface BomHistoryEntry {
  ver: string;
  date: string;
  by: string;
  changes: string;
  released: boolean;
  releasedAt?: string;
}
