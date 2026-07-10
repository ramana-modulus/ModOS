import type {
  AggregatedBomItem,
  BomLineStatus,
  BomRow,
  Grn,
  Invoice,
  ProcKey,
  ProcurementSummary,
  PurchaseOrder,
  Quote,
  RateContract,
  Rfq,
  WorkflowState,
} from "@/types/procurement";
import { procKey } from "./keys";
import { getActiveRC } from "./rate-contracts";
import { getLeadTimeBucket } from "./lead-time";

/** Keyed stores for a single sub-project scope, passed to the row builder. */
export interface LifecycleStores {
  rfqs: Record<ProcKey, Rfq>;
  quotes: Record<ProcKey, Quote[]>;
  pos: Record<ProcKey, PurchaseOrder>;
  grns: Record<ProcKey, Grn[]>;
  invoices: Record<ProcKey, Invoice>;
  workflow: Record<ProcKey, WorkflowState>;
  rateContracts: RateContract[];
}

/** Total received quantity across a PO's GRNs. */
export function poReceivedQty(grns: Grn[] | undefined): number {
  return (grns || []).reduce((sum, g) => sum + (g.qtyReceived || 0), 0);
}

/** Quantity spoken-for on a line: PO qty > RFQ qty > top quote qty. */
export function lotQty(args: {
  po: PurchaseOrder | null;
  rfq: Rfq | null;
  quotes: Quote[];
}): number {
  if (args.po) return args.po.qty || 0;
  if (args.rfq) return args.rfq.qty || 0;
  return args.quotes[0]?.qty ?? 0;
}

/** Sourcing rollup for a line (our seed has one lot per line; no split-sourcing). */
export function itemSourcing(
  total: number,
  parts: { po: PurchaseOrder | null; rfq: Rfq | null; quotes: Quote[] }
): import("@/types/procurement").Sourcing {
  const hasLot = Boolean(parts.po || parts.rfq || parts.quotes.length);
  const sourced = hasLot ? lotQty(parts) : 0;
  return {
    sourced,
    total,
    remaining: Math.max(0, total - sourced),
    lotCount: hasLot ? 1 : 0,
    fully: hasLot && sourced >= total,
    none: !hasLot,
  };
}

/** Derive a PO's rollup status from receipts + approval (faithful to the reconcile pass). */
export function poDerivedStatus(
  po: PurchaseOrder,
  receivedQty: number,
  workflowApproved: boolean
): PurchaseOrder["status"] {
  if (po.qty > 0 && receivedQty >= po.qty) return "delivered";
  if (receivedQty > 0) return "partial_delivery";
  if (po.zohoRef) return "sent_to_zoho";
  if (workflowApproved) return "approved";
  return "draft";
}

/** Derive the lifecycle stage of a BOM line across the stores. */
export function bomLineStatus(args: {
  po: PurchaseOrder | null;
  receivedQty: number;
  quotes: Quote[];
  rfq: Rfq | null;
}): BomLineStatus {
  const { po, receivedQty, quotes } = args;
  if (po && po.qty > 0 && receivedQty >= po.qty) return "delivered";
  if (po) return "po_raised";
  if (quotes.some((q) => q.selected)) return "l1_selected";
  if (quotes.length > 0) return "quotes_open";
  return "rfq_needed";
}

/** Enrich an aggregated BOM item with its full lifecycle position. */
export function buildBomRow(
  projId: string,
  spId: string,
  item: AggregatedBomItem,
  stores: LifecycleStores
): BomRow {
  const key = procKey(projId, spId, item.code);
  const rfq = stores.rfqs[key] ?? null;
  const quotes = stores.quotes[key] ?? [];
  const rawPo = stores.pos[key] ?? null;
  const grns = stores.grns[key] ?? [];
  const receivedQty = poReceivedQty(grns);
  const wf = stores.workflow[key];
  const workflowApproved = wf?.approverStatus === "approved";

  const po: PurchaseOrder | null = rawPo
    ? {
        ...rawPo,
        deliveredQty: receivedQty,
        status: poDerivedStatus(rawPo, receivedQty, workflowApproved),
      }
    : null;

  const l1 = quotes.find((q) => q.selected) ?? null;
  const leadSource = l1 ?? quotes[0] ?? null;

  return {
    ...item,
    key,
    rfq,
    quoteCount: quotes.length,
    l1,
    po,
    grns,
    receivedQty,
    activeRC: getActiveRC(stores.rateContracts, item.code),
    leadBucket: getLeadTimeBucket(leadSource ? leadSource.leadTime : null),
    committedValue: po ? po.value : 0,
    sourcing: itemSourcing(item.totalQty, { po, rfq, quotes }),
    requiredBy: null,
    status: bomLineStatus({ po, receivedQty, quotes, rfq }),
  };
}

/** The rate currently locked/quoted for a line: PO rate > selected-L1 rate. */
export function currentRate(row: BomRow): { rate: number; label: string; source: "po" | "l1" } | null {
  if (row.po) return { rate: row.po.rate, label: "PO Rate", source: "po" };
  if (row.l1) return { rate: row.l1.rate, label: "L1 Rate", source: "l1" };
  return null;
}

/** Aggregate the sub-project KPI summary from enriched rows + scope invoices. */
export function computeSummary(rows: BomRow[], invoices: Invoice[]): ProcurementSummary {
  const AP_PENDING_STATES = new Set(["received", "match_pending", "discrepancy"]);
  const leadBuckets: Record<string, number> = { fast: 0, medium: 0, slow: 0, unknown: 0 };
  let rateConfirmed = 0;
  let maxRateVar = 0;
  let totalRateImpact = 0;
  rows.forEach((r) => {
    leadBuckets[r.leadBucket] = (leadBuckets[r.leadBucket] ?? 0) + 1;
    const cur = currentRate(r);
    if (cur && r.rate) {
      rateConfirmed++;
      const v = ((cur.rate - r.rate) / r.rate) * 100;
      if (Math.abs(v) > Math.abs(maxRateVar)) maxRateVar = v;
      totalRateImpact += (cur.rate - r.rate) * r.totalQty;
    }
  });
  return {
    totalItems: rows.length,
    withQuotes: rows.filter((r) => r.quoteCount > 0).length,
    l1Selected: rows.filter((r) => r.l1).length,
    posRaised: rows.filter((r) => r.po).length,
    committedValue: rows.reduce((s, r) => s + r.committedValue, 0),
    posFullGRN: rows.filter((r) => r.po && r.receivedQty >= r.po.qty).length,
    posPartialGRN: rows.filter((r) => r.po && r.receivedQty > 0 && r.receivedQty < r.po.qty).length,
    apPending: invoices.filter((inv) => AP_PENDING_STATES.has(inv.status)).length,
    apForwardedValue: invoices
      .filter((inv) => inv.status === "forwarded_to_finance")
      .reduce((s, inv) => s + inv.netPayable, 0),
    rcCovered: rows.filter((r) => r.activeRC).length,
    rateConfirmed,
    maxRateVar,
    totalRateImpact,
    leadBuckets: leadBuckets as Record<import("@/types/procurement").LeadTimeBucket, number>,
  };
}
