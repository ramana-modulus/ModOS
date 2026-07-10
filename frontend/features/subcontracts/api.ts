import { apiGet } from "@/lib/http";
import type {
  ScDoc,
  ScInvitedSubbie,
  ScLifecycleStage,
  ScMatNature,
  ScProject,
  ScType,
} from "./types";

/* ─────────────────────────── Shared view atoms ─────────────────────────── */

export interface ScKpiCell {
  label: string;
  value: string;
  /** Value colour (hex from the wireframe palette). */
  color?: string;
  sub?: string;
}

export interface ScStatusChip {
  label: string;
  bg: string;
  fg: string;
}

/* ─────────────────────────── Work Packages ─────────────────────────── */

export interface ScPackageRow {
  code: string;
  name: string;
  cat: string;
  catId: string;
  uom: string;
  scType: ScType;
  matNature: ScMatNature;
  totalQty: number;
  basisRate: number;
  budgetValue: number;
  curRate: { rate: number; label: string; src: "wo" | "l1" } | null;
  variancePct: number | null;
  stage: ScLifecycleStage;
  statusChip: ScStatusChip;
  /** Row action affordance (float enquiry vs. open lifecycle chevron). */
  action: "float" | "chevron";
  woValue: number;
}

export interface ScPackageGroup {
  catId: string;
  label: string;
  count: number;
  committed: number;
  woRaised: number;
  rows: ScPackageRow[];
}

export interface ScPackagesView {
  groups: ScPackageGroup[];
  counts: { all: number; manpower: number; lineitem: number; machinery: number };
  needRate: number;
  total: number;
}

/* ─────────────────────────── Enquiries ─────────────────────────── */

export interface ScEnquiryInvite extends ScInvitedSubbie {
  /** Rendered sub-line (₹rate for responded, reason for declined, etc.). */
  detail: string;
}

export interface ScEnquiryCard {
  key: string;
  enqId: string;
  isOpen: boolean;
  code: string;
  name: string;
  cat: string;
  catId: string;
  scType: ScType;
  matNature: ScMatNature;
  totalQty: number;
  uom: string;
  floatedBy: string;
  floatedAt: string;
  deadline: string;
  closedAt: string | null;
  closedReason: string | null;
  notes: string;
  invited: ScEnquiryInvite[];
  counts: { responded: number; pending: number; declined: number; noResp: number };
}

export interface ScEnquiryNeed {
  code: string;
  name: string;
  totalQty: number;
  uom: string;
}

export interface ScEnquiriesView {
  open: ScEnquiryCard[];
  closed: ScEnquiryCard[];
  needAction: ScEnquiryNeed[];
}

/* ─────────────────────────── Comparative / L1 ─────────────────────────── */

export interface ScQuoteCard {
  subbie: string;
  subbieName: string;
  subbieStatus: string;
  rate: number;
  leadDays: number;
  payTerms?: string;
  note?: string;
  selected: boolean;
  rank: number;
  isL1: boolean;
  total: number;
  variancePct: number;
  compliant: boolean;
}

export interface ScComparativeItem {
  code: string;
  name: string;
  scType: ScType;
  matNature: ScMatNature;
  uom: string;
  totalQty: number;
  basisRate: number;
  cat: string;
  catId: string;
  stage: ScLifecycleStage;
  sidebarBadge: { label: string; color: string };
  rfq: {
    enqId: string;
    isOpen: boolean;
    deadline: string;
    floatedBy: string;
    closedAt: string | null;
    closedReason: string | null;
    invited: ScInvitedSubbie[];
  } | null;
  wo: { woNo: string; subbie: string; subbieName: string; status: string } | null;
  quotes: ScQuoteCard[];
}

export interface ScComparativeView {
  items: ScComparativeItem[];
}

/* ─────────────────────────── Work Orders ─────────────────────────── */

export interface ScWorkOrderRow {
  key: string;
  woNo: string;
  code: string;
  cat: string;
  catId: string;
  packageName: string;
  subbie: string;
  subbieName: string;
  qty: number;
  uom: string;
  rate: number;
  value: number;
  status: string;
  materialIssued: boolean;
  amendmentCount: number;
  approver: { who: string; thresholdLabel: string; pending: boolean };
  statusChip: ScStatusChip;
  measurement: { cum: number; woQty: number; raCount: number; periodTo: string; full: boolean } | null;
}

export interface ScWorkOrdersView {
  rows: ScWorkOrderRow[];
  kpis: {
    raised: number;
    totalValue: number;
    pendingApproval: number;
    released: number;
    raStarted: number;
    variations: number;
  };
}

/* ─────────────────────────── Measurement (RA) ─────────────────────────── */

export interface ScMeasurementRa {
  ra: number;
  qtyThis: number;
  periodTo: string;
  certBy: string;
  bill: { billId: string; status: string } | null;
  isMach: boolean;
}

export interface ScMeasurementCard {
  key: string;
  code: string;
  name: string;
  cat: string;
  catId: string;
  uom: string;
  woNo: string;
  subbieName: string;
  woQty: number;
  rate: number;
  status: string;
  released: boolean;
  cum: number;
  pct: number;
  execLog: { date: string; qty: number }[];
  execTot: number;
  uncert: number;
  measurements: ScMeasurementRa[];
}

