/**
 * Finance domain — pure ports of the prototype's finance math:
 *   • scBillCalc          — SC bill money math (gross → retention → +GST −TDS → net)
 *   • financeApUnified    — the unified AP feed (material invoices + direct/service
 *                           vendor bills + subcontractor RA bills), one queue
 *   • computeFinForecast  — week-wise expected inflows + outflows, DERIVED live
 *
 * These are faithful to modos_v436.html. The only simplification is the per-cabin
 * RA overlay (cabinArRollup) for cabinized sub-projects, which lives in the
 * un-ported Billing module — AR here follows the standard whole-document path.
 */
import type { Invoice, PurchaseOrder } from "@/types/procurement";
import type {
  BillConfig,
  CashflowItem,
  ClientBill,
  ForecastWeek,
  PaymentRun,
  RecurringCost,
  ScBill,
  ScSubbie,
  ScWorkOrder,
  UnifiedApBill,
  VendorBill,
} from "@/features/finance/types";
import { FIN_AR_CREDIT_DAYS, FIN_CERT_CYCLE_DAYS } from "@/features/finance/data/fin-config";

/** Demo "today" (Day 53) — matches OPS_TODAY / MODOS_TODAY in the prototype. */
export const OPS_TODAY = "23 May 2026";

/** Lenient date parse — epoch 0 on failure (bucketing clamps overdue to week 0). */
export function opsParseDate(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

/** SC bill money math (gross → retention → taxable → +GST −TDS → net). */
export function scBillCalc(b: ScBill): {
  retention: number;
  taxable: number;
  gst: number;
  tds: number;
  net: number;
} {
  const retention = Math.round((b.gross * b.retentionPct) / 100);
  const taxable = b.gross - retention;
  const gst = Math.round((taxable * b.gstPct) / 100);
  const tds = Math.round((taxable * b.tdsPct) / 100);
  return { retention, taxable, gst, tds, net: taxable + gst - tds };
}

/** Stores the AP feed reads from. */
export interface ApStores {
  procInvoices: Record<string, Invoice>;
  billVendor: Record<string, VendorBill[]>;
  scBills: Record<string, ScBill>;
  scSubbies: Record<string, ScSubbie>;
  scWorkOrders: Record<string, ScWorkOrder>;
}

const PO_BY_CODE: Record<string, string> = {
  "SS-M-101": "MH-PO-26-001",
  "SS-M-102": "MH-PO-26-002",
  "SS-M-103": "MH-PO-26-003",
};

/**
 * [v182/v346] Unified AP feed. Finance pays ONE queue:
 *   • material vendor bills — single-sourced from the procurement 3-way-match
 *     spine (PROC_INVOICES); only forwarded/paid invoices are AP
 *   • direct / service bills — from BILL_VENDOR
 *   • subcontractor RA bills — from SC_BILLS (net via scBillCalc)
 */
export function financeApUnified(key: string, s: ApStores): UnifiedApBill[] {
  const out: UnifiedApBill[] = [];

  const mStMap: Record<string, string> = {
    forwarded_to_finance: "sent_to_finance",
    paid: "paid",
  };
  for (const pk of Object.keys(s.procInvoices)) {
    if (pk.indexOf(key + ".") !== 0) continue;
    const inv = s.procInvoices[pk];
    if (!inv) continue;
    if (inv.status !== "forwarded_to_finance" && inv.status !== "paid") continue; // held/discrepancy not yet AP
    const code = pk.slice(key.length + 1);
    out.push({
      id: inv.invId,
      billNo: inv.invId,
      vendor: inv.vendor,
      type: "material_supplier",
      poRef: PO_BY_CODE[code] ?? code,
      grossAmount: inv.invValue,
      netPayable: inv.netPayable,
      status: mStMap[inv.status] ?? "verifying",
      certifiedOn: inv.forwardedToFinance ?? inv.invDate,
      src: "material",
      bridgedFromProc: true,
      lineCount: 1,
    });
  }

  for (const b of s.billVendor[key] ?? []) {
    out.push({
      id: b.id,
      billNo: b.billNo,
      vendor: b.vendor,
      type: b.type,
      poRef: b.poRef || null,
      grossAmount: b.grossAmount,
      netPayable: b.netPayable,
      status: b.status,
      certifiedOn: b.certifiedOn,
      src: "vendor",
      bridgedFromProc: false,
      lineCount: b.lineItems.length,
    });
  }

  const scMap: Record<string, string> = {
    matched: "verifying",
    forwarded_to_finance: "sent_to_finance",
    paid: "paid",
    query: "verifying",
    discrepancy: "verifying",
  };
  for (const bk of Object.keys(s.scBills)) {
    if (!bk.startsWith(key + ".")) continue;
    const b = s.scBills[bk];
    if (!b) continue;
    const c = scBillCalc(b);
    const who = s.scSubbies[b.subbie]?.name ?? b.subbie;
    const firstCode = b.lines[0]?.code ?? null;
    const wo = firstCode ? s.scWorkOrders[key + "." + firstCode] : undefined;
    out.push({
      id: b.billId,
      billNo: b.billId,
      vendor: who + " (Subcontractor)",
      type: "subcontractor_ra",
      poRef: wo?.woNo ?? "RA-" + b.raNo,
      grossAmount: b.gross,
      netPayable: c.net,
      status: scMap[b.status] ?? "verifying",
      certifiedOn: b.forwardedOn ?? b.billDate,
      src: "sc",
      bridgedFromProc: false,
      lineCount: b.lines.length,
    });
  }

  return out;
}

/** Stores the cashflow forecast reads from (org-wide). */
export interface ForecastStores extends ApStores {
  procPos: Record<string, PurchaseOrder>;
  billClient: Record<string, ClientBill[]>;
  billConfig: BillConfig;
  paymentRuns: PaymentRun[];
  recurring: RecurringCost[];
}

const DAY = 86_400_000;

/**
 * [v181] Week-wise cashflow forecast — GRAPH MATH, recomputed from the live
 * spine (not a seeded table):
 *   OUTFLOWS = vendor bills (timed by payment run) + SC bills (net) +
 *              open PO balances (value − billed, incl. GST) + recurring costs
 *   INFLOWS  = client RA bills timed by lifecycle status (invoice/cert/submit/draft)
 */
export function computeFinForecast(s: ForecastStores): ForecastWeek[] {
  const t0 = opsParseDate(OPS_TODAY);
  const fmtD = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const weekNo = (d: Date) =>
    Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / DAY + 1) / 7);
  const bucketOf = (dateStr: string, offsetDays = 0): number => {
    const d = opsParseDate(dateStr);
    if (d.getTime() === 0) return 1;
    d.setDate(d.getDate() + offsetDays);
    return Math.max(0, Math.min(3, Math.floor((d.getTime() - t0.getTime()) / DAY / 7)));
  };

  const outs: CashflowItem[][] = [[], [], [], []];
  const ins: CashflowItem[][] = [[], [], [], []];

  // ── AP: vendor bills (BILL_VENDOR), timed by payment run ──
  const billToRun: Record<string, PaymentRun> = {};
  s.paymentRuns.forEach((r) => r.billIds.forEach((id) => (billToRun[id] = r)));
  for (const k of Object.keys(s.billVendor)) {
    for (const b of s.billVendor[k] ?? []) {
      const run = billToRun[b.id];
      if (b.status === "paid" || (run && run.status === "executed")) continue;
      const net = b.netPayable || b.grossAmount || 0;
      if (!(net > 0)) continue;
      if (b.status === "sent_to_finance") {
        outs[run ? bucketOf(run.weekOf) : 0]!.push({
          desc: `${b.vendor} (${b.id}) — ${(b.type || "").replace(/_/g, " ")}`,
          amount: net,
          category: "AP",
          confidence: "high",
          note: run ? `Scheduled in ${run.id}` : "In AP inbox — unscheduled, assumed this week",
        });
      } else if (["received", "verifying", "qc_signed", "certified"].includes(b.status)) {
        outs[1]!.push({
          desc: `${b.vendor} (${b.id}) — in 3-way match`,
          amount: net,
          category: "AP-pending",
          confidence: "medium",
          note: "Outflow after verify → certify → Finance",
        });
      }
    }
  }

  // ── AP: subcontractor RA bills (SC_BILLS), net via scBillCalc ──
  for (const bk of Object.keys(s.scBills)) {
    const b = s.scBills[bk];
    if (!b || b.status === "paid") continue;
    const net = scBillCalc(b).net;
    const who = s.scSubbies[b.subbie]?.name ?? b.subbie;
    if (b.status === "forwarded_to_finance") {
      outs[0]!.push({
        desc: `${who} — ${b.billId}`,
        amount: net,
        category: "AP",
        confidence: "high",
        note: "SC RA bill in Finance AP",
      });
    } else if (b.status === "matched") {
      outs[1]!.push({
        desc: `${who} — ${b.billId} (matched)`,
        amount: net,
        category: "AP-pending",
        confidence: "medium",
        note: "3-way matched — awaiting Billing forward",
      });
    }
  }

  // ── AP: open PO commitments (value − billed), timed by expected delivery ──
  for (const k of Object.keys(s.procPos)) {
    const po = s.procPos[k];
    if (!po || !(po.value > 0)) continue;
    let billed = 0;
    for (const bk of Object.keys(s.billVendor)) {
      for (const b of financeApUnified(bk, s)) {
        if (b.poRef === po.poNumber) billed += b.grossAmount || 0;
      }
    }
    const remaining = po.value - billed;
    if (remaining <= 1) continue;
    const partial = po.status === "partial_delivery" || po.status === "delivered";
    outs[bucketOf(po.expDelivery, 7)]!.push({
      desc: `${po.vendor} — ${po.poNumber} balance`,
      amount: Math.round(remaining * 1.18),
      category: "AP-pending",
      confidence: partial ? "medium" : "low",
      note: `Open PO commitment net of billed (incl. GST) — trigger: ${partial ? "balance delivery" : "delivery"}`,
    });
  }

  // ── Recurring site costs (config) ──
  for (let i = 0; i < 4; i++) {
    s.recurring.forEach((r) =>
      outs[i]!.push({ desc: r.desc, amount: r.amount, category: "Recurring", confidence: "high" })
    );
  }

  // ── AR: client RA bills (BILL_CLIENT), timed by lifecycle status ──
  const estPayable = (b: ClientBill): number =>
    b.finalPayable ??
    Math.round(
      (b.claimedAmount || 0) *
        (1 - s.billConfig.retentionPct / 100) *
        (1 + s.billConfig.gstPct / 100)
    );
  for (const k of Object.keys(s.billClient)) {
    for (const b of s.billClient[k] ?? []) {
      if (b.status === "paid") continue;
      const amt = estPayable(b);
      if (!(amt > 0)) continue;
      if (b.status === "invoiced") {
        const due = amt - (b.receivedToDate || 0); // net of part receipts
        if (due > 0)
          ins[bucketOf(b.invoicedOn ?? "", FIN_AR_CREDIT_DAYS)]!.push({
            desc: `Client receipt ${b.id} (${b.invoiceNo || "invoiced"})${(b.receivedToDate || 0) > 0 ? " — balance" : ""}`,
            amount: due,
            category: "AR",
            confidence: "high",
            note: `Invoice + ${FIN_AR_CREDIT_DAYS}-day terms`,
          });
      } else if (b.status === "certified") {
        ins[bucketOf(b.certifiedOn ?? "", 2 + FIN_AR_CREDIT_DAYS)]!.push({
          desc: `Client receipt ${b.id} (certified)`,
          amount: amt,
          category: "AR",
          confidence: "medium",
          note: "Certified — invoice pending",
        });
      } else if (b.status === "submitted") {
        ins[bucketOf(b.submittedOn ?? "", FIN_CERT_CYCLE_DAYS + FIN_AR_CREDIT_DAYS)]!.push({
          desc: `Client receipt ${b.id} (submitted)`,
          amount: amt,
          category: "AR",
          confidence: "low",
          note: `Subject to ${FIN_CERT_CYCLE_DAYS}-day cert cycle + payment terms`,
        });
      } else if (b.status === "draft" && (b.claimedAmount || 0) > 0) {
        ins[2]!.push({
          desc: `Client receipt ${b.id} (draft projection)`,
          amount: amt,
          category: "AR",
          confidence: "low",
          note: "If submitted this week → cert cycle → payment terms",
        });
      }
    }
  }

  // ── Assemble the 4 week buckets ──
  return [0, 1, 2, 3].map((i) => {
    const ws = new Date(t0);
    ws.setDate(ws.getDate() + 1 + i * 7);
    const w = weekNo(ws);
    outs[i]!.sort((a, b) => b.amount - a.amount);
    ins[i]!.sort((a, b) => b.amount - a.amount);
    return {
      weekOf: fmtD(ws),
      label: i === 0 ? `This Week (W${w})` : i === 1 ? `Next Week (W${w})` : `W${w}`,
      isCurrent: i === 0,
      inflows: ins[i]!,
      outflows: outs[i]!,
    };
  });
}
