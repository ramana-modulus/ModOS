/**
 * API response shapes shared by the mock route handlers and the typed client.
 * These are the view models the repository builds from the raw stores.
 */
import type {
  BomRow,
  CategoryGroup,
  Grn,
  Invoice,
  Project,
  ProcurementSummary,
  PurchaseOrder,
  Quote,
  RateContract,
  Rfq,
  Vendor,
  VendorPerformance,
} from "@/types/procurement";
import type { ApproverRole } from "@/features/procurement/domain/approvals";

/** Standard success envelope. */
export interface ApiEnvelope<T> {
  data: T;
}

/** Standard error envelope. */
export interface ApiError {
  error: { message: string; code?: string };
}

export interface ScopeParams {
  project: string;
  subProject: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface BomListResponse {
  scope: string;
  rows: BomRow[];
  summary: ProcurementSummary;
  categories: string[];
  categoryGroups: CategoryGroup[];
  /** Category order following the Engineering parent-BOQ order. */
  catOrder: string[];
}

export interface RfqRow {
  key: string;
  code: string;
  name: string;
  uom: string;
  rfq: Rfq;
}

export interface RfqCard {
  key: string;
  code: string;
  name: string;
  uom: string;
  lotN: number;
  rfq: Rfq;
  quotes: Quote[];
}

export interface RfqCatGroup {
  cat: string;
  cards: RfqCard[];
}

export interface RfqBypassed {
  code: string;
  name: string;
  uom: string;
  qty: number;
  closedAt: string | null;
  rc: { id: string; vendorName: string; rate: number; uom: string } | null;
}

export interface RfqNeedAction {
  code: string;
  name: string;
  uom: string;
  totalQty: number;
}

export interface RfqView {
  counts: { open: number; closed: number; bypassed: number };
  needAction: RfqNeedAction[];
  openGroups: RfqCatGroup[];
  closedGroups: RfqCatGroup[];
  bypassed: RfqBypassed[];
}

export interface QuoteGroup {
  key: string;
  code: string;
  name: string;
  uom: string;
  totalQty: number;
  budgetRate: number;
  quotes: Quote[];
  l1: Quote | null;
  activeRC: RateContract | null;
}

export interface QuoteItem {
  key: string;
  code: string;
  name: string;
  uom: string;
  cat: string;
  totalQty: number;
  sourceBOQs: string[];
  sources: { boq: string; qty: number; basis: string }[];
  quotes: Quote[];
  activeRC: RateContract | null;
  rfq: Rfq | null;
  po: PurchaseOrder | null;
  anyVendorHandles: boolean;
}

export interface QuotesView {
  items: QuoteItem[];
  catOrder: string[];
}

export interface PoRow {
  key: string;
  code: string;
  name: string;
  po: PurchaseOrder;
  receivedQty: number;
  approverRole: ApproverRole;
  approverName: string;
}

export interface GrnGroup {
  key: string;
  code: string;
  name: string;
  po: PurchaseOrder | null;
  grns: Grn[];
  orderedQty: number;
  receivedQty: number;
}

export interface BillRow {
  key: string;
  code: string;
  name: string;
  invoice: Invoice;
}

export interface VendorRow {
  vendor: Vendor;
  performance: VendorPerformance;
  rateContractCount: number;
}

/* ─────────────────────────── Docs / Release Log / Workflow views ─────────────────────────── */

export interface DocsView {
  standing: import("@/types/procurement").ProcDoc[];
  docs: import("@/types/procurement").ProcDoc[];
  subProjectName: string;
}

export interface ReleaseComponent {
  code: string;
  name: string;
  engQty: number;
  uom: string;
  state: { label: string; status: string; vendor?: string; value?: number };
}
export interface ReleaseEvent {
  date: string;
  boqCode: string;
  boqName: string;
  boqCat: string;
  ver: string;
  changes: string;
  by: string;
  isSuperseded: boolean;
  newerVer: string | null;
  components: ReleaseComponent[];
}

export interface WorkflowNode {
  role: string;
  person: string;
  status: string;
  state: "done" | "active" | "pending";
}
export interface WorkflowMatrixCell {
  roleKey: string;
  name: string;
  role: string;
  thresholdLabel: string;
  count: number;
  approved: number;
  initials: string;
}
export interface WorkflowItem {
  code: string;
  name: string;
  uom: string;
  qty: number;
  value: number;
  vendor: string | null;
  wf: import("@/types/procurement").WorkflowState;
  approverRole: string;
  approverName: string;
  thresholdLabel: string;
  poNumber: string | null;
}
export interface WorkflowCatGroup {
  cat: string;
  items: WorkflowItem[];
}
export interface WorkflowView {
  nodes: WorkflowNode[];
  matrix: WorkflowMatrixCell[];
  prompts: { lead: string[]; manager: string[]; coo: string[]; ceo: string[] };
  groups: WorkflowCatGroup[];
  leadName: string;
}
