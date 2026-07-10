/**
 * Billing (Running Account / RA) module — domain types.
 *
 * The MEASUREMENT SPINE (`BillMeas`) is the single parent of both billing faces:
 *   - Client face (AR): measured qty × BOQ client rate (or milestone % × value)
 *   - Execution face (AP): per sub-scope payable to the executor(s) under the line
 * Client RA bills and subcontractor payables are PROJECTIONS of this spine, never
 * independent stores — so they cannot diverge from what was measured.
 *
 * Faithful port of the `BILL_*` stores + `renderBilling*` logic in modos_v436.html.
 */

/* ─────────────────────────── Config ─────────────────────────── */

export interface AgingBucket {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface BillConfig {
  retentionPct: number;
  gstPct: number;
  tdsContractorPct: number;
  handoverMilestonePct: number;
  agingBuckets: AgingBucket[];
}

/* ─────────────────────────── Projects ─────────────────────────── */

export interface BillSubProject {
  id: string;
  name: string;
  units: number;
  spec: string;
  /** Sub-project contract value (seeded — not present on the prototype PROJECTS array). */
  contractValue?: number;
}

export interface BillProject {
  id: string;
  code: string;
  name: string;
  client: string;
  type: string;
  estimate?: number;
  subProjects: BillSubProject[];
}

/* ─────────────────────────── Measurement spine ─────────────────────────── */

export type MeasStatus = "measured" | "draft" | "submitted" | "approved" | "rejected" | "billed";
export type BillingBasis = "unitrate" | "milestone";
export type ExecMode = "lineitem" | "manpower" | "inhouse" | "material";
export type ExecBasis = "output" | "manday" | "milestone";

/** One dimensional row on a measurement sheet (No × L × B × H, unit-weight, or portion). */
export interface MeasurementRow {
  id: string;
  desc: string;
  no?: number;
  L?: number;
  B?: number;
  H?: number;
  unitWt?: number;
  portion?: number;
}

/** An execution sub-scope under a spine line — names the accountable payee. */
export interface Execution {
  scope: string;
  subbie: string;
  subbieName: string;
  mode: ExecMode;
  basis: ExecBasis;
  value: number;
  qty?: number;
  rate?: number;
  manDays?: number;
  dayRate?: number;
  woRef?: string | null;
  /** Legacy SC-certified qty (drives the over-certification reconcile flag). */
  scCertified?: number;
}

export interface MeasHistoryEntry {
  v: string;
  submittedBy?: string;
  submittedOn?: string;
  reviewedBy?: string;
  reviewedOn?: string;
  decision?: string;
  comments?: string;
}

/** A single measured line — the spine of billing. */
export interface BillMeas {
  id: string;
  code: string;
  name: string;
  uom: string;
  cycle: string;
  measuredQty: number;
  clientRate?: number;
  billingBasis?: BillingBasis;
  plannedTotalQty?: number;
  milestoneValue?: number;
  clearedBy?: string | null;
  measuredBy?: string;
  measuredOn?: string | null;
  status: MeasStatus;
  measVersion?: string;
  submittedBy?: string;
  submittedOn?: string | null;
  approvedBy?: string;
  approvedOn?: string | null;
  rejectedBy?: string;
  rejectedOn?: string | null;
  rejectReason?: string;
  targetQty?: number;
  toMeasure?: boolean;
  billedOn?: string | null;
  measHistory?: MeasHistoryEntry[];
  measurements?: MeasurementRow[];
  execution?: Execution[];
  qcGate?: string;
}

/* ─────────────────────────── Client RA bills (AR) ─────────────────────────── */

export type ClientBillStatus = "draft" | "submitted" | "certified" | "invoiced" | "paid";

export interface ClientBillLineItem {
  code: string;
  name: string;
  uom: string;
  plannedQty?: number;
  cumDone?: number;
  prevBilled?: number;
  thisBill?: number;
  rate: number;
  amount: number;
  certifiedQty?: number;
  writeOffQty?: number;
  held?: boolean;
  note?: string;
}

export interface ClientBill {
  id: string;
  billNo: string;
  billDate: string;
  periodFrom: string;
  periodTo: string;
  status: ClientBillStatus;
  kind?: "handover" | "retention";
  preparedBy?: string;
  submittedOn?: string | null;
  certifiedOn?: string | null;
  certifiedBy?: string;
  invoicedOn?: string | null;
  invoiceNo?: string;
  paidOn?: string | null;
  paymentRef?: string;
  claimedAmount: number;
  certifiedAmount?: number | null;
  retention?: number | null;
  netCertified?: number | null;
  gst?: number | null;
  finalPayable?: number | null;
  reductionNote?: string;
  milestoneNote?: string;
  lineItems: ClientBillLineItem[];
  attachments: string[];
  blockers?: string[];
}

/* ─────────────────────────── Vendor bills (incoming AP) ─────────────────────────── */

export type VendorBillType = "material_supplier" | "services" | "subcontractor_ra";
export type VendorBillStatus =
  | "received"
  | "verifying"
  | "qc_signed"
  | "certified"
  | "sent_to_finance"
  | "paid"
  | "rejected";

export interface VendorBillLineItem {
  bomCode?: string | null;
  desc: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
}

export interface VendorBill {
  id: string;
  billNo: string;
  vendor: string;
  vendorCode: string;
  type: VendorBillType;
  billDate: string;
  receivedOn: string;
  poRef?: string | null;
  status: VendorBillStatus;
  grossAmount: number;
  tds: number;
  retention: number;
  gst: number;
  netPayable: number;
  lineItems: VendorBillLineItem[];
  verifiedBy?: string | null;
  verifiedOn?: string | null;
  qcSignOff?: string | null;
  certifiedBy?: string | null;
  certifiedOn?: string | null;
  sentToFinanceOn?: string | null;
  paidOn?: string | null;
  blockers?: string[];
}

/* ─────────────────────────── Subcontractor bills (SC AP) ─────────────────────────── */

export type ScBillStatus = "matched" | "forwarded_to_finance" | "paid";

export interface ScBillLine {
  code: string;
  certQty: number;
  qty: number;
  rate: number;
  woRate: number;
  amount: number;
  matchWO: string;
  matchRA: string;
}

export interface ScBill {
  key: string;
  billId: string;
  billDate: string;
  subbie: string;
  raNo: number;
  cycle: string;
  periodTo: string;
  lines: ScBillLine[];
  gross: number;
  retentionPct: number;
  gstPct: number;
  tdsPct: number;
  matchWO: string;
  matchRA: string;
  status: ScBillStatus;
  forwardedOn?: string | null;
  payRef?: string | null;
  note?: string;
}

/* ─────────────────────────── View models ─────────────────────────── */

export interface BillingKpis {
  contractValue: number;
  arGross: number;
  arCertified: number;
  arReceived: number;
  apOutstanding: number;
  apManpower: number;
  margin: number;
  marginPct: number;
  raLabel: string;
}

/** A measured line projected for a tab (cheap derived fields precomputed server-side). */
export interface MeasCardView {
  meas: BillMeas;
  clientValue: number;
  execCost: number;
  category: { id: string; label: string };
  scType: { label: string; fg: string; bg: string } | null;
  mode: string;
  modeMeta: { label: string; fields: string[]; formula: string };
  reconcileIssues: string[];
  statusMeta: { label: string; color: string; bg: string };
}

export interface MeasurementGroup {
  cycle: string;
  upcoming: boolean;
  cards: MeasCardView[];
  statusCounts: Record<string, number>;
}

export interface RaClientLine {
  code: string;
  name: string;
  uom: string;
  measuredQty: number;
  clientRate?: number;
  value: number;
  isMilestone: boolean;
}

export interface RaClientGroup {
  cycle: string;
  statusLabel: string;
  pill: "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";
  accent: string;
  lines: RaClientLine[];
  pending: number;
  gross: number;
  retention: number;
  gst: number;
  net: number;
  billed: boolean;
}

export interface RaSubcScope {
  code: string;
  scope: string;
  mode: ExecMode;
  value: number;
  qty?: number;
  rate?: number;
  uom: string;
}

export interface RaSubcSubbie {
  subbie: string;
  name: string;
  lineGross: number;
  manGross: number;
  scopes: RaSubcScope[];
}

export interface RaSubcGroup {
  cycle: string;
  statusLabel: string;
  pill: "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";
  accent: string;
  subbies: RaSubcSubbie[];
  manTotal: number;
  manCount: number;
  gross: number;
  retention: number;
  tds: number;
  gst: number;
  net: number;
}

/* ─────────────────────────── Cabin RA roll-up ─────────────────────────── */

export type CabinQcStatus = "pass" | "hold" | "fail" | "pending";
export type CabinStage = "notready" | "unbilled" | "billed" | "certified" | "paid";

export interface CabinRow {
  n: number;
  qc: CabinQcStatus;
  stage: CabinStage;
  ar: number;
  ap: number;
  margin: number;
  billNo: string | null;
  billDate: string | null;
}

export interface CabinStageBucket {
  n: number;
  gross: number;
  net: number;
}

export interface CabinRollup {
  units: number;
  unbilled: CabinStageBucket;
  billed: CabinStageBucket;
  certified: CabinStageBucket;
  paid: CabinStageBucket;
  pending: number;
  totalAr: number;
  totalAp: number;
}

/* ─────────────────────────── Bill Register ─────────────────────────── */

export interface RegAgeingBucket {
  label: string;
  color: string;
  value: number;
}

export interface RegCycleRow {
  cycle: string;
  arNet: number;
  arGross: number;
  apNet: number;
  apGross: number;
  margin: number;
  arStatus: "billed" | "partial" | "claimable" | "none";
  apStatus: "paid" | "certified" | "pending" | "none";
}

export interface RegisterView {
  arGross: number;
  arNet: number;
  arClaimable: number;
  arBilled: number;
  arCertified: number;
  arReceived: number;
  arOutstanding: number;
  apGross: number;
  apNet: number;
  apCert: number;
  apPaid: number;
  apOutstanding: number;
  apManpower: number;
  margin: number;
  marginPct: number;
  cycles: RegCycleRow[];
  arAgeing: RegAgeingBucket[];
  apAgeing: RegAgeingBucket[];
}

/* ─────────────────────────── Payload ─────────────────────────── */

export interface BillingView {
  scope: string;
  project: BillProject;
  subProject: BillSubProject;
  subProjects: BillSubProject[];
  units: number;
  config: BillConfig;
  measEngineer: string;
  measApprover: string;
  kpis: BillingKpis;
  measurement: MeasurementGroup[];
  measurementPending: number;
  measurementFlagged: number;
  raClient: RaClientGroup[];
  cabinRollup: CabinRollup | null;
  cabins: CabinRow[];
  vendorBills: VendorBill[];
  raSubc: RaSubcGroup[];
  scBills: ScBill[];
  register: RegisterView;
}

export interface ProjectsPayload {
  projects: BillProject[];
}
