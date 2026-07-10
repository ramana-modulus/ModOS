/**
 * Pure presentation helpers for the procurement tables — faithful ports of the
 * inline logic in `renderProcBom` (statusOf, rateVarPill, procBomLotSubRows).
 * They return `.pill` class suffixes so the tables can use the ported design
 * system classes verbatim.
 */
import type { BomRow } from "@/types/procurement";
import { fmtCompact } from "@/lib/format";

export type PillClass = "pg" | "pa" | "pr" | "pb" | "pgr" | "pac";

export interface PillMeta {
  pill: PillClass;
  label: string;
}

/** Detailed lifecycle status for a BOM line (`statusOf`). */
export function bomStatus(row: BomRow): PillMeta {
  const s = row.sourcing;
  if (s.none) return { pill: "pr", label: "RFQ Needed" };
  if (s.remaining > 0)
    return { pill: "pa", label: `Sourcing ${fmtCompact(s.sourced)}/${fmtCompact(s.total)}` };

  if (row.po) {
    const ordered = row.po.qty;
    const recd = row.receivedQty;
    if (ordered > 0 && recd >= ordered) return { pill: "pg", label: "Delivered" };
    if (recd > 0) return { pill: "pa", label: `Partial · ${Math.round((recd / ordered) * 100)}% recd` };
    if (row.po.status === "sent_to_zoho") return { pill: "pb", label: "PO @ Zoho" };
    if (row.po.status === "approved") return { pill: "pa", label: "PO Approved" };
    return { pill: "pgr", label: "PO Draft" };
  }
  if (row.l1) return { pill: "pa", label: "L1 Selected · PO Pending" };
  if (row.quoteCount > 0) return { pill: "pa", label: "Quotes · Selection Pending" };
  if (row.rfq && !row.rfq.closedAt) return { pill: "pa", label: "RFQ Floated · awaiting quotes" };
  return { pill: "pr", label: "RFQ Needed" };
}

/** The rate to compare against budget: PO rate (locked) > L1 rate (selected). */
export function currentRateView(row: BomRow): { rate: number; label: string; source: "po" | "l1" } | null {
  if (row.po) return { rate: row.po.rate, label: "PO Rate", source: "po" };
  if (row.l1) return { rate: row.l1.rate, label: "L1 Rate", source: "l1" };
  return null;
}

/** Rate variance pill (`rateVarPill`): ≤5% green, ≤12% amber, >12% red. */
export function rateVarMeta(budgRate: number, actualRate?: number | null): PillMeta | null {
  if (!actualRate || !budgRate) return null;
  const v = ((actualRate - budgRate) / budgRate) * 100;
  if (Math.abs(v) < 0.5) return { pill: "pg", label: "±0%" };
  const pill: PillClass = Math.abs(v) <= 5 ? "pg" : Math.abs(v) <= 12 ? "pa" : "pr";
  return { pill, label: `${v > 0 ? "+" : ""}${v.toFixed(1)}%` };
}

export interface LotRow {
  no: number;
  vendor: string;
  qty: number;
  rate: number | null;
  when: string;
  label: string;
  pill: PillClass;
  lotCode: string;
  balance?: boolean;
}

/** Delivery-lot breakdown for a BOM line (`procBomLotSubRows`). */
export function bomLotRows(row: BomRow): LotRow[] {
  const rows: LotRow[] = [];
  let lotNo = 0;
  const lotCode = row.code;
  const committedStates = new Set(["sent_to_zoho", "partial_delivery", "delivered"]);

  if (row.sourcing.lotCount > 0) {
    if (row.po) {
      let recd = 0;
      for (const g of row.grns) {
        recd += g.qtyReceived || 0;
        lotNo++;
        rows.push({ no: lotNo, vendor: row.po.vendor, qty: g.qtyReceived, rate: row.po.rate, when: g.date || "", label: "Delivered", pill: "pg", lotCode });
      }
      const pending = Math.max(0, row.po.qty - recd);
      if (pending > 0) {
        lotNo++;
        const committed = committedStates.has(row.po.status);
        const label = committed ? "GRN pending" : row.po.status === "approved" ? "Awaiting dispatch" : "PO draft";
        rows.push({ no: lotNo, vendor: row.po.vendor, qty: pending, rate: row.po.rate, when: row.po.expDelivery ? `ETA ${row.po.expDelivery}` : "", label, pill: committed ? "pa" : "pgr", lotCode });
      }
    } else {
      lotNo++;
      let label: string;
      let pill: PillClass;
      if (row.l1) {
        label = "L1 selected · PO pending";
        pill = "pa";
      } else if (row.quoteCount > 0) {
        label = `${row.quoteCount} quotes · pending`;
        pill = "pa";
      } else if (row.rfq && !row.rfq.closedAt) {
        label = "RFQ floated";
        pill = "pa";
      } else {
        label = "Sourcing";
        pill = "pgr";
      }
      const vendor = row.l1?.vendor ?? (row.rfq ? `${row.rfq.invitedVendors.length} invited` : "—");
      rows.push({ no: lotNo, vendor, qty: row.sourcing.sourced, rate: row.l1?.rate ?? null, when: "", label, pill, lotCode });
    }
  }

  if (row.sourcing.remaining > 0) {
    rows.push({
      no: 0,
      vendor: "",
      qty: row.sourcing.remaining,
      rate: null,
      when: "",
      label: row.sourcing.none ? "Not yet sourced" : "Balance to source",
      pill: "pgr",
      lotCode,
      balance: true,
    });
  }
  return rows;
}