export interface ScMeasurementView {
  cards: ScMeasurementCard[];
  nextWeek: number;
  raisedWeeks: number[];
}

/* ─────────────────────────── SC Bills ─────────────────────────── */

export interface ScBillRow {
  bk: string;
  billId: string;
  billDate: string;
  raNo: number;
  periodTo: string;
  lineCodes: string[];
  lineDetail: string;
  gross: number;
  retention: number;
  retentionPct: number;
  gst: number;
  tds: number;
  net: number;
  status: string;
}

export interface ScBillSubbieSection {
  sub: string;
  subName: string;
  count: number;
  netTotal: number;
  rows: ScBillRow[];
}

export interface ScBillAwaiting {
  sub: string;
  subName: string;
  week: number;
  lines: { code: string; certQty: number }[];
  certVal: number;
}

export interface ScBillsView {
  sections: ScBillSubbieSection[];
  awaiting: ScBillAwaiting[];
  kpis: { awaitingClaim: number; raBills: number; held: number; forwarded: number; paid: number; totalGross: number };
}

/* ─────────────────────────── Bill Status (HQ read-only) ─────────────────────────── */

export interface ScBillStatusRow {
  billId: string;
  raNo: number;
  periodTo: string;
  status: string;
  gross: number;
}

export interface ScBillStatusGroup {
  sub: string;
  count: number;
  total: number;
  paid: number;
  rows: ScBillStatusRow[];
}

/* ─────────────────────────── Subcontractors ─────────────────────────── */

export interface ScSubbieRow {
  code: string;
  name: string;
  state: string;
  kindLabel: string;
  status: string;
  tier: ScStatusChip;
  rcCount: number;
  nTrades: number;
  rating: number | null;
  onTime: number | null;
  jobs: number;
  tradeSpend: number;
  tradeWo: number;
  woCount: number;
  compliance: { pf: string; esi: string; licence: string; gstRCM: boolean };
  compFlag: { dot: string; txt: string; col: string };
}

export interface ScSubbieTradeGroup {
  catId: string;
  label: string;
  count: number;
  inSp: boolean;
  rows: ScSubbieRow[];
}

export interface ScSubbieDetail {
  code: string;
  name: string;
  state: string;
  kindLabel: string;
  status: string;
  trades: string[];
  rating: number | null;
  jobs: number;
  onboardedOn: string;
  workOrders: string[];
  compliance: { pf: string; esi: string; licence: string; gstRCM: boolean };
  compliant: boolean;
  note?: string;
}

export interface ScSubbiesView {
  groups: ScSubbieTradeGroup[];
  orphanTrades: string[];
  newly: { code: string; name: string; trades: string[]; note?: string }[];
  multiTrade: number;
  details: Record<string, ScSubbieDetail>;
}

/* ─────────────────────────── Docs ─────────────────────────── */

export interface ScDocsView {
  standing: ScDoc[];
  scoped: ScDoc[];
  scopeName: string;
}

/* ─────────────────────────── Approval Workflow ─────────────────────────── */

export interface ScWorkflowNode {
  role: string;
  person: string;
  done: number;
  total: number;
  verb: string;
  state: "done" | "active" | "pending";
}

export interface ScWorkflowBand {
  who: string;
  role: string;
  thresholdLabel: string;
  approved: number;
  inBand: number;
}

export interface ScWorkflowPrompt {
  who: string;
  role: string;
  woNos: string[];
}

export interface ScWorkflowCard {
  code: string;
  name: string;
  cat: string;
  catId: string;
  woNo: string | null;
  subbieName: string;
  valueDisplay: string;
  routesTo: string;
  cls: "submitted" | "in-progress" | "pending";
  chips: { label: string; on: boolean }[];
  action: { kind: "approve" | "released" | "raise" | "l1"; who?: string };
}

export interface ScWorkflowView {
  nodes: ScWorkflowNode[];
  bands: ScWorkflowBand[];
  prompts: ScWorkflowPrompt[];
  cards: ScWorkflowCard[];
}

/* ─────────────────────────── Payload ─────────────────────────── */

export interface SubcontractsPayload {
  scope: { project: string; subProject: string };
  signed: boolean;
  today: string;
  projects: ScProject[];
  kpis: ScKpiCell[];
  packages: ScPackagesView;
  enquiries: ScEnquiriesView;
  comparative: ScComparativeView;
  workOrders: ScWorkOrdersView;
  measurement: ScMeasurementView;
  bills: ScBillsView;
  billStatus: ScBillStatusGroup[];
  subbies: ScSubbiesView;
  docs: ScDocsView;
  workflow: ScWorkflowView;
}

export interface ScScopeParams {
  project: string;
  subProject: string;
}

/** Typed client SDK for the subcontracts mock API. */
export const subcontractsApi = {
  getSubcontracts: (scope: ScScopeParams) =>
    apiGet<SubcontractsPayload>("/subcontracts", { project: scope.project, subProject: scope.subProject }),
};
