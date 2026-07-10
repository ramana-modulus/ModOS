/**
 * Finance module types — faithful to the prototype's finance data stores and
 * the derived view models the renderer consumed (renderFinance* family).
 *
 * Raw seed shapes (FIN_*, BILL_*, SC_*) mirror the single-file HTML verbatim;
 * view models are the payloads the client page renders.
 */

/* ─────────────────────────── Raw seed: treasury / FIN ─────────────────────────── */

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  type: string;
  ifsc: string;
}

export interface FinConfig {
  bankAccounts: BankAccount[];
  workingCapitalLimit: number;
  workingCapitalDrawn: number;
  zohoSyncOn: string;
  tallySyncOn: string;
}

/** A weekly batch of vendor bills paid together (scheduled → approved → executed). */
export interface PaymentRun {
  id: string;
  weekOf: string;
  status: "scheduled" | "executed";
  billIds: string[];
  totalAmount: number;
  bankAccount: string;
  approvedBy: string | null;
  approvedOn: string | null;
  executedOn: string | null;
  note: string;
}

/** A reconciled client payment (money IN). */
export interface FinReceipt {
  id: string;
  date: string;
  clientBillRef: string;
  project: string;
  subProj: string;
  invoiceNo: string;
  amount: number;
  receivedVia: string;
  refNo: string;
  bankAccount: string;
  status: string;
  reconciledOn: string | null;
  note: string;
}

export interface RecurringCost {
  desc: string;
  amount: number;
}

export interface FinPnlRevenue {
  claimed: number;
  certified: number;
  invoiced: number;
  received: number;
}

export interface FinPnlCostBreakdown {
  material: number;
  labour: number;
  overheads: number;
}

export interface FinPnlCost {
  committed: number;
  incurred: number;
  paid: number;
  breakdown: FinPnlCostBreakdown;
}

export interface FinPnl {
  contractValue: number;
  durationDays: number;
  elapsedDays: number;
  progressPct: number;
  revenue: FinPnlRevenue;
  cost: FinPnlCost;
  estimatedCostToComplete: number;
  projectedTotalCost: number;
  projectedProfit: number;
  projectedMarginPct: number;
  budgetedMarginPct: number;
}

/* ─────────────────────────── Raw seed: billing ─────────────────────────── */

export interface BillConfig {
  retentionPct: number;
  gstPct: number;
  tdsContractorPct: number;
  handoverMilestonePct: number;
  agingBuckets: { min: number; max: number; label: string; color: string }[];
}

export interface ClientBillLineItem {
  code: string;
  name: string;
  uom: string;
  plannedQty: number;
  cumDone: number;
  prevBilled: number;
  thisBill: number;
  rate: number;
  amount: number;
  note?: string;
  held?: boolean;
}

/** Outgoing RA bill (Modulus → Client). */
export interface ClientBill {
  id: string;
  billNo: string;
  billDate: string;
  periodFrom: string;
  periodTo: string;
  status: string;
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
  lineItems: ClientBillLineItem[];
  attachments: string[];
  blockers?: string[];
  /** Cumulative amount received against this invoice (short-pay tracking). */
  receivedToDate?: number;
}

export interface VendorBillLineItem {
  bomCode?: string;
  desc: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
}

/** Incoming bill from a vendor / subcontractor. */
export interface VendorBill {
  id: string;
  billNo: string;
  vendor: string;
  vendorCode: string;
  type: string;
  billDate: string;
  receivedOn: string;
  poRef: string;
  status: string;
  grossAmount: number;
  tds: number;
  retention: number;
  gst: number;
  netPayable: number;
  lineItems: VendorBillLineItem[];
  verifiedBy: string | null;
  verifiedOn: string | null;
  qcSignOff: string | null;
  certifiedBy: string | null;
  certifiedOn: string | null;
  sentToFinanceOn: string | null;
  paidOn: string | null;
  blockers?: string[];
  payRef?: string | null;
}

/* ─────────────────────────── Raw seed: subcontract ─────────────────────────── */

export interface ScSubbie {
  code: string;
  name: string;
  kind: string;
  trades: string[];
  state: string;
  rating: number | null;
  jobs: number;
  status: string;
  onboardedOn: string;
  compliance: { pf: string; esi: string; licence: string; gstRCM: boolean };
  note: string;
}

export interface ScWorkOrder {
  woNo: string;
  subbie: string;
  scType: string;
  rate: number;
  qty: number;
  value: number;
  retentionPct: number;
  status: string;
  raisedOn: string;
  approvedBy: string;
  materialIssued: boolean;
  note: string;
}

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
  matchWO: string;
  matchRA: string;
  status: string;
  forwardedOn: string | null;
  payRef: string | null;
  note: string;
}

/* ─────────────────────────── View models (payload) ─────────────────────────── */

export interface FinSubProject {
  id: string;
  name: string;
  units: number;
  spec: string;
}

export interface FinProject {
  id: string;
  name: string;
  code: string;
  client: string;
  type: string;
  subProjects: FinSubProject[];
}

export interface FinanceKpis {
  totalBank: number;
  bankCount: number;
  wcAvailable: number;
  apInboxValue: number;
  apInboxCount: number;
  arOutstandingValue: number;
  arOutstandingCount: number;
  weekIn: number;
  weekOut: number;
  weekNet: number;
}

export type ApSource = "material" | "vendor" | "sc";

/** A single normalized AP bill in the unified Finance queue. */
export interface UnifiedApBill {
  id: string;
  billNo: string;
  vendor: string;
  type: string;
  poRef: string | null;
  grossAmount: number;
  netPayable: number;
  status: string;
  certifiedOn: string | null;
  src: ApSource;
  bridgedFromProc: boolean;
  lineCount: number;
}

export interface PaymentRunBill {
  id: string;
  vendor: string;
  poRef: string | null;
  netPayable: number;
  lineCount: number;
}

export interface PaymentRunView {
  id: string;
  weekOf: string;
  status: "scheduled" | "executed";
  totalAmount: number;
  bankName: string;
  note: string | null;
  approvedBy: string | null;
  approvedOn: string | null;
  executedOn: string | null;
  bills: PaymentRunBill[];
}

export interface FinanceApView {
  inbox: UnifiedApBill[];
  inboxCount: number;
  scheduledRuns: PaymentRunView[];
  executedRuns: PaymentRunView[];
}

export interface ArOutstandingRow {
  id: string;
  invoiceNo: string;
  client: string;
  invoicedOn: string | null;
  daysOutstanding: number;
  overdue: boolean;
  finalPayable: number;
  receivedToDate: number;
  balance: number;
  partPaid: boolean;
}

export interface ArReceiptRow {
  id: string;
  date: string;
  clientBillRef: string;
  invoiceNo: string;
  amount: number;
  receivedVia: string;
  refNo: string;
  reconciledOn: string | null;
  note: string;
}

export interface FinanceArView {
  outstanding: ArOutstandingRow[];
  outstandingCount: number;
  reconciled: ArReceiptRow[];
  reconciledCount: number;
}

export type CashflowCategory = "AP" | "AP-pending" | "AR" | "Recurring";
export type Confidence = "high" | "medium" | "low";

export interface CashflowItem {
  desc: string;
  amount: number;
  category: CashflowCategory;
  confidence: Confidence;
  note?: string;
}

/** The bare forecast bucket produced by computeFinForecast (pre-totals). */
export interface ForecastWeek {
  weekOf: string;
  label: string;
  isCurrent: boolean;
  inflows: CashflowItem[];
  outflows: CashflowItem[];
}

export interface CashflowWeek extends ForecastWeek {
  inTotal: number;
  outTotal: number;
  net: number;
  projectedBalance: number;
  /** Chart splits of the outflow bar. */
  outVendor: number;
  outLabour: number;
  outOverhead: number;
}

export interface CashflowBank {
  id: string;
  name: string;
  balance: number;
  ifsc: string;
}

export interface FinanceCashflowView {
  banks: CashflowBank[];
  ccAvailable: number;
  ccLimit: number;
  totalLiquidity: number;
  openingBalance: number;
  weeks: CashflowWeek[];
}

export interface FinancePnlView {
  present: boolean;
  name: string;
  contractValue: number;
  durationDays: number;
  elapsedDays: number;
  progressPct: number;
  timePct: number;
  units: number;
  revenue: FinPnlRevenue;
  receivable: number;
  cost: FinPnlCost;
  estimatedCostToComplete: number;
  projectedTotalCost: number;
  projectedProfit: number;
  projectedMarginPct: number;
  budgetedMarginPct: number;
  profitDelta: number;
  profitPositive: boolean;
}

export interface FinancePayload {
  scope: { project: string; subProject: string };
  projects: FinProject[];
  meta: { cfo: string; accounts: string; zohoSyncOn: string };
  kpis: FinanceKpis;
  ap: FinanceApView;
  ar: FinanceArView;
  cashflow: FinanceCashflowView;
  pnl: FinancePnlView;
}
